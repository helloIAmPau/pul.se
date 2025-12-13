begin;

create table if not exists users (
  uid uuid not null default gen_random_uuid(),
  email text not null
);

alter table users drop constraint if exists user_unique_email;
alter table users add constraint user_unique_email unique (email);

commit;
