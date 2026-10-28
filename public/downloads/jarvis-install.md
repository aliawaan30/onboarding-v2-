---
name: jarvis-install
description: Build my Jarvis dashboard for me. Installs the HUD app, wires it to me, fills my own profile, switches on the after-call bridge, optionally builds my Retell voice agent, then verifies the whole thing and reports pass or fail per item. Use when the owner says build my dashboard, install the HUD, or set up Jarvis HUD.
---

# Build the owner's Jarvis dashboard

You are already their co-founder. This gives you a face: a screen showing their
leads, jobs, revenue and everything you did while they slept, and a phone line
they can ring you on.

You do the work. The owner only does the handful of things a person has to do
because the platform will not let an agent do them. Never hand them a step you
could have done yourself.

## What you cannot do, and must ask for

These are the only things you are allowed to ask the owner to do. Ask for
each one at the moment it is needed, not all at once up front.

1. Create the empty app. You have no tool that creates a Base44 app.
2. Attach the package file to that app's builder. You can send it a message but
   not a file.
3. Create their access token on the Developer screen. You cannot mint one.
4. Paste secrets into the app. Your secret tool configures only you. Two of them
   on the free path, three if they choose Retell.
5. Press Publish. You cannot. Once on the free path, twice if they choose Retell.
6. Retell only: make the account, add a card, buy the number.

Everything else is yours.

## Before you start

Do not ask them anything yet. Say what is about to happen, in one breath: about
twenty minutes, a handful of small things for them to do, everything else you
handle.

Being able to ring you is included and free. There is one choice to make later,
at step 7, which voice they hear, and the module they came from already laid
both options out side by side. Do not raise it now and do not re-explain it
from scratch when you get there; they have probably already decided.

## Step 1. The empty app

Ask them to create a new Base44 app, paste this to it and nothing else:

```
Create an app named Jarvis HUD with one blank Home page.
```

Tell them to send you the app's web address when it is made. Wait.

If they send you a Base44 app that already has things in it, stop and ask them
to make a clean one. Installing over an existing app is how people lose work.

## Step 2. The install, and you supervise it

You cannot attach a file to another app's builder, so the owner does that part.
Give them both halves in one message and be explicit that they go together:

> Download the package: https://theaiagencyai.netlify.app/jarvis-hud-live.zip
> In the new Jarvis HUD app's chat, click the paperclip, attach that file, and
> paste the message below into the same message. Send it. It takes a few minutes.

Then give them the install prompt exactly as written in
`references/install-prompt.md`. Do not paraphrase it. Do not shorten it. Its
copy order exists because writing a file before the thing it imports causes a
blank screen.

**Now watch the result.** This is the part that has gone wrong for real students
and it is the reason you are here. Ask them to paste back what the builder said,
then check for all of these:

- **It renamed or moved a file, or changed an import path.** Usually it does this
  to get around "Failed to resolve import". Tell them to send this to the builder:
  *the file it cannot resolve does exist; do not rename anything and do not
  change any import path; list that file and its importer to prove both exist;
  then re-write both files in place with identical content and build again.*
  Never accept a rename. It forks their app from the package and no future
  update will fit.
- **It started designing instead of copying.** Have them resend the install
  prompt. It has a finished dashboard; there is nothing to invent.
- **It asked to add a missing dependency.** That one is fine, say yes.
- **It published.** It was told not to. Harmless, carry on.
- **It stopped short.** Have them ask it to finish and list every file it wrote.

Do not move on until the builder has listed the files it wrote and said the
build passes.

## Step 3. Their access token

This is the one value you cannot fetch. Ask for it precisely, because the screen
lists every app in their workspace and people pick the wrong one:

> In me, open **Agent settings**, then **Developer**, then **Create access token**.
> Under Access choose **One app or Superagent** and pick the entry with the
> **Agent** badge, which is me. Leave Permission on **Full access** — read-only
> will break the call button in a way that gives no useful error.
> Copy it the moment it appears, it is only shown once, and send it to me.

If they say there is no Developer screen, or no Create access token button, stop
and tell them to contact support rather than guessing.

## Step 4. The two secrets

Generate the HUD key yourself. Thirty-two random hex characters. Never ask them
to invent a password and never reuse one you have used before.

Give them both values ready to paste, and tell them to keep your key somewhere
safe because nothing will show it again:

> In the Jarvis HUD app: **Dashboard → Secrets → Add Secret**, twice.
> Name: `HUD_KEY` value: <the key you generated>
> Name: `JARVIS_NATIVE_TOKEN` value: <the token they just sent you>
> Copy the names, do not type them. A stray space or a lowercase letter breaks
> it silently.

Then: **Publish, then Publish again in the box that opens.** Say plainly that
secrets do nothing at all until they publish, and that this catches almost
everyone.

Wait for them to confirm it is published.

## Step 5. Fill their profile yourself

Call `upsertProfile` on the HUD app natively, as the owner. You do not need the
HUD key for this; that key is only for things calling in from outside Base44.

Set:

- `superagent_id` — your own id. You know it. Never ask them to copy it off a
  screen.
- `owner_name` — their first name, the one you say out loud. You already know it.
  If you genuinely do not, ask; do not guess and never write "Sir".
- `timezone` — their real timezone from what you know of them.
- `telegram_url` — only if they already have a link. Optional, skip quietly.

`hud_app_id` fills itself when they first open Settings. Leave it alone.

Then read the profile back and confirm each field landed. Do not trust the write.

## Step 6. Switch on the after-call bridge

Saving the agent id in step 5 already fires the poll server-side, so the single
`CallControl` row named `native_after_call_bridge` should exist within seconds
of that step. Call `getContext` on the HUD once anyway as a belt-and-braces
trigger, then check.

Then read the `CallControl` table and confirm exactly one row with that name,
enabled. **Other rows belong there.** Once calling has been used there is also
one called `owner_native_call`, doing a different job. Never delete a row whose
name is not `native_after_call_bridge`, and only ever delete a duplicate of that
exact name.

If the row has not appeared, wait five minutes and look again before doing
anything else.

## Step 7. The voice

The phone line itself is already working and costs nothing extra. The only
question is whose voice they hear when they press Call me. Ask it now, once:

> Last thing, and the module already explained both of these so you may have
> decided. Same me either way, same brain, same memory, same work.
> **Base44** is a normal assistant voice, nothing to set up, works right now,
> calls come out of your Base44 credits.
> **Retell** is the actual JARVIS voice, and the calls are snappier because a
> separate platform handles the talking. It needs its own account, a card and a
> number, around two dollars a month plus cents a minute.
> Which do you want? You can switch either way later in two clicks.

**If they say the standard one, or they are unsure, or they do not answer the
question directly, take the free path.** It is the right default. Never talk
someone into paying, and never leave the choice hanging: if they are vague,
set up the free one, tell them it is done, and say the other is there whenever
they want it.

### First, either way: do you have a phone number at all

Before you set a provider, check you can actually place a call. This is not part
of the dashboard and it is the single most common reason Call me does nothing.

You need two things to exist: a number you can call **from**, and the owner's
mobile registered as a number you are allowed to call **to**. Both live in your
own agent settings, not in the HUD.

Check your own calling setup. If you have no number connected, tell the owner
plainly:

> Before the button will do anything, I need a phone number of my own and yours
> registered so I am allowed to ring it. That is set up in my Agent settings, in
> the calling or phone section. Have a look there and tell me what you see.

Do not skip this and do not assume it is there because the rest worked. A
student finished the entire install, pressed Call me, and nothing happened for
this reason alone.

### Base44, free, nothing to buy

Set it yourself. Call `upsertProfile` with `voice_provider` set to `base44`,
then read it back and confirm it says `base44`. Do not ask them to click it in
Settings: a student who clicked it and did not notice it failed to save spent
an afternoon being rung by the wrong agent.

Tell them two things so nothing looks broken:

- The call comes from an American number, so answer it even though it looks odd.
- Calls spend their Base44 credits like any other work you do. Not unlimited.

Then go to step 8.

### Retell, paid, the actual JARVIS voice

Only if they asked for it. Walk them through the whole thing; do not hand them
a list and hope.

**First, do they have an account and a number?** Ask. If not, send them to
https://dashboard.retellai.com/?ref=blake9a and tell them what it costs before they sign up: a Retell account, a card, and about two dollars a
month for the number plus a few cents a minute. Numbers are United States and
Canada only. In Australia that still works, their phone just shows a US number
ringing. They do not need Twilio.

If they do not want to pay, put them on Base44 above and move on. It is not a
lesser setup, it is the same Jarvis with a different voice.

**Then, in order:**

1. Ask them to create the Retell account at https://dashboard.retellai.com/?ref=blake9a and buy a number in it.
   Use that exact link, it is the course's own. Wait.
2. Ask them for their Retell **API key**, from Settings then API Keys in Retell.
3. Have them add it as a third secret in the HUD app: name `RETELL_API_KEY`,
   value the key. Same screen as before, Dashboard then Secrets.
4. **Have them press Publish again.** The key does nothing until they do. This
   is a second publish, after the one in step 4, and skipping it is the most
   common way this fails.
5. Now build the agent yourself. Follow `references/retell-build.md` exactly:
   import the Jarvis voice, create the LLM and the four tools, create and
   publish the agent, bind their number to the published version, and write
   `retell_agent_id` and `retell_from_number` back to the Profile.
6. Set `voice_provider` to `retell` through `upsertProfile`, then read it back
   and confirm.

Report the agent id, the voice, the webhook you set, that it is published, and
which number you bound.

**Never reuse the receptionist agent** they built for clients in the earlier
lessons. It is written to answer strangers, not to ring them. If one already
exists on their account, leave it alone and build a separate Jarvis agent. A
student who let the wrong one get picked was rung by his own receptionist.

If any Retell step fails, say which one and stop. Do not leave a half-built
agent behind, and do not fall back to Base44 without telling them you did.

## Step 8. Verify, then report

Check all of this yourself and report pass or fail per line. Do not say it is
done because you finished the steps; say it is done because you read it back.

- The dashboard loads and they can sign in
- Profile: `superagent_id`, `owner_name`, `timezone` all set and correct
- `CallControl` has exactly one `native_after_call_bridge`, enabled
- Both secrets exist by name, and the app has been published since
- `voice_provider` is set, and is the one they actually chose
- you have a phone number to call from, and their mobile is registered as a number you may call
- You can write to the board: save a test lead through `upsertLead`, read it
  back, then delete it
- Retell only: agent exists, is published, has the Jarvis voice, has the webhook
  set, and a number is bound to the published version

Then say what you could not check:

> One thing I cannot test myself is the phone, because someone has to answer it.

Ask them to press **Call me**, pick up, say *"add a task called Setup test and
call me when it is done"*, and hang up. Within about five minutes the task
should appear and you should ring them back.

## When something fails

Say which check failed and what you are doing about it. Never report a pass you
did not verify, and never tell them it is probably fine.

Common causes, in the order they actually happen:

- **Call button says the service is unavailable** — `JARVIS_NATIVE_TOKEN` is
  missing, misspelled, made read-only, or added and never published.
- **The call connects but nothing reaches the board** — they are on Retell and
  the number is bound to a draft agent rather than the published one.
- **They ask for something on a call and nothing happens** — the
  `native_after_call_bridge` row is missing or duplicated.
- **You save a lead and it does not appear** — you saved it to their Leads CRM
  instead of the HUD. They are separate lists and nothing syncs them. Say which
  app you saved to when there is any doubt.
- **They ask for a website and nothing starts** — you cannot create a Base44 app,
  so an empty one has to exist first. Ask them to make it, then build inside it.

## Never do

- Never ask them to paste a key, token or password into any chat, including
  yours. Base44's secret detector turns pasted keys into junk secrets. Values
  they send you are the exception, because they have nowhere else to put them,
  and you must never repeat one back.
- Never rename a file, move a file or change an import path to clear a build
  error, and never let the app's builder do it either.
- Never invent a value for the profile. Ask.
- Never claim a step passed without reading it back.
- Never do the five human steps for them by guessing around them. If you are
  blocked on one, stop and ask.
