import { query } from '@pul.se/postgres';

const CDN_URL = process.env.PULSE_CDN;

export const stream = function(_, { app }) {
  return query(`
with events as (
  select
    uid,
    sessions.app as app,
    name,
    event as state,
    timestamp
  from sessions
  left join streams
  on sessions.app = streams.app
  order by timestamp desc
)

select
  *
from
  events
where
  app = $1
limit 1
  `, [ app ]).then(function(rows) {
    const stream = rows[0];
    if(stream == null) {
      return;
    }

    stream.url = `${ CDN_URL }/${ stream.uid }/playlist.m3u8`;

    return stream;
  });
};
