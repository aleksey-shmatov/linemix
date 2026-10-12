create table doc_updates (
  game_id uuid not null references games(id) on delete cascade,
  seq     bigint not null generated always as identity,
  update  text not null,
  at      timestamptz not null default now(),
  primary key (game_id, seq)
);

alter table doc_updates enable row level security;

create policy "read_doc_updates"
on doc_updates 
for select
to authenticated
using (exists (select 1 from games where games.id = doc_updates.game_id));

create policy "write_doc_updates"
on doc_updates
for insert
to authenticated
with check (exists (select 1 from games where games.id = doc_updates.game_id));
