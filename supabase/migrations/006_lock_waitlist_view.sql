-- URGENT. Run this now.
-- The waitlist_full view is currently readable by anyone with the public key,
-- which means the whole list of emails and phone numbers is exposed.
-- This closes it. It does not delete anything.

-- 1. no public access to the view
revoke all on public.waitlist_full from anon, authenticated, public;

-- 2. make the view obey row level security instead of running as its owner
alter view public.waitlist_full set (security_invoker = on);

-- 3. answers table: visitors may add, nobody may read
revoke all on public.waitlist_answers from anon, authenticated, public;
grant insert on public.waitlist_answers to anon, authenticated;

-- 4. belt and braces on the waitlist itself
revoke all on public.waitlist from anon, authenticated, public;
grant insert on public.waitlist to anon, authenticated;

-- You can still read everything from the dashboard or the SQL editor:
--   select * from public.waitlist_full;
