use std::env::var;

use tokio::spawn;

use tokio_postgres::connect;
use tokio_postgres::NoTls;
use tokio_postgres::Row;
use tokio_postgres::Error;
use tokio_postgres::types::ToSql;

pub async fn query(sql: &str, params: &[&(dyn ToSql + Sync)]) -> Result<Vec<Row>, Error> {
  let user = match var("POSTGRES_USER") {
    Ok(val) => format!("user={}", val),
    Err(_) => "user=postgres".to_string()
  };

  let password = match var("POSTGRES_PASSWORD") {
    Ok(val) => format!("password={}", val),
    Err(_) => "".to_string()
  };

  let dbname = match var("POSTGRES_DB") {
    Ok(val) => format!("dbname={}", val),
    Err(_) => "dbname=postgres".to_string()
  };

  let connection_string = format!("host=postgres {} {} {}", user, password, dbname);
  let client = match connect(&connection_string, NoTls).await {
    Ok((client, connection)) => {
      spawn(async move {
        connection.await
      });

      client
    },
    Err(error) => {
      return Err(error);
    }
  };

  return client.query(sql, params).await;
}
