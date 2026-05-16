begin;

create table if not exists users (
  uid uuid not null default gen_random_uuid(),
  email text not null
);

drop index if exists users_unique_email;
create unique index users_unique_email on users (email);

create table if not exists streams (
  key uuid not null default gen_random_uuid(),
  app uuid not null default gen_random_uuid(),
  name text not null,
  owner uuid not null,
  deleted boolean not null default false
);

create table if not exists events (
  uid uuid not null default gen_random_uuid(),
  app uuid not null,
  name text,
  event text not null,
  timestamp timestamp not null default now()
);

create or replace view sessions as (
with events_by_app as (
  select
    uid,
    app,
    (array_agg(name) filter (where name is not null))[1] as name,
    (array_agg(event))[1] as event,
    min(timestamp) as timestamp
  from
    (select * from events order by timestamp desc)
  group by app, uid
)

select
  uid,
  events_by_app.app as app,
  events_by_app.name as name,
  event,
  timestamp,
  owner
from events_by_app
left join streams
on streams.app = events_by_app.app
);

commit;
