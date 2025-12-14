import { query } from '@pul.se/postgres';

export const events = function(_, variables, { user }) {
  return query(`
select
  uid,
  name,
  description,
  start_timestamp,
  end_timestamp
from
  events
where
  owner = $1 and deleted = false
order by
  start_timestamp desc
  `, [ user.uid ]);
};
