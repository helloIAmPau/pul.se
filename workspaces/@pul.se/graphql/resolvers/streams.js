import { query } from '@pul.se/postgres';
import { usePagination } from '../tools';

const CDN_URL = process.env.PULSE_CDN;

const _formatUrl = function(uid) {
  return `${ CDN_URL }/${ uid }/playlist.m3u8`;
};

export const addStream = function(_, __, { user }) {
  return query(`
insert into
  streams(name, owner)
values
  (concat('New stream ', to_char(now(), 'YYYY-MM-DDTHH24:MI:SS')), $1)
returning *
  `, [ user.uid ]).then(function(rows) {
    return rows[0]
  });
};

export const streamSession = function(_, { app }, { user }) {
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

export const streams = function(_, { pagination }, { user }) {
  const { limit, sorting } = usePagination(pagination);

  return query(`
select
  *,
  count(*) over() as count
from
  streams
where
  owner = $1 and deleted = false
${ sorting }
${ limit }
  `, [ user.uid ]).then(function(rows) {
    if(rows.length === 0) {
      return {
        data: [],
        count: 0
      };
    }

    return {
      data: rows,
      count: rows[0].count
    }
  });
};

export const stream = function(_, { app }, { user }) {
  return query(`
select
  *
from
  streams
where
  owner = $1 and app = $2 and deleted = false
  `, [ user.uid, app ]).then(function(rows) {
    return rows[0];
  });
};

export const updateName = function(_, { name }, { user }) {
  return query(`
update
  streams
set
  name = $3
where
  owner = $1 and app = $2 and deleted = false
returning
  *
  `, [ user.uid, name.app, name.name ]).then(function(rows) {
    return rows[0];
  });
};

export const regenerateKey = function(_, { app }, { user }) {
  return query(`
update
  streams
set
  key = gen_random_uuid()
where
  owner = $1 and app = $2 and deleted = false
returning
  *
  `, [ user.uid, app ]).then(function(rows) {
    return rows[0];
  });
};

export const vods = function(_, { app, pagination }, { user }) {
  const { limit, sorting } = usePagination(pagination);
  const sortingSnippet = sorting || 'order by timestamp desc';

  return query(`
select
  *,
  count(*) over() as count
from
  stream_sessions
where owner = $1 and app = $2 and state = 'STOP'
${ sortingSnippet }
${ limit }
  `, [ user.uid, app ]).then(function(rows) {
    const data = rows.map(function(stream) {
      stream.url = _formatUrl(stream.uid);

      return stream;
    });

    if(data.length === 0) {
      return {
        data: [],
        count: 0
      };
    }

    return {
      data,
      count: data[0].count
    };
  });
};

export const deleteStream = function(_, { app }, { user }) {
  return query(`
update
  streams
set
  deleted = true
where
  owner = $1 and app = $2
returning
  *
  `, [ user.uid, app ]).then(function(rows) {
    return rows[0];
  });
};
