-- Waitlist for the reels funnel.
-- Anonymous visitors can add themselves. Nobody can read the list from the browser.
-- Paste this whole file into the Supabase SQL editor and run it.

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null unique,
  source     text default '',
  created_at timestamptz not null default now()
);

-- emails stored lowercase and trimmed so the unique constraint actually works
create or replace function public.waitlist_normalise()
returns trigger language plpgsql as $$
begin
  new.email := lower(trim(new.email));
  new.name  := trim(new.name);
  return new;
end; $$;

drop trigger if exists waitlist_normalise on public.waitlist;
create trigger waitlist_normalise
  before insert on public.waitlist
  for each row execute function public.waitlist_normalise();

alter table public.waitlist enable row level security;

-- The page inserts with the public anon key, so anon may INSERT and nothing else.
drop policy if exists "anyone can join the waitlist" on public.waitlist;
create policy "anyone can join the waitlist"
  on public.waitlist for insert to anon, authenticated
  with check (true);

revoke all on public.waitlist from anon, authenticated;
grant insert on public.waitlist to anon, authenticated;
-- No select grant: the list is readable only from the Supabase dashboard or the service role.

-- Turn a waitlist signup into a student when the course opens:
--   select * from invite_student('their@email.com', 'Their Name');
