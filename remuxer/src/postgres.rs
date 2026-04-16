use std::env::var;
use std::fmt;

use deadpool_postgres::Pool;
use deadpool_postgres::Config;
use deadpool_postgres::Runtime;

use tokio_postgres::NoTls;
use tokio_postgres::Row;
use tokio_postgres::types::ToSql;

#[derive(Debug)]
pub enum PostgresErrorKind {
  Pool,
  Config,
  Query
}

pub struct PostgresError {
  kind: PostgresErrorKind,
  message: String
}

impl PostgresError {
  pub fn new(kind: PostgresErrorKind, message: &str) -> Self {
    return Self {
      kind: kind,
      message: message.to_string()
    }
  }
}

impl fmt::Display for PostgresError {
  fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
    return write!(formatter, "{:?}: {}", self.kind, self.message);
  }
}

pub struct Postgres {
  pool: Pool
}

impl Postgres {
  pub fn new() -> Result<Self, PostgresError> {
    let mut config = Config::new();

    config.host = Some("postgres".to_string());

    let user = match var("POSTGRES_USER") {
      Ok(val) => val,
      Err(_) => "postgres".to_string()
    };
    config.user = Some(user);
  
    let password = match var("POSTGRES_PASSWORD") {
      Ok(val) => val,
      Err(_) => "".to_string()
    };
    config.password = Some(password);
  
    let dbname = match var("POSTGRES_DB") {
      Ok(val) => val,
      Err(_) => "postgres".to_string()
    };
    config.dbname = Some(dbname);

    let pool = match config.create_pool(Some(Runtime::Tokio1), NoTls) {
      Ok(pool) => pool,
      Err(error) => {
        return Err(PostgresError::new(PostgresErrorKind::Config, &error.to_string()));
      }
    };

    let db = Self {
      pool: pool
    };

    return Ok(db);
  }

  pub async fn query(&self, sql: &str, params: &[&(dyn ToSql + Sync)]) -> Result<Vec<Row>, PostgresError> {
    let client = match self.pool.get().await {
      Ok(client) => client,
      Err(error) => {
        return Err(PostgresError::new(PostgresErrorKind::Pool, &error.to_string()));
      }
    };
  
    match client.query(sql, params).await {
      Ok(rows) => {
        return Ok(rows);
      },
      Err(error) => {
        return Err(PostgresError::new(PostgresErrorKind::Query, &error.to_string()));
      } 
    };
  }
}
