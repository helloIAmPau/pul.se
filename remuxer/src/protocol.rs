use std::fmt;

use std::sync::Arc;
use tokio::sync::Mutex;

use rtmp_rs::RtmpHandler;
use rtmp_rs::AuthResult;
use rtmp_rs::media::AacData;
use rtmp_rs::media::H264Data;
use rtmp_rs::session::SessionContext;
use rtmp_rs::session::StreamContext;
use rtmp_rs::protocol::message::ConnectParams;
use rtmp_rs::protocol::message::PublishParams;

use uuid::Uuid;

use crate::postgres::Postgres;
use crate::stream::Stream;
use crate::stream::StreamRegistry;

#[derive(Debug)]
pub enum ProtocolErrorKind {
  Initialization
}

pub struct ProtocolError {
  kind: ProtocolErrorKind,
  message: String
}

impl ProtocolError {
  pub fn new(kind: ProtocolErrorKind, message: &str) -> Self {
    return Self {
      kind: kind,
      message: message.to_string()
    }
  }
}

impl fmt::Display for ProtocolError {
  fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
    return write!(formatter, "{:?}: {}", self.kind, self.message);
  }
}

pub struct Protocol {
  registry: Arc<Mutex<StreamRegistry>>,
  db: Postgres
}

impl Protocol {
  pub async fn new(db: Postgres) -> Result<Self, ProtocolError> {
    let registry = StreamRegistry::new();
    let mutex = Mutex::new(registry);
    let arc = Arc::new(mutex);

    // Fixing pending streaming after reboot
    match db.query("insert into events (uid, app, event) select uid, app, 'STOP' as event from (select uid, app, count(event) as event_number from events group by uid, app) where event_number = 1", &[]).await {
      Ok(_) => {},
      Err(error) => {
        return Err(ProtocolError::new(ProtocolErrorKind::Initialization, &error.to_string()));
      }
    }

    let protocol = Self {
      registry: arc,
      db: db
    };

    return Ok(protocol);
  }

  async fn clean_up(&self, app: &str) {
    let mut registry = self.registry.lock().await;

    let stream = match registry.get(app) {
      Ok(stream) => stream,
      Err(_) => {
        eprintln!("App {} already cleaned up", app);

        return;
      }
    };

    stream.on_video_end();
    stream.on_audio_end();

    let app_uuid = match Uuid::parse_str(app) {
      Ok(app) => app,
      Err(_) => {
        eprintln!("Invalid app format");

        return;
      }
    };

    let session_uuid = match Uuid::parse_str(stream.get_session()) {
      Ok(session) => session,
      Err(_) => {
        eprintln!("Invalid session format");

        return;
      }
    };

    match self.db.query("insert into events (uid, app, event) values ($1, $2, 'STOP') returning uid", &[ &session_uuid, &app_uuid ]).await {
      Ok(_) => {},
      Err(error) => {
        eprintln!("Unable stopping session - {}", error);

        return;
      }
    };

    registry.remove(app);

    println!("Removed pipeline for stream {}", app);
  }
}

impl RtmpHandler for Protocol {
  async fn on_connect(&self, _context: &SessionContext, params: &ConnectParams) -> AuthResult {
    println!("New incoming connection for app {}", params.app);

    let app = match Uuid::parse_str(&params.app) {
      Ok(app) => app,
      Err(_) => {
        eprintln!("Invalid app format");

        return AuthResult::Reject("Invalid App Name".to_string());
      }
    };

    match self.db.query("select owner from streams where app = $1 and deleted = false", &[ &app ]).await {
      Ok(rows) => {
        if rows.len() != 1 {
          eprintln!("Invalid app name {}", params.app);

          return AuthResult::Reject(format!("Invalid app name {}", params.app));
        }

        return AuthResult::Accept;
      },
      Err(error) => {
        eprintln!("Server error - {}", error);

        return AuthResult::Reject("Server Error".to_string());
      }
    }
  }

  async fn on_publish(&self, context: &SessionContext, params: &PublishParams) -> AuthResult {
    println!("New publish request for stream {}", context.app);

    let key = match Uuid::parse_str(&params.stream_key) {
      Ok(key) => key,
      Err(_) => {
        eprintln!("Invalid stream key format");

        return AuthResult::Reject("Invalid Stream Key".to_string());
      }
    };

    let app = match Uuid::parse_str(&context.app) {
      Ok(app) => app,
      Err(_) => {
        eprintln!("Invalid app format");

        return AuthResult::Reject("Invalid App Name".to_string());
      }
    };

    let name: String = match self.db.query("select owner, name from streams where app = $1 and key = $2 and deleted = false", &[ &app, &key ]).await {
      Ok(rows) => {
        if rows.len() != 1 {
          eprintln!("Invalid key received for app name {}", context.app);

          return AuthResult::Reject(format!("Invalid key received for app name {}", context.app));
        }

        println!("Stream {} validated. Allocating pipeline", context.app);
        rows[0].get("name")
      },
      Err(error) => {
        eprintln!("Error validating connection - {}", error);

        return AuthResult::Reject("Server Error".to_string());
      }
    };

    let session: Uuid = match self.db.query("insert into events (app, event, name) values ($1, 'PLAY', $2) returning uid", &[ &app, &name ]).await {
      Ok(rows) => {
        rows[0].get("uid")
      },
      Err(error) => {
        eprintln!("Unable starting session - {}", error);

        return AuthResult::Reject("Server Error".to_string());
      }
    };

    match Stream::new(&session.to_string()) {
      Ok(stream) => {
        let mut registry = self.registry.lock().await;
        registry.add(&context.app, stream);
        
        println!("New pipeline configured for stream {}", context.app);
        return AuthResult::Accept;
      },
      Err(error) => {
        eprintln!("Error launching pipeline - {}", error);

        return AuthResult::Reject("Server Error".to_string());
      }
    };
  }

  async fn on_pause(&self, context: &StreamContext) {
    let mut registry = self.registry.lock().await;

    match registry.get_mut(&context.session.app) {
      Ok(stream) => {
        stream.pause();
      },
      Err(_) => {
        eprintln!("Invalid stream name {}", context.session.app);

        return;
      }
    };
  }

  async fn on_unpause(&self, context: &StreamContext) {
    let mut registry = self.registry.lock().await;

    match registry.get_mut(&context.session.app) {
      Ok(stream) => {
        stream.play();
      },
      Err(_) => {
        eprintln!("Invalid stream name {}", context.session.app);

        return;
      }
    };
  }

  async fn on_video_frame(&self, context: &StreamContext, frame: &H264Data, timestamp: u32) {
    let registry = self.registry.lock().await;

    let stream = match registry.get(&context.session.app) {
      Ok(stream) => stream,
      Err(_) => {
        eprintln!("Invalid stream name {}", context.session.app);

        return;
      }
    };

    match frame {
      H264Data::SequenceHeader(config) => {
        let codec_data = config.raw.to_vec();
        
        stream.on_video_header(codec_data);
      },
      H264Data::Frame { composition_time, nalus, .. } => {
        let video_data = nalus.to_vec();
        let dts = timestamp as u64;
        let pts = (timestamp as i64 + *composition_time as i64).max(0) as u64;

        stream.on_video_frame(video_data, dts, pts);
      },
      H264Data::EndOfSequence => {
        stream.on_video_end();
      }
    };
  }

  async fn on_audio_frame(&self, context: &StreamContext, frame: &AacData, timestamp: u32) {
    let registry = self.registry.lock().await;

    let stream = match registry.get(&context.session.app) {
      Ok(stream) => stream,
      Err(_) => {
        eprintln!("Invalid stream name {}", context.session.app);

        return;
      }
    };

    match frame {
      AacData::SequenceHeader(config) => {
        let codec_data = config.raw.to_vec();
        
        stream.on_audio_header(codec_data);
      },
      AacData::Frame { data } => {
        let audio_data = data.to_vec();

        stream.on_audio_frame(audio_data, timestamp as u64);
      }
    };
  }

  async fn on_unpublish(&self, context: &StreamContext) {
    println!("Unpublish request for stream {}", context.session.app);

    self.clean_up(&context.session.app).await;
  }

  async fn on_disconnect(&self, context: &SessionContext) {
    println!("Connection for app {} ended", context.app);

    self.clean_up(&context.app).await;
  }
}

