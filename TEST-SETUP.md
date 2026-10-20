# Testing the new onboarding (two paths)

The page looks and works exactly like today. One addition: at the top, where "Watch this first" sits, students first pick their path, business owner or AI agency builder. Everything after that is the same steps, same videos, same gates and the same setup key. The only differences are the wording on some steps and the files they download, which are the improved versions for their path.

All questions are asked by the agent in the interview at Step 5, as today.

## What changed in the code

1. src/App.tsx: the path choice card at the top, and the path saved with their progress.
2. src/content/steps.ts: business owner wording for the intro and Steps 1, 3 to 11. Agency wording is unchanged.
3. src/lib/files.ts: hands out the agency or business version of each file. File names stay the same.
4. src/templates/agency and src/templates/business: the improved files for each path. The old files in src/templates are replaced.
5. supabase/migrations/009_onboarding_paths.sql: adds a path column to students. Additive only.

## Test setup, about 30 minutes

### 1. GitHub
Create a new private repo, for example onboarding-v2-test. The project includes about 300MB of course videos, so use GitHub Desktop to commit and push rather than the website upload.

### 2. Supabase, a separate test project
Use a new free project, not the live one.
1. Create the project.
2. SQL Editor, New query. Run these files one at a time, in this order:
   supabase/migrations/001_init.sql
   supabase/migrations/002_self_signup.sql
   supabase/migrations/009_onboarding_paths.sql
   The waitlist files, 003 to 008, are not needed to test onboarding.
3. Authentication, URL Configuration. Set Site URL to your Netlify link, and add it under Redirect URLs. Without this, sign in email links will not work.
4. Project Settings, API. Copy the Project URL and the anon public key.

### 3. Netlify, the dummy account
1. Add new site, Import from GitHub, pick the test repo.
2. Build command: npm run build. Publish directory: dist.
3. Site configuration, Environment variables:
   VITE_SUPABASE_URL = the Project URL
   VITE_SUPABASE_ANON_KEY = the anon public key
4. Deploy. Then set the Site URL in Supabase to this link if you have not yet.

### 4. Quick look without signing in
Add ?film to the end of the Netlify link. No sign in, nothing saves.

## The real test

Two email addresses you own, one per path, and a fresh Base44 agent for each. Follow every step exactly as a student would, using the downloaded files, and note anything confusing, slow or wrong with a screenshot.

## Going live later

When Blake approves, the same changes go into the live repo on a new branch. Run 009_onboarding_paths.sql on the live Supabase first. Students who already started are set to the agency path automatically, so they never see the choice halfway through.
