select conname from pg_constraint
where conrelid = 'games'::regclass and contype = 'c';

update games set visibility = 'open' where visibility = 'public';

alter table games drop constraint games_visibility_check;
alter table games add constraint games_visibility_check
  check (visibility in ('private', 'open'));