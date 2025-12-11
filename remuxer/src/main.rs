extern crate ffmpeg_next;

use std::path::Path;
use ffmpeg_next::format;
use ffmpeg_next::Dictionary;
use ffmpeg_next::encoder;

const BASE_RTMP_URL: &str = "rtmp://0.0.0.0:30000/live";
const BASE_SEGMENTS_FOLDER: &str = "/segments";

fn main() {
  match ffmpeg_next::init() {
    Ok(_) => {
      println!("FFmpeg initialized");
    },
    Err(error) => {
      eprintln!("Unable to initilize ffmpeg framework: {}", error);

      return;
    }
  }

  let mut input_options = Dictionary::new();
  input_options.set("listen", "1");
  input_options.set("rtmp_live", "live");
  let mut input_context = match format::input_with_dictionary(&Path::new(BASE_RTMP_URL), input_options) {
    Ok(input_context) => input_context,
    Err(error) => {
      eprintln!("Unable to initilize ffmpeg input context: {}", error);

      return;
    }
  };

  let playlist = format!("{}/playlist.m3u8", BASE_SEGMENTS_FOLDER);
  let segments = format!("{}/segment_%05d.ts", BASE_SEGMENTS_FOLDER); // 5 digits segment index => about 27 hours of stream

  let mut output_options = Dictionary::new();
//  output_options.set("hls_time", "2");
//  output_options.set("hls_segment_filename", &segments);
  let mut output_context = match format::output_with(&Path::new(&playlist), output_options) {
    Ok(output_context) => output_context,
    Err(error) => {
      eprintln!("Unable to initilize ffmpeg output context: {}", error);

      return;
    }
  };

  for input_stream in input_context.streams() {
    let codec_parameters = input_stream.parameters();
    
    let codec = encoder::find(codec_parameters.id());
    let mut output_stream = match output_context.add_stream(codec) {
      Ok(output_stream) => output_stream,
      Err(error) => {
        eprintln!("Unable to allocate output stream: {}", error);

        return;
      }
    };
    output_stream.set_parameters(codec_parameters);
  }

  match output_context.write_header() {
    Ok(_) => {
      println!("Playlist initialized");
    }
    Err(error) => {
      eprintln!("Unable to initilize playlist: {}", error);

      return;
    }
  };

  for (input_stream, mut packet) in input_context.packets() {
    let output_stream = output_context.stream(input_stream.index()).unwrap();
    packet.rescale_ts(input_stream.time_base(), output_stream.time_base());
    packet.set_stream(input_stream.index());
    match packet.write_interleaved(&mut output_context) {
      Ok(_) => {
        println!("Packet written");
      }
      Err(error) => {
        eprintln!("Unable to write packet: {}", error);
  
        return;
      }
    }
  }
}
