import { query } from '@pul.se/postgres';
import { v4 as uuid } from 'uuid';

export const events = function(_, variables, { user }) {
  return query(`
select
  uid,
  name,
  description,
  start_timestamp,
  end_timestamp,
  price,
  currency
from
  events
where
  owner = $1 and deleted = false
order by
  start_timestamp desc
  `, [ user.uid ]);
};

export const updateEvent = function(_, { event }, { user }) {
  if(event.uid == null) {
    event.uid = uuid();
  }

  return query(`
insert into
  events (uid, name, description, start_timestamp, end_timestamp, price, currency, owner)
values
  ($1, $2, $3, $4, $5, $6, $7, $8)
on conflict (uid) do update set
  name = $2,
  description = $3,
  start_timestamp = $4,
  end_timestamp = $5,
  price = $6,
  currency = $7
where
  events.owner = $8
returning
  uid
  `, [ event.uid, event.name, event.description, event.start_timestamp, event.end_timestamp, event.price, event.currency, user.uid ]).then(function(rows) {
    return rows[0].uid;
  });
}
