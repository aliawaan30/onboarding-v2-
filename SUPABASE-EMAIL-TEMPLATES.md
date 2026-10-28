# The two sign in emails

Supabase Dashboard -> Authentication -> Emails -> Templates, on project
`klyiqncsgxcrbdgonaaj`. There are two to change: **Magic Link** (a student who
has signed in before) and **Confirm signup** (a brand new one). Students hit
both, so both have to carry the code.

## Why the code and not the link

A Supabase link is single use. Three things burn it before the student ever
taps it:

1. Mail security scanners at iCloud and Outlook fetch every link in an email to
   check it is safe, which uses the link up.
2. Asking for a second email voids the first one, so tapping an older email
   fails and asking again makes it worse.
3. The mail app opens links in its own browser, not the one they signed up in,
   so the session lands in a window they never see.

Measured over 171 sends: 17% of students needed three or more emails and every
one was delivered. iCloud 33%, Outlook 25%, Gmail 13%.

**Leave the link out.** If the link is in the email the scanner still burns the
token, and the code dies with it. Code only is the whole point.

## Magic Link

Subject:

```
{{ .Token }} is your sign in code
```

Body:

```html
<div style="font-family:-apple-system,system-ui,Segoe UI,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#14201a">
  <p style="margin:0 0 4px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#5f7168">The AI Agency Builder</p>
  <h1 style="margin:0 0 20px;font-size:23px;line-height:1.25">Here is your sign in code</h1>
  <p style="margin:0 0 20px;font-size:16px;line-height:1.55">Type these six digits into the tab you left open.</p>
  <p style="margin:0 0 24px;font-size:40px;font-weight:800;letter-spacing:.16em;color:#0a7f52">{{ .Token }}</p>
  <p style="margin:0 0 8px;font-size:15px;line-height:1.55">It works for one hour, then ask for a fresh one.</p>
  <p style="margin:0;font-size:14px;line-height:1.55;color:#5f7168">If you did not ask to sign in, ignore this and nothing happens.</p>
</div>
```

## Confirm signup

Same email, one word different in the heading, because this one is their very
first time.

Subject:

```
{{ .Token }} is your code to get started
```

Body:

```html
<div style="font-family:-apple-system,system-ui,Segoe UI,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#14201a">
  <p style="margin:0 0 4px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#5f7168">The AI Agency Builder</p>
  <h1 style="margin:0 0 20px;font-size:23px;line-height:1.25">Here is your code to get started</h1>
  <p style="margin:0 0 20px;font-size:16px;line-height:1.55">Type these six digits into the tab you left open and you are in.</p>
  <p style="margin:0 0 24px;font-size:40px;font-weight:800;letter-spacing:.16em;color:#0a7f52">{{ .Token }}</p>
  <p style="margin:0 0 8px;font-size:15px;line-height:1.55">It works for one hour, then ask for a fresh one.</p>
  <p style="margin:0;font-size:14px;line-height:1.55;color:#5f7168">If you did not sign up for this, ignore this and nothing happens.</p>
</div>
```

## After you paste them

Put your own email through the onboarding page and check three things: the code
is in the subject line so it shows in the notification without opening the
email, typing it into the page signs you in, and the email is not in junk.

## One more setting worth raising

Authentication -> Emails -> SMTP Settings has **Minimum interval per user**, set
to 30 seconds. That is fine now. What is not obvious is that a student asking
again voids their previous code, so the page should be the only place they are
told to wait. It already says that.
