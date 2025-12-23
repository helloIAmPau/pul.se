mod rtmp;
mod pipeline;

use tokio::net::TcpListener;
use tokio::spawn;
use tokio::net::TcpStream;
use tokio::io::AsyncReadExt;
use rtmp::create_session;
use rtmp::on_buffer;
use rtmp::RTMP_BUFFER_SIZE;
use pipeline::init;


//use gstreamer::State::Playing;
//use gstreamer::prelude::ElementExt;
//use gstreamer::prelude::GstBinExt;
//use gstreamer::prelude::*;
//use gstreamer_app::prelude::*;
//use gstreamer::Buffer;

//async fn handle_connection(mut socket: TcpStream) {
//  let mut STATE = "UNINITIALIZED";
//  let mut protocol_buffer: Vec<u8> = vec![];
//
//  let mut c1_packet: Vec<u8> = vec![];
//
//  loop {
//    let mut socket_buffer = [0u8; 4096];
//    let bytes_read = match socket.read(&mut socket_buffer).await {
//      Ok(0) => {
//        println!("Stream finished");
//
//        break;
//      },
//      Ok(bytes_read) => bytes_read,
//      Err(error) => {
//        eprintln!("Error reading stream: {}", error);
//
//        break;
//      }
//    };
//
//    protocol_buffer.extend_from_slice(&socket_buffer[..bytes_read]);
//
//    println!("State: {}", STATE);
//
//    // C0 and S0 packets
//    if STATE == "UNINITIALIZED" && protocol_buffer.len() >= 1 {
//      println!("C0 packet received");
//
//      let s0_packet: Vec<u8> = protocol_buffer.drain(0..1).collect();
//      socket.write_all(&s0_packet).await;
//
//      STATE = "VERSION_SENT";
//    }
//
//    // C1 and S1 packets
//    if STATE == "VERSION_SENT" && protocol_buffer.len() >= 1536 {
//      println!("C1 packet received");
//
//      c1_packet = protocol_buffer.drain(0..1536).collect();
//      let mut s1_packet: Vec<u8> = vec![];
//      s1_packet.extend([0u8; 4]); // time
//      s1_packet.extend([0u8; 4]); // zeros
//      s1_packet.extend([1u8; 1528]); // "random" bytes
//      socket.write_all(&s1_packet).await;
//
//      STATE = "ACK_SENT";
//    }
//
//    // C2 and S2 packets
//    if STATE == "ACK_SENT" && protocol_buffer.len() >= 1536 {
//      println!("C2 packet received");
//
//      let c2_packet: Vec<u8> = protocol_buffer.drain(0..1536).collect();
//      let mut s2_packet: Vec<u8> = vec![];
//      s2_packet.extend(&c1_packet[0..4]);
//      s2_packet.extend([0u8; 4]);
//      s2_packet.extend(&c1_packet[8..]);
//      socket.write_all(&s2_packet).await;
//
//      STATE = "HANDSHAKE_DONE";
//    }
//
//    // message header received
//    if STATE == "HANDSHAKE_DONE" && protocol_buffer.len() >= 12 {
//      let body_length = u32::from_be_bytes([0u8, protocol_buffer[4], protocol_buffer[5], protocol_buffer[6]]) as usize;
//      let packet_length = 12 + body_length;
//
//      if protocol_buffer.len() < packet_length {
//        {}continue;
//      }
//
//      let packet: Vec<u8> = protocol_buffer.drain(0..packet_length).collect();
//      
//      // processing command packets
//      if packet[7] != 20 {
//        continue;
//      }
//
//      let pipeline_definition = "appsrc name=source is-live=true ! flvdemux ! hlssink2 name=sink location=/segments/new/segment%05d.ts playlist-location=/segments/new/playlist.m3u8 target-duration=3 max-files=0";
//      let pipeline = match gstreamer::parse::launch(pipeline_definition) {
//        Ok(pipeline) => pipeline,
//        Err(error) => {
//          eprintln!("Error building pipeline: {}", error);
//
//          break;
//        }
//      };
//
//      match pipeline.set_state(Playing) {
//        Ok(_) => {
//          println!("Pipeline started");
//        },
//        Err(error) => {
//          eprintln!("Error starting pipeline: {}", error);
//
//          break;
//        }
//      };
//
//      let gstreamer_pipeline = match pipeline.downcast::<gstreamer::Pipeline>() {
//        Ok(pipeline) => pipeline,
//        Err(_) => {
//          eprintln!("Error downcasting pipeline");
//
//          break;
//        }
//      };
//      let source = match gstreamer_pipeline.by_name("source") {
//        Some(source) => source,
//        None => {
//          eprintln!("Source node not found in pipeline");
//
//          break;
//        }
//      };
//      let app_source = match source.dynamic_cast::<gstreamer_app::AppSrc>() {
//        Ok(app_source) => app_source,
//        Err(_) => {
//          eprintln!("Unable to cast element to AppSrc");
//
//          break;
//        }
//      };
//
//      let pipeline_buffer = Buffer::from_slice(packet);
//      match app_source.push_buffer(pipeline_buffer) {
//        Ok(_) => {
//          println!("Pushed!");
//        },
//        Err(error) => {
//          eprintln!("Error pushing buffer to AppSrc: {}", error);
//          
//          break;
//        }
//      };
//    }
//  }
//}

pub async fn handle_connection(socket: TcpStream) {
  let mut session = create_session(socket);

  loop {
    let mut socket_buffer = [0u8; RTMP_BUFFER_SIZE];
    let bytes_read = match session.socket.read(&mut socket_buffer).await {
      Ok(0) => {
        println!("Stream finished");

        break;
      },
      Ok(bytes_read) => bytes_read,
      Err(error) => {
        eprintln!("Error reading stream: {}", error);

        break;
      }
    };

    on_buffer(&mut session, &socket_buffer[..bytes_read]).await;
  }
}

#[tokio::main]
async fn main() {
  init();

  let listener = match TcpListener::bind("0.0.0.0:1935").await {
    Ok(listener) => {
      println!("RTMP server started @ 0.0.0.0:1935");

      listener
    },
    Err(error) => {
      eprintln!("Unable to allocate listener on 0.0.0.0:1935: {}", error);

      return;
    }
  };

  loop {
    let socket = match listener.accept().await {
      Ok((socket, address)) => {
        println!("New stream from {}", address);

        socket
      },
      Err(error) => {
        eprintln!("Connection failed: {}", error);

        continue;
      }
    };

    spawn(async move {
      handle_connection(socket).await;
    });
  }
}
