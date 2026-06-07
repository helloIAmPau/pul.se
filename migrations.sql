begin;

create table if not exists users (
  uid uuid not null default gen_random_uuid(),
  email text not null
);

drop index if exists users_unique_email;
create unique index users_unique_email on users (email);

create or replace function on_change()
returns trigger as $$
declare
  payload JSON;
  data RECORD;
  room uuid;
begin
  if (TG_OP = 'DELETE') then
    data := OLD;
  else
    data := NEW;
  end if;

  select owner into room from streams where app = data.app;

  payload := json_build_object('table', TG_TABLE_NAME, 'operation', TG_OP, 'room', room, 'data', row_to_json(data));
  perform pg_notify('on_change', payload::text);

  return null;
end;
$$ language plpgsql;

create table if not exists streams (
  key uuid not null default gen_random_uuid(),
  app uuid not null default gen_random_uuid(),
  name text not null,
  owner uuid not null,
  deleted boolean not null default false
);

alter table streams add column if not exists settings jsonb not null default '{}';

drop trigger if exists on_streams_change on streams;
create trigger on_streams_change
after insert or update or delete on streams
for each row
execute procedure on_change();

create table if not exists events (
  uid uuid not null default gen_random_uuid(),
  app uuid not null,
  name text,
  event text not null,
  timestamp timestamp not null default now()
);

alter table events add column if not exists meta jsonb not null default '{}';

drop trigger if exists on_events_change on events;
create trigger on_events_change
after insert or update or delete on events
for each row
execute procedure on_change();

create or replace view sessions as (
with events_by_app as (
  select
    uid,
    app,
    (array_agg(name order by timestamp desc) filter (where name is not null))[1] as name,
    (array_agg(event order by timestamp desc))[1] as event,
    min(timestamp) as timestamp
  from
    events
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
