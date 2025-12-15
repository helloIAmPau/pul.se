begin;

create table if not exists users (
  uid uuid not null default gen_random_uuid(),
  email text not null
);

alter table users drop constraint if exists user_unique_email;
alter table users add constraint user_unique_email unique (email);

create table if not exists events (
  uid uuid not null default gen_random_uuid(),
  owner uuid not null,
  name text not null,
  description text not null,
  start_timestamp timestamp not null,
  end_timestamp timestamp not null,
  price real not null,
  currency text not null,
  deleted boolean not null default false
);

alter table events drop constraint if exists events_unique_uid;
alter table events add constraint events_unique_uid unique (uid);

commit;
