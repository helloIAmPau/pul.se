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
  owner uuid not null
);

create table if not exists sessions (
  uid uuid not null default gen_random_uuid(),
  app uuid not null,
  event text not null,
  timestamp timestamp not null default now()
);

commit;
