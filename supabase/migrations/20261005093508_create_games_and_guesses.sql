-- games: one row per drawing. `doc` holds the current stroke set.
create table games (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  owner_id     uuid not null references auth.users(id) on delete cascade,
  visibility   text not null default 'private'
                 check (visibility in ('private', 'public', 'open')),
  doc          jsonb not null default '{"strokes":[]}'::jsonb,
  created_at   timestamptz not null default now(),
  published_at timestamptz
);

-- guesses: a real table because it gets queried, not just loaded wholesale.
create table guesses (
  id        uuid primary key default gen_random_uuid(),
  game_id   uuid not null references games(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  label     text not null,
  accepted  boolean not null,
  verdict   jsonb not null,
  at        timestamptz not null default now()
);

create index guesses_game_at on guesses (game_id, at desc);