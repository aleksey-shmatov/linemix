-- receive: anyone who can read the game
create policy "read game channel"
on realtime.messages
for select
to authenticated
using (
  exists (select 1 from public.games where id::text = realtime.topic())
);

-- send: only someone who may draw in it
create policy "write game channel"
on realtime.messages
for insert
to authenticated
with check (
  exists (
    select 1 from public.games
    where id::text = realtime.topic()
      and visibility = 'open'
  )
);