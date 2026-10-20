-- Waitlist repair. The table exists but anon has no insert permission,
-- so every signup fails. Paste this whole thing into the Supabase SQL editor
-- and run it. Safe to run more than once.

alter table public.waitlist enable row level security;

drop policy if exists "anyone can join the waitlist" on public.waitlist;
create policy "anyone can join the waitlist"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

grant insert on public.waitlist to anon, authenticated;
grant usage on schema public to anon, authenticated;
