# Onboarding portal, Start Your AI Agency

The invite only page a student lands on after the sales call. Eight steps, one
vertical flow, each gate unlocks the next. They download their personalised
files, do the work in Base44, come back, tick or type, and the page dings, fills
a segment and scrolls them to the next step. The last gate takes their personal
setup code, fires confetti once, and points them at Skool.

Stack: Vite, React, TypeScript, Supabase (auth plus one table). Static SPA, no
server code. Deploys to Netlify.

---

## 1. Run it locally

```bash
npm install
cp .env.example .env
# fill in the two values, then
npm run dev
```

Env vars, both from Supabase, Project Settings, API:

| Variable | Where it comes from |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon public key (safe in the browser, RLS does the guarding) |

`npm run build` type checks and builds to `dist/`. `npm run preview` serves that
build.

---

## 2. Apply the database migration

Open Supabase, SQL Editor, New query. Paste the whole of
`supabase/migrations/001_init.sql` and run it once. It creates:

- the `students` table
- row level security so a signed in student can read and update only their own
  row, and can never change their email or their setup code
- `invite_student(email, first_name)`, the function you use to invite people

Nothing in this repo applies the migration for you. Run it yourself.

---

## 3. Invite a student

Every student must exist in `students` before they can get in. There is no self
signup. In the SQL Editor:

```sql
select * from invite_student('sam@example.com', 'Sam');
```

It returns the new row, including the generated `setup_code`, something like
`HARBOUR-SIGNAL-47`. That code is theirs. It gets baked into their `brain.md` at
download time, their agent gives it back to them at the end of setup, and it is
the answer to the Step 8 gate. You do not need to send it to them.

To see a code again:

```sql
select email, first_name, setup_code, current_step, agent_name
from students order by created_at desc;
```

Then tell the student to go to the portal and sign in with that exact email.

### Keeping it invite only

The students table is the real gate: sign in with an unknown email and the page
shows a warm "this page is invite only" screen, no course content. Harden it
further in Supabase, Authentication, Sign In / Providers:

- Turn OFF "Allow new users to sign up" so unknown emails cannot even create an
  auth user. If you do this, you must also create the auth user for each
  student, in Authentication, Users, Invite user, using the same email you
  passed to `invite_student()`.
- Keep Email enabled with magic link. No passwords are used.
- Add your production domain under Authentication, URL Configuration, Site URL
  and Redirect URLs, otherwise the magic link will bounce to localhost.

---

## 4. Add the Loom videos

`src/config/looms.ts` maps a step number to a Loom url. Key `0` is the intro
video at the top of the page, `1` to `8` are the steps. Paste the normal Loom
share url, the app converts it to an embed url. Any step left empty renders a
labelled placeholder box, so the page is safe to show before the videos exist.

`src/config/app.ts` holds two more knobs: `SKOOL_URL` (the finish screen shows
an "Open Module 1" button once it is set) and `BLAKE_CONTACT` (an email or
handle shown on the invite only screen, hidden while it is empty). Both start
empty, fill them in before you send anyone the link.

---

## 5. Deploy to Netlify

1. Push this repo to GitHub, its own repo, not the course repo.
2. Netlify, Add new site, Import an existing project, GitHub, pick the repo.
3. Netlify reads `netlify.toml`, so build command `npm run build` and publish
   directory `dist` are already set. Leave them.
4. Before the first deploy, open Site configuration, Environment variables, Add
   a variable, and add both:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   These are read at build time, so any time you change them you must trigger a
   new deploy.
5. Deploy. Then Domain management, add the domain you want.
6. Go back to Supabase, Authentication, URL Configuration, and set Site URL to
   the live domain, and add it to Redirect URLs. Magic links will not work until
   you do.

The SPA redirect, `/*` to `/index.html` with status 200, is already in
`netlify.toml`. Without it, a refresh on the magic link return would 404.

---

## How the gates work

| Step | Gate |
| --- | --- |
| 1. Create your co-founder | tick |
| 2. Give it its brain | type the reply, "Locked in. Ready when you are.", case and punctuation forgiving |
| 3. Meet it | type the commitment phrase, then "What did you name it?" saves the agent name |
| 4. Give it its skills | tick |
| 5. Make it check in on you | tick |
| 6. Put it in your phone | tick |
| 7. Watch what it can do | tick |
| 8. Confirm and unlock Skool | their personal setup code, exact after trim and uppercase |

The commitment phrase is generated by the agent, so the page cannot match it
exactly. It accepts anything at least ten characters long that contains the
student's first name, which is what that phrase always carries.

Progress lives in the `students` row, not the browser, so they resume on any
device. Saves are optimistic and retry with backoff, and the header shows the
save state.

## Files

```
src/
  App.tsx              state, gates, persistence, the dopamine loop
  content/steps.ts     the eight steps, all student facing copy
  config/looms.ts      step to Loom url
  config/app.ts        Skool url, contact email
  components/          progress bar, step card, gates, copy and download
  lib/                 supabase, sound, haptics, confetti, file generation
  templates/           the four agent files, copied from setup/, imported raw
supabase/migrations/001_init.sql
```

The four templates in `src/templates/` are copies of the source files in the
course repo (`setup/agent-brain.md`, `agent-soul-interview.md`,
`agent-skill-pack.md`, `agent-heartbeat.md`). When those change, copy them over
again and redeploy.

No em-dashes anywhere in student facing text. Keep it that way.
