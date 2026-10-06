create table game_docs (
  game_id    uuid primary key references games(id) on delete cascade,
  doc        jsonb not null default '{"strokes":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into game_docs (game_id, doc) select id, doc from games;
alter table games drop column doc;

create function create_game_doc() returns trigger
language plpgsql security definer as $$
begin
  insert into game_docs (game_id) values (new.id);
  return new;
end;
$$;

create trigger games_create_doc
  after insert on games
  for each row execute function create_game_doc();

alter table game_docs enable row level security;

create policy "docs readable with their game"
  on game_docs for select
  using (exists (select 1 from games g where g.id = game_docs.game_id));

create policy "players draw in open games"
  on game_docs for update to authenticated
  using (exists (
    select 1 from games g
    where g.id = game_docs.game_id
      and (g.owner_id = auth.uid() or g.visibility = 'open')
  ));