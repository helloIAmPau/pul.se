use std::fmt;

use aws_sdk_s3::config::Credentials;
use aws_config::BehaviorVersion;
use aws_sdk_s3::Client;
use aws_sdk_s3::config::Builder;
use aws_sdk_s3::types::CreateBucketConfiguration;
use aws_sdk_s3::config::Region;

use crate::stream::StreamSettings;

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
  pub fn new(settings: &StreamSettings) -> Self {
    let credentials = Credentials::new(settings.storage_access_key(), settings.storage_secret_key(), None, None, "PULSE");
    let s3_config = Builder::new().behavior_version(BehaviorVersion::latest()).region(Region::new(settings.storage_region())).endpoint_url(settings.storage_host()).credentials_provider(credentials).force_path_style(true).build();
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
