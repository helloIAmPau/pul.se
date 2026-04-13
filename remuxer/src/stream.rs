use std::collections::HashMap;

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

use gstreamer_app::AppSrc;

use crate::storage::Storage;

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

  pub fn get(&self, app: &str) -> Result<&Stream, std::fmt::Error> {
    match self.streams.get(app) {
      Some(stream) => {
        return Ok(stream);
      },
      None => {
        return Err(std::fmt::Error);
      }
    };
  }
}

pub struct Stream {
  pipeline: Pipeline,
  video: AppSrc,
  audio: AppSrc,
  session: String
}

impl Stream {
  pub fn warmup() -> Result<(), Error> {
    return init();
  }

  pub fn new(session: &str) -> Result<Self, Error> {
    let pipeline_definition = format!("appsrc name=video_src format=time is-live=true ! h264parse ! sink.video appsrc name=audio_src format=time is-live=true ! aacparse ! sink.audio awss3hlssink name=sink bucket=\"streams\" key-prefix=\"{0}\" access-key=\"{1}\" secret-access-key=\"{2}\" force-path-style=true region=\"us-east-1\" endpoint-uri=\"http://storage:9000\"", session, Storage::get_key(), Storage::get_secret());
    let pipeline = match launch(&pipeline_definition) {
      Ok(pipeline) => {
        pipeline.downcast::<Pipeline>().unwrap()
      },
      Err(error) => {
        return Err(error);
      }
    };

    let video = pipeline.by_name("video_src").unwrap().downcast::<AppSrc>().unwrap();
    video.set_format(Format::Time);
    let audio = pipeline.by_name("audio_src").unwrap().downcast::<AppSrc>().unwrap();
    audio.set_format(Format::Time);

    let stream = Stream {
      pipeline: pipeline,
      video: video,
      audio: audio,
      session: session.to_string()
    };

    stream.play();

    return Ok(stream);
  }

  pub fn get_session(&self) -> &String {
    return &self.session;
  }

  pub fn play(&self) {
    match self.pipeline.set_state(Playing) {
      Err(error) => {
        eprintln!("Failed to set pipeline state to Playing - {}", error);
      },
      _ => {}
    }
  }

  pub fn pause(&self) {
    match self.pipeline.set_state(Paused) {
      Err(error) => {
        eprintln!("Failed to set pipeline state to Playing - {}", error);
      },
      _ => {}
    }
  }

  pub fn on_video_frame(&self, data: Vec<u8>, dts: u64, pts: u64) {
    println!("on_video_frame");

    let mut buffer = Buffer::from_slice(data);

    let buffer_mut = buffer.get_mut().unwrap();
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
    println!("on_video_header");

    let codec_data = Buffer::from_slice(data);
    let caps = Caps::builder("video/x-h264").field("stream-format", "avc").field("alignment", "au").field("codec_data", codec_data).build();

    self.video.set_caps(Some(&caps));
  }

  pub fn on_video_end(&self) {
    println!("on_video_end");

    match self.video.end_of_stream() {
      Err(error) => {
        eprintln!("Failed to close video stream - {}", error);
      },
      _ => {}
    }
  }

  pub fn on_audio_frame(&self, data: Vec<u8>, pts: u64) {
    println!("on_audio_frame");

    let mut buffer = Buffer::from_slice(data);

    let buffer_mut = buffer.get_mut().unwrap();
    buffer_mut.set_pts(ClockTime::from_mseconds(pts));

    match self.audio.push_buffer(buffer) {
      Err(error) => {
        eprintln!("Failed to push audio frame to gstreamer pipeline - {}", error);
      },
      _ => {}
    }
  }

  pub fn on_audio_header(&self, data: Vec<u8>) {
    println!("on_audio_header");

    let codec_data = Buffer::from_slice(data);
    let caps = Caps::builder("audio/mpeg").field("mpegversion", 4i32).field("stream_format", "raw").field("codec_data", codec_data).build();

    self.audio.set_caps(Some(&caps));
  }

  pub fn on_audio_end(&self) {
    println!("on_audio_end");

    match self.audio.end_of_stream() {
      Err(error) => {
        eprintln!("Failed to close audio stream - {}", error);
      },
      _ => {}
    }
  }
}
