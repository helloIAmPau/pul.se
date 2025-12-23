pub fn init() {
  match gstreamer::init() {
    Ok(_) => {
      println!("GStreamer initialized");
    },
    Err(error) => {
      panic!("Error in GStreamer initialization: {}", error);
    }
  };
}
