create table doc_snapshots (
    game_id   uuid not null primary key references games(id) on delete cascade,
    update      text        not null,
    merged_seq bigint not null,
    at          timestamptz not null default now()
);

alter table doc_snapshots enable row level security;

create policy "read_doc_snapshots"
on doc_snapshots 
for select
to authenticated
using (exists (select 1 from games where games.id = doc_snapshots.game_id));

-- No write policy for doc_snapshots as they are managed by the compactor script
