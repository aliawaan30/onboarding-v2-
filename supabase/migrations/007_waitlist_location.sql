-- Adds where they are. Run AFTER the urgent lock-down file.
-- No permission popup for the visitor: their phone already knows its timezone
-- and language, so we just read those. Timezone gives the city or region,
-- language gives the country.

alter table public.waitlist_answers add column if not exists timezone text;
alter table public.waitlist_answers add column if not exists locale   text;

create or replace view public.waitlist_full as
select
  w.name,
  w.email,
  a.phone,
  a.timezone      as where_they_are,
  a.locale        as language,
  w.source        as came_from,
  a.ai_knowledge,
  a.money_goal,
  a.would_use,
  a.completed     as finished_questions,
  w.created_at    as joined_at
from public.waitlist w
left join lateral (
  select * from public.waitlist_answers x
  where x.email = w.email
  order by x.completed desc, x.created_at desc
  limit 1
) a on true
order by w.created_at desc;

alter view public.waitlist_full set (security_invoker = on);
revoke all on public.waitlist_full from anon, authenticated, public;
