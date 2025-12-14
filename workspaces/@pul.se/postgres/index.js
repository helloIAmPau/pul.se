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
