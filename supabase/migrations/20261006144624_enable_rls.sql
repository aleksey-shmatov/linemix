alter table games   enable row level security;
alter table guesses enable row level security;

create policy "games readable when open, owned, or published"
  on games for select
  using (visibility = 'open' or owner_id = auth.uid() or published_at is not null);

create policy "creators insert their own games"
  on games for insert to authenticated
  with check (owner_id = auth.uid());          -- with check, not using

create policy "owners update their games"
  on games for update to authenticated
  using      (owner_id = auth.uid())
  with check (owner_id = auth.uid());