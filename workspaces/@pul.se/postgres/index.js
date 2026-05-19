import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: 'postgres',
  database: process.env.POSTGRES_DB
});

export const query = function(sql, variables) {
  return pool.query(sql, variables).then(function({ rows }) {
    return rows;
  });
};

export const listen = function(handler) {
  return pool.connect().then(function(client) {
    client.on('notification', function({ payload }) {
      handler(JSON.parse(payload));
    });

    return client.query('listen on_change');
  });
};
