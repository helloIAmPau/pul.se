use std::fmt;

use aws_sdk_s3::config::Credentials;
use aws_config::BehaviorVersion;
use aws_sdk_s3::Client;
use aws_sdk_s3::config::Builder;
use aws_sdk_s3::types::CreateBucketConfiguration;
use aws_sdk_s3::config::Region;

use std::env::var;

#[derive(Debug)]
pub enum StorageErrorKind {
  Bucket
}

pub struct StorageError {
  kind: StorageErrorKind,
  message: String
}

impl StorageError {
  pub fn new(kind: StorageErrorKind, message: &str) -> Self {
    return Self {
      kind: kind,
      message: message.to_string()
    }
  }
}

impl fmt::Display for StorageError {
  fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
    return write!(formatter, "{:?}: {}", self.kind, self.message);
  }
}

pub struct Storage {
  client: Client
}

impl Storage {
  pub fn get_key() -> String {
    return match var("STORAGE_ACCESS_KEY") {
      Ok(value) => value,
      Err(_) => "".to_string()
    };
  }

  pub fn get_secret() -> String {
    return match var("STORAGE_SECRET_KEY") {
      Ok(value) => value,
      Err(_) => "".to_string()
    };
  }

  pub fn new() -> Self {
    let credentials = Credentials::new(Self::get_key(), Self::get_secret(), None, None, "PULSE");
    let s3_config = Builder::new().behavior_version(BehaviorVersion::latest()).region(Region::new("us-east-1")).endpoint_url("http://storage:9000").credentials_provider(credentials).force_path_style(true).build();
    let client = Client::from_conf(s3_config);

    return Storage {
      client: client
    };
  }

  pub async fn create(&self, name: &str) -> Result<(), StorageError> {
    match self.client.head_bucket().bucket(name).send().await {
      Ok(_) => {
        return Ok(());
      },
      Err(error) => {
        let service_error = error.into_service_error();
        if service_error.is_not_found() == false {
          return Err(StorageError::new(StorageErrorKind::Bucket, &service_error.to_string()));
        }
      }
    };

    let bucket_config = CreateBucketConfiguration::builder().build();

    match self.client.create_bucket().bucket(name).create_bucket_configuration(bucket_config).send().await {
      Ok(_) => {
        return Ok(())
      },
      Err(error) => {
        return Err(StorageError::new(StorageErrorKind::Bucket, &error.to_string()));
      }
    };
  }
}
