use std::collections::HashMap;
use std::fmt;
use std::env::var;

use serde_json::Value;

use gstreamer::State::Paused;
use gstreamer::State::Playing;
use gstreamer::parse::launch;
use gstreamer::glib::Error;
use gstreamer::Format;
use gstreamer::Pipeline;
use gstreamer::ClockTime;
use gstreamer::Buffer;
use gstreamer::init;
use gstreamer::Caps;
use gstreamer::prelude::ElementExt;
use gstreamer::prelude::Cast;
use gstreamer::prelude::GstBinExt;
 use gstreamer::prelude::ObjectExt;

use gfxinfo::active_gpu;

use gstreamer_app::AppSrc;

use crate::storage::Storage;

#[derive(Debug)]
pub enum StreamErrorKind {
  StreamRegistry,
  Pipeline,
  Source
}

pub struct StreamError {
  kind: StreamErrorKind,
  message: String
}

impl StreamError {
  pub fn new(kind: StreamErrorKind, message: &str) -> Self {
    return Self {
      kind: kind,
      message: message.to_string()
    }
  }
}

impl fmt::Display for StreamError {
  fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
    return write!(formatter, "{:?}: {}", self.kind, self.message);
  }
}

pub struct StreamRegistry {
  streams: HashMap<String, Stream>
}

impl StreamRegistry {
  pub fn new() -> Self {
    let streams = HashMap::new();

    return StreamRegistry {
      streams: streams
    };
  }

  pub fn add(&mut self, app: &str, stream: Stream) {
    self.streams.insert(app.to_string(), stream);
  }

  pub fn remove(&mut self, app: &str) {
    self.streams.remove(app);
  }

  pub fn get_mut(&mut self, app: &str) -> Result<&mut Stream, StreamError> {
    match self.streams.get_mut(app) {
      Some(stream) => {
        return Ok(stream);
      },
      None => {
        return Err(StreamError::new(StreamErrorKind::StreamRegistry, "No stream found"));
      }
    };
  }

  pub fn get(&self, app: &str) -> Result<&Stream, StreamError> {
    match self.streams.get(app) {
      Some(stream) => {
        return Ok(stream);
      },
      None => {
        return Err(StreamError::new(StreamErrorKind::StreamRegistry, "No stream found"));
      }
    };
  }
}

#[derive(PartialEq)]
pub enum StreamState {
  Pause,
  Play
}

pub struct StreamSettings {
  value: Value
}

impl StreamSettings {
  pub fn new(value: Value) -> StreamSettings {
    return StreamSettings {
      value: value
    };
  }
  
  pub fn storage_access_key(&self) -> String {
    let default_storage_key = match var("STORAGE_ACCESS_KEY") {
      Ok(value) => value,
      Err(_) => "".to_string()
    };

    return self.value["storage"]["access_key"].as_str().unwrap_or(&default_storage_key).to_string();
  }

  pub fn storage_secret_key(&self) -> String {
    let default_secret_key = match var("STORAGE_SECRET_KEY") {
      Ok(value) => value,
      Err(_) => "".to_string()
    };

    return self.value["storage"]["secret_key"].as_str().unwrap_or(&default_secret_key).to_string();
  }

  pub fn storage_host(&self) -> String {
    let default_host = match var("STORAGE_HOST") {
      Ok(value) => value,
      Err(_) => "http://storage:9000".to_string()
    };

    return self.value["storage"]["host"].as_str().unwrap_or(&default_host).to_string();
  }

  pub fn storage_region(&self) -> String {
    let default_region = match var("STORAGE_REGION") {
      Ok(value) => value,
      Err(_) => "us-east-1".to_string()
    };

    return self.value["storage"]["region"].as_str().unwrap_or(&default_region).to_string();
  }

  pub fn storage_bucket(&self) -> String {
    let default_bucket = match var("STORAGE_BUCKET") {
      Ok(value) => value,
      Err(_) => "streams".to_string()
    };

    return self.value["storage"]["bucket"].as_str().unwrap_or(&default_bucket).to_string();
  }

  pub fn keyframe_interval(&self) -> u64 {
    return self.value["keyframe_interval"].as_u64().unwrap_or(1);
  }

  pub fn gop(&self) -> u64 {
    return 60 * self.keyframe_interval();
  }

  pub fn transcoder_type(&self) -> String {
    return match var("TRANSCODER_TYPE") {
      Ok(value) => value,
      Err(_) => "GPU".to_string()
    };
  }

  pub fn value(&self) -> &Value {
    return &self.value;
  }
}

pub struct Stream {
  pipeline: Pipeline,
  video: AppSrc,
  audio: AppSrc,
  session: String,
  state: StreamState,
  vendor: String,
  settings: StreamSettings
}

impl Stream {
  pub fn warmup() -> Result<(), Error> {
    return init();
  }

  pub async fn new(session: &str, settings: StreamSettings) -> Result<Self, StreamError> {
    let storage = Storage::new(&settings);
    match storage.create(&settings.storage_bucket()).await {
      Err(error) => {
        return Err(StreamError::new(StreamErrorKind::Pipeline, &error.to_string()));
      },
      _ => {}
    };

    let default_fps = 60;
    let transcoder_type = settings.transcoder_type();
    let (decoder, encoder, vendor): (String, String, String) = match active_gpu() {
      Ok(gpu) => {
        let vendor = gpu.vendor();
        println!("GPU vendor: {0}", vendor);

        if transcoder_type == "GPU" && vendor == "Nvidia" {
          println!("Nvidia GPU detected. Using accelerated encoder/decoder");

          (format!("nvh264dec"), format!("nvh264enc name=video_encoder gop-size={0}", default_fps * settings.keyframe_interval()), vendor.to_string())
        } else {
          println!("No supported GPU detected. Fallbacking on software transcoding");

          (format!("avdec_h264"), format!("x264enc name=video_encoder key-int-max={0}", default_fps * settings.keyframe_interval()), "CPU".to_string())
        }
      },
      Err(_) => {
        if transcoder_type == "GPU" {
          println!("Error detecting GPU. Fallbacking on software transcoding");
        }

        (format!("avdec_h264"), format!("x264enc name=video_encoder key-int-max={0}", default_fps * settings.keyframe_interval()), "CPU".to_string())
      }
    };

    let pipeline_definition = format!("appsrc name=video_src format=time is-live=true ! h264parse ! {8} ! videoconvert ! {7} ! h264parse ! sink.video appsrc name=audio_src format=time is-live=true ! aacparse ! sink.audio awss3hlssink name=sink bucket=\"{5}\" key-prefix=\"{0}\" access-key=\"{1}\" secret-access-key=\"{2}\" force-path-style=true region=\"{4}\" endpoint-uri=\"{3}\" hlssink::playlist-length=0 hlssink::max-files=0 hlssink::target-duration={6}", session, settings.storage_access_key(), settings.storage_secret_key(), settings.storage_host(), settings.storage_region(), settings.storage_bucket(), settings.keyframe_interval(), encoder, decoder);

    println!("Created pipeline: {}", pipeline_definition);

    let pipeline_element = match launch(&pipeline_definition) {
      Ok(element) => element,
      Err(error) => {
        return Err(StreamError::new(StreamErrorKind::Pipeline, &error.to_string()));
      }
    };

    let pipeline = match pipeline_element.downcast::<Pipeline>() {
      Ok(pipeline) => pipeline,
      Err(_) => {
        return Err(StreamError::new(StreamErrorKind::Pipeline, "Unable to downcast pipeline_element element to Pipeline"));
      }
    };

    let video_src_element = match pipeline.by_name("video_src") {
      Some(element) => element,
      None => {
        return Err(StreamError::new(StreamErrorKind::Source, "No video source found"));
      }
    };
    let video = match video_src_element.downcast::<AppSrc>() {
      Ok(video) => video,
      Err(_) => {
        return Err(StreamError::new(StreamErrorKind::Source, "Unable to downcast video_src element to appsrc"));
      }
    };
    video.set_format(Format::Time);

    let audio_src_element = match pipeline.by_name("audio_src") {
      Some(element) => element,
      None => {
        return Err(StreamError::new(StreamErrorKind::Source, "No audio source found"));
      }
    };
    let audio = match audio_src_element.downcast::<AppSrc>() {
      Ok(audio) => audio,
      Err(_) => {
        return Err(StreamError::new(StreamErrorKind::Source, "Unable to downcast audio_src element to appsrc"));
      }
    };
    audio.set_format(Format::Time);

    let mut stream = Stream {
      pipeline: pipeline,
      video: video,
      audio: audio,
      session: session.to_string(),
      state: StreamState::Pause,
      vendor: vendor,
      settings: settings
    };

    stream.play();

    return Ok(stream);
  }

  pub fn get_session(&self) -> &String {
    return &self.session;
  }

  pub fn update_framerate(&self, value: u64) {
    println!("Updating encoder framerate to {}", value);

    let encoder = match self.pipeline.by_name("video_encoder") {
      None => {
        eprintln!("Failed to retrieve current video encoder");

        return;
      },
      Some(encoder) => encoder
    };

    if self.vendor == "Nvidia" {
      encoder.set_property("gop-size", (value * self.settings.keyframe_interval()) as i32);

      return;
    }

    encoder.set_property("key-int-max", (value * self.settings.keyframe_interval()) as u32);
  }

  pub fn play(&mut self) {
    if self.state == StreamState::Play {
      return;
    }

    match self.pipeline.set_state(Playing) {
      Err(error) => {
        eprintln!("Failed to set pipeline state to Playing - {}", error);
      },
      Ok(_) => {
        self.state = StreamState::Play;
      }
    }
  }

  pub fn pause(&mut self) {
    if self.state == StreamState::Pause {
      return;
    }

    match self.pipeline.set_state(Paused) {
      Err(error) => {
        eprintln!("Failed to set pipeline state to Playing - {}", error);
      },
      Ok(_) => {
        self.state = StreamState::Pause;
      }
    }
  }

  pub fn on_video_frame(&self, data: Vec<u8>, dts: u64, pts: u64) {
    let mut buffer = Buffer::from_slice(data);

    let buffer_mut = match buffer.get_mut() {
      Some(buffer_mut) => buffer_mut,
      None => {
        eprintln!("Failed to get mutable video buffer");

        return;
      }
    };
    buffer_mut.set_dts(ClockTime::from_mseconds(dts));
    buffer_mut.set_pts(ClockTime::from_mseconds(pts));

    match self.video.push_buffer(buffer) {
      Err(error) => {
        eprintln!("Failed to push video frame to gstreamer pipeline - {}", error);
      },
      _ => {}
    }
  }

  pub fn on_video_header(&self, data: Vec<u8>) {
    let codec_data = Buffer::from_slice(data);
    let caps = Caps::builder("video/x-h264").field("stream-format", "avc").field("alignment", "au").field("codec_data", codec_data).build();

    self.video.set_caps(Some(&caps));
  }

  pub fn on_video_end(&self) {
    match self.video.end_of_stream() {
      Err(error) => {
        eprintln!("Failed to close video stream - {}", error);
      },
      _ => {}
    }
  }

  pub fn on_audio_frame(&self, data: Vec<u8>, pts: u64) {
    let mut buffer = Buffer::from_slice(data);

    let buffer_mut = match buffer.get_mut() {
      Some(buffer_mut) => buffer_mut,
      None => {
        eprintln!("Failed to get mutable audio buffer");

        return;
      }
    };
    buffer_mut.set_pts(ClockTime::from_mseconds(pts));

    match self.audio.push_buffer(buffer) {
      Err(error) => {
        eprintln!("Failed to push audio frame to gstreamer pipeline - {}", error);
      },
      _ => {}
    }
  }

  pub fn on_audio_header(&self, data: Vec<u8>) {
    let codec_data = Buffer::from_slice(data);
    let caps = Caps::builder("audio/mpeg").field("mpegversion", 4i32).field("stream_format", "raw").field("codec_data", codec_data).build();

    self.audio.set_caps(Some(&caps));
  }

  pub fn on_audio_end(&self) {
    match self.audio.end_of_stream() {
      Err(error) => {
        eprintln!("Failed to close audio stream - {}", error);
      },
      _ => {}
    }
  }
}
