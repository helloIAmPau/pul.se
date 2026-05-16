import { query } from '@pul.se/postgres';
import { formatUrl } from '../tools';

export const lives = function(_, __, { user }) {
  return query(`
select
  *
from
  sessions
where
  owner = $1 and event = 'PLAY'
  `, [ user.uid ]).then(function(rows) {
    return rows.map(function(stream) {
      stream.url = formatUrl(stream.uid);

      return stream;
    });
  });
};

export const live = function(_, { app }, { user }) {
  return query(`
select
  *
from
  sessions
where
  owner = $1 and app = $2 and event = 'PLAY'
  `, [ user.uid, app ]).then(function(rows) {
    const data = rows.map(function(stream) {
      stream.url = formatUrl(stream.uid);

      return stream;
    });

    return data[0];
  });
};
