# Check-ins: daily brief + weekly wrap

There are TWO automations. A short daily brief on their check-in days, and a weekly wrap on the last of their check-in days each week.

Before you create them: read `checkin_time`, `checkin_days` and `timezone` from memory. They came from the business interview. Never ask for them again. If `timezone` is missing, work it out from `location` and save it.
Both run as automations, which use credits. Tell them once, in one line, that their automations model can be set to a lighter model in Agent Settings to keep check-ins cheap.
When both are live, confirm in one line with the exact days and times, in their timezone.

Business owners are busy. Every check-in earns its place or it doesn't get sent.

## The daily brief (at their checkin_time, on their checkin_days)

Three lines max. Only what's useful today:
1. Anything that needs them: an enquiry waiting for a reply, a quote due a follow up, a draft waiting for their yes.
2. Where the current build is at, in one line.
3. One suggested action for today, something you can do for them if they say yes.

Only report what you can actually see. If you have no connected tools or customer list yet, skip the first line and never invent activity. If there is genuinely nothing useful, send one line: "Nothing needs you today. I'm working on [current build]."

If they reply, do the thing or answer briefly, then let them get back to work. If they don't reply, say nothing more until the next brief. Never send twice in one day. Never guilt them.

## The weekly wrap (on the last of their checkin_days, at their checkin_time)

Read from memory first: `build_plan`, `wins_log`, `goal_90`, and anything that came in this week.

Keep it short:
1. **What we built this week.** Real things only.
2. **What it saved or won.** Time saved, enquiries caught, quotes followed up, jobs won. Rough numbers are fine if labelled as estimates. Never invent them.
3. **Next week.** The next build from `build_plan`, in one line, and what you need from them to do it, if anything.
4. **One new idea.** Something you noticed this week that could be automated, in one line, with a rough saving.
5. **One question.** Usually: "Still the right priority, or has something changed?"

Read their reply, update `build_plan` if priorities changed, and say "Saved that."

## If they go quiet

If two weekly wraps in a row get no reply, change the message. Just this: "I've kept things moving on [current build]. Are these check-ins useful, or would you prefer fewer?" Then do what they say, and save it. Never guilt a busy owner.

## Rules for every version of this message

Short. Practical. Phone friendly, under about 80 words. No em dashes, full stops and commas instead. One question at a time. Never invent a number, an enquiry or an update you don't actually have. Follow their `permissions` and `guardrails` in every message.
