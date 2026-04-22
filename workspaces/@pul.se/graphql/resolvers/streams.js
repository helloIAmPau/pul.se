import { query } from '@pul.se/postgres';

const CDN_URL = process.env.PULSE_CDN;

const _formatUrl = function(uid) {
  return `${ CDN_URL }/${ uid }/playlist.m3u8`;
};

export const stream = function(_, { app }, { user }) {
  return query(`
select
  *
from
  stream_sessions
where
  app = $1 and owner = $2
limit 1
  `, [ app, user.uid ]).then(function(rows) {
    const stream = rows[0];
    if(stream == null) {
      return;
    }

    stream.url = _formatUrl(stream.uid);

    return stream;
  });
};

export const live = function(_, __, { user }) {
  return query(`
with live as (
  select
    distinct on (owner, app)
    owner,
    app,
    uid,
    name,
    state,
    timestamp
  from
    stream_sessions
  order by owner, app, timestamp desc
)

select
  *
from
  live
where
  owner = $1 and state = 'PLAY'
  `, [ user.uid ]).then(function(rows) {
    return rows.map(function(stream) {
      stream.url = _formatUrl(stream.uid);

      return stream;
    });
  });
};
