import { query } from '@pul.se/postgres';
import { usePagination, formatUrl } from '../tools';

const _setDefaults = function(row) {
  if(row == null) {
    return;
  }

  row.settings = {
    storage: {
      access_key: process.env.STORAGE_ACCESS_KEY,
      secret_key: process.env.STORAGE_SECRET_KEY,
      host: 'http://storage:9000',
      region: 'us-east-1',
      bucket: 'streams'
    },
    keyframe_interval: 1,
    ...row.settings
  };

  return row;
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
      data: rows.map(function(row) {
        return _setDefaults(row);
      }),
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
    return _setDefaults(rows[0]);
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

export const updateSettings = function(_, { app, settings }, { user }) {
  return query(`
update
  streams
set
  settings = $3
where
  owner = $1 and app = $2 and deleted = false
returning
  *
  `, [ user.uid, app, settings ]).then(function(rows) {
    return rows[0];
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
