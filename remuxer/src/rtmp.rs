use tokio::net::TcpStream;
use tokio::io::AsyncWriteExt;
use rand::Rng;

pub const RTMP_BUFFER_SIZE: usize = 4096;
const RTMP_VERSION: u8 = 3;

const RTMP_C0_PKT_SIZE: usize = 1;
const RTMP_C1_PKT_SIZE: usize = 1536;
const RTMP_C2_PKT_SIZE: usize = 1536;

const RTMP_PKT_EPOCH_SIZE: usize = 4;
const RTMP_PKT_RANDOM_SIZE: usize = 1528;

#[derive(PartialEq)]
enum RtmpStatus {
  Uninitialized,
  VersionSent,
  AckSent,
  HandshakeDone
}

struct RtmpHandshakeInfo {
  epoch: [u8; RTMP_PKT_EPOCH_SIZE],
  random: [u8; RTMP_PKT_RANDOM_SIZE]
}

struct RtmpHandshake {
  server: RtmpHandshakeInfo,
  client: RtmpHandshakeInfo,
}

pub struct RtmpSession {
  status: RtmpStatus,
  buffer: Vec<u8>,
  handshake: RtmpHandshake,
  pub socket: TcpStream
}

pub fn create_session(socket: TcpStream) -> RtmpSession {
  let session = RtmpSession {
    status: RtmpStatus::Uninitialized,
    buffer: vec![],
    handshake: RtmpHandshake {
      server: RtmpHandshakeInfo {
        epoch: [0u8; RTMP_PKT_EPOCH_SIZE],
        random: rand::rng().random::<[u8; RTMP_PKT_RANDOM_SIZE]>()
      },
      client: RtmpHandshakeInfo {
        epoch: [0u8; RTMP_PKT_EPOCH_SIZE],
        random: [0u8; RTMP_PKT_RANDOM_SIZE]
      }
    },
    socket: socket
  };

  return session;
}

pub async fn on_buffer(session: &mut RtmpSession, buffer: &[u8]) {
  session.buffer.extend_from_slice(buffer);

  if session.status == RtmpStatus::Uninitialized && session.buffer.len() >= RTMP_C0_PKT_SIZE {
    let c0: Vec<u8> = session.buffer.drain(0..RTMP_C0_PKT_SIZE).collect();
    println!("Received C0 packet with version {}", c0[0]);

    // ToDo Handle version validation

    let s0 = [RTMP_VERSION];
    session.socket.write_all(&s0).await;

    session.status = RtmpStatus::VersionSent;
  }

  if session.status == RtmpStatus::VersionSent && session.buffer.len() >= RTMP_C1_PKT_SIZE {
    let c1: Vec<u8> = session.buffer.drain(0..RTMP_C1_PKT_SIZE).collect();
    println!("Received C1 packet");

    session.handshake.client.epoch.copy_from_slice(&c1[0..4]);
    session.handshake.client.random.copy_from_slice(&c1[8..]);

    let mut s1 = vec![];
    s1.extend(session.handshake.server.epoch);
    s1.extend([0u8; 4]);
    s1.extend(session.handshake.server.random);
    session.socket.write_all(&s1).await;

    session.status = RtmpStatus::AckSent;
  }


  if session.status == RtmpStatus::AckSent && session.buffer.len() >= RTMP_C2_PKT_SIZE {
    let c2: Vec<u8> = session.buffer.drain(0..RTMP_C2_PKT_SIZE).collect();
    println!("Received C2 packet");

    // ToDo handle timestamp and random validation

    let mut s2 = vec![];
    s2.extend(session.handshake.client.epoch);
    s2.extend(session.handshake.client.epoch);
    s2.extend(session.handshake.client.random);
    session.socket.write_all(&s2).await;

    session.status = RtmpStatus::HandshakeDone;

    println!("Handshake completed!");
  }
}
