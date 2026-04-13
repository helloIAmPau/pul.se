begin;

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
