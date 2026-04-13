pub mod protocol;
pub mod postgres;
pub mod stream;
pub mod storage;

use rtmp_rs::RtmpServer;
use rtmp_rs::ServerConfig;

use protocol::Protocol;
use stream::Stream;
use storage::Storage;

#[tokio::main]
async fn main() {
  let storage = Storage::new();
  match storage.create("streams").await {
    Err(error) => {
      eprintln!("Unable to create default storage bucket - {}", error);

      return;
    },
    _ => {}
  };

  match Stream::warmup() {
    Err(error) => {
      eprintln!("Unable to start pipeline framework - {}", error);

      return;
    },
    _ => {}
  };

  let config = ServerConfig::default();
  let protocol = Protocol::new();
  let server = RtmpServer::new(config, protocol);

  println!("RTMP service started @ 0.0.0.0:1935");

  match server.run().await {
    Err(error) => {
      eprintln!("Unable to start service @ 0.0.0.0:1935 - {}", error);

      return;
    },
    _ => {}
  };
}
