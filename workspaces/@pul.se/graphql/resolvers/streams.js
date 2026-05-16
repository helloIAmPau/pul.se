import { query } from '@pul.se/postgres';
import { usePagination, formatUrl } from '../tools';

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
