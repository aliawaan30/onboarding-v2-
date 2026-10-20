-- Self signup: anyone who authenticates can create their own student row.
-- Run this whole file once in the Supabase SQL editor.

create or replace function public.signup_student(p_first_name text)
returns public.students
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(auth.jwt() ->> 'email');
  v_words text[] := array[
    'GREEN','LIGHT','SOLID','READY','FIRST','CLIENT','SHARP','NORTH','STEADY','BRIGHT',
    'CLEAR','STRONG','QUICK','HONEST','CALM','BOLD','FRESH','PRIME','TRUE','ANCHOR',
    'SIGNAL','SUMMIT','ENGINE','LADDER','COMPASS','HARBOUR','RUNWAY','BEACON','MOMENTUM','GROUND'
  ];
  v_n    int := array_length(v_words, 1);
  v_code text;
  v_row  public.students;
begin
  if v_email is null or v_email = '' then
    raise exception 'not signed in';
  end if;
  if p_first_name is null or trim(p_first_name) = '' then
    raise exception 'first name is required';
  end if;

  select * into v_row from public.students where email = v_email;
  if found then
    return v_row;
  end if;

  loop
    v_code :=
      v_words[1 + floor(random() * v_n)::int] || '-' ||
      v_words[1 + floor(random() * v_n)::int] || '-' ||
      lpad((10 + floor(random() * 90))::int::text, 2, '0');
    exit when not exists (select 1 from public.students s where s.setup_code = v_code);
  end loop;

  insert into public.students (email, first_name, setup_code)
  values (v_email, trim(p_first_name), v_code)
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.signup_student(text) to authenticated;
revoke execute on function public.signup_student(text) from anon, public;
