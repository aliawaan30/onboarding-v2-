import type { TemplateKey } from '../lib/files'

export interface Ctx {
  firstName: string
  /** The agent's real name once they have named it, otherwise a neutral fallback. */
  agent: string
  /** Possessive form, e.g. "Rocky's" or "your agent's". */
  agentPossessive: string
  /** True on the business owner path. */
  biz: boolean
}

export type GateKind = 'tick' | 'typed' | 'code' | 'phrase'

export interface PromptDef {
  label: string
  text: (c: Ctx) => string
  /** Step 10 lets them swap the brand inside the prompt. */
  brandPicker?: boolean
  /**
   * For a message that needs an attachment: what to send instead from a phone,
   * where the agent fetches the file itself rather than the student attaching it.
   */
  phoneText?: (c: Ctx) => string
}

export interface DownloadDef {
  key: TemplateKey
  label: string
  note?: string
}

/** Option B on the file steps: copy the whole personalised file instead of uploading it. */
export interface PasteDef {
  key: TemplateKey
  /** Appended to the end of the file text so one paste does the whole job. */
  tail: string
}

export interface StepDef {
  n: number
  title: string
  time: string
  videoLabel: string
  body: (c: Ctx) => string[]
  /** A can't-miss line with a little check in front of it. */
  callout?: (c: Ctx) => string
  /** A get-unstuck note under the steps, for when the screen does not match. */
  footnote?: (c: Ctx) => string[]
  downloads?: DownloadDef[]
  paste?: PasteDef
  prompts?: PromptDef[]
  expect: (c: Ctx) => string
  gate: {
    kind: GateKind
    /** Tick gates: the button text. Typed gates: the field label. */
    label: string
    placeholder?: string
    help?: string
    /** Code gates: check against this instead of their personal setup code. */
    code?: string
    /**
     * Code gates: what to tell someone whose code keeps failing. Without this they get the
     * default, which points at the final SETUP CODE and is only right for the last step.
     */
    stuck?: string
  }
}

/**
 * The step that holds the door until they name their agent.
 * This MUST be the soul interview. brain.md forbids the agent asking anything
 * before that file runs, and the interview's second question is literally
 * "what are you going to call me?". Asking earlier leaves the student with
 * nothing to type.
 */
export const NAME_STEP = 5

export const INTRO = {
  title: 'Build Your AI Co-founder',
  body: (c: Ctx) =>
    c.biz
      ? [
          `${c.firstName}, in the next half hour you build your business its own AI chief of staff. Mine runs my entire company. It answers, builds, follows up and checks in on me every morning like a right hand who never sleeps.`,
          `Yours is about to do the same for your business. First it learns how your business really runs. Then it gets to work: a better website, every enquiry caught, quotes followed up, and time back in your week.`,
          `Nothing here is technical. If you can copy and paste, you are overqualified. Do it step by step and it is yours for good.`,
          `One thing before you start. Finish this whole page to unlock the community. Your chief of staff holds your key and only hands it over once everything is genuinely done.`,
        ]
      : [
          `${c.firstName}, in the next half hour you build the most valuable thing in this whole course. Your own super agent. Mine runs my entire agency. It finds the businesses, it builds the work I sell them, and it checks in on me every morning like a co-founder who never sleeps.`,
          `Yours is about to do the same for you. First it learns who you are and what you actually want. Then it runs your AI agency with you: finds local businesses that need you, writes your messages, builds the real services you sell, and keeps you honest every week until you land your first client.`,
          `Nothing here is technical. If you can copy and paste, you are overqualified. Do it step by step and it is yours for good.`,
          `One thing before you start. You have to finish this whole page to get into the course. Every step, all the way to the bottom. Your co-founder holds your key and it only hands it over once the lot is genuinely done, and that key is what opens the community and every module in it.`,
        ],
}

export const WATCH = {
  title: 'Watch this first',
  time: '~5 min',
  videoLabel: "Blake, 5 min, what you're about to build",
  body: () => [
    'Five minutes on exactly what you are building today, and why everything after this runs through it.',
  ],
  gateLabel: "Watched it. Let's build",
}

export const STEPS: StepDef[] = [
  {
    n: 1,
    title: 'Bring it to life',
    time: '~2 min',
    videoLabel: 'Blake, 1 min, screen',
    body: () => [
      'You are about to meet the thing that runs your business with you.',
      'In Base44, click Superagents, then Create a new Superagent. When it asks what you want, paste the line below and send it. Nothing else yet.',
    ],
    prompts: [
      { label: 'Paste this when it asks', text: () => 'My co-founder for my AI agency.' },
      { label: 'Then send this', text: () => 'Hey, you are my co-founder for my AI agency.' },
      {
        label: 'And then this',
        text: () =>
          "In a moment I'm going to send you a couple of files that set you up properly. For now just reply, awesome, let's get started.",
      },
    ],
    callout: () =>
      'Base44 might name it something already. Ignore that. You name it properly in a few minutes.',
    expect: () => 'a brand new agent that answers you. That is your co-founder before any of its training.',
    gate: { kind: 'tick', label: "It's alive. Next" },
  },
  {
    n: 2,
    title: 'Make it remember you',
    time: '~1 min',
    videoLabel: 'Blake, 1 min, screen',
    body: () => [
      'Right now your agent forgets you the second you close the chat. One quick setting fixes that for good. Watch it, then follow these three taps.',
      '1. In your agent, click Agent settings at the top.',
      '2. Click Sharing and access.',
      '3. Find Memory and switch it to Shared. Done.',
      'Now send the message below and your agent will confirm the setting worked.',
    ],
    footnote: () => [
      'No Sharing and access on that screen? Some accounts do not have it there. The same setting lives somewhere else:',
      '1. In the left sidebar, under Agent Settings, click More.',
      '2. Click Memory.',
      '3. On the Memory page, click Change access in the top right, then switch it to Shared.',
    ],
    prompts: [
      {
        label: 'Send this message',
        text: () =>
          "I've just switched your memory to Shared. Confirm you'll now remember me and everything we do together, across every chat and every device, permanently.",
      },
    ],
    callout: () =>
      'Do not skip this one. Without it you start from scratch every single chat.',
    expect: () =>
      'it confirms it will remember you from now on. One memory, every chat, every device.',
    gate: { kind: 'tick', label: "It's on. Next" },
  },
  {
    n: 3,
    title: 'Give it its brain',
    time: '~3 min',
    videoLabel: 'Blake, 1 min, screen',
    body: () => [
      'This file is who your co-founder is. How it talks, how it works with you, what it pushes you on. It was written for you personally.',
      'Download it below, upload it to your agent in the chat, then send the message underneath.',
    ],
    downloads: [{ key: 'brain', label: 'Download brain.md', note: 'Made for you. Just upload it.' }],
    paste: {
      key: 'brain',
      tail: "That is your operating brief, it's who you are from now on. Save everything in it to your memory permanently and follow it from here on. Then reply exactly the way the brief tells you to reply, and nothing else.",
    },
    prompts: [
      {
        label: 'Send this message',
        text: () =>
          "I've just given you a file called brain.md. That is your operating brief, it's who you are from now on. Read it, save everything in it to your memory permanently, and follow it from here on. Then reply exactly the way the file tells you to reply, and nothing else.",
      },
    ],
    expect: () =>
      'it replies "Locked in. Ready when you are." Nothing else. If you get anything else, send the message again.',
    gate: { kind: 'tick', label: 'It said it. Next' },
  },
  {
    n: 4,
    title: 'Let it meet you',
    time: '~2 min',
    videoLabel: '',
    body: (c) => [
      `${c.agent} has its brain. Now find out what that actually means. No video needed here, just two things to do.`,
      `1. Copy the message below and send it to ${c.agent}.`,
      '2. Read what comes back properly, all of it. Do not skim this one.',
      'This is the first time it thinks about you and your situation instead of somebody else, and you want to see the difference with your own eyes.',
    ],
    prompts: [
      {
        label: 'Send this message',
        text: () =>
          'Before we start, tell me who you are, what you and I are building together, and what you think my biggest advantage is starting an AI agency right now.',
      },
    ],
    expect: (c) =>
      `${c.agent} tells you who it is and what the two of you are building. Not a generic AI answer. That is the brain working.`,
    gate: { kind: 'tick', label: 'Read it. Next' },
  },
  {
    n: 5,
    title: 'The soul interview',
    time: '~8 min',
    videoLabel: 'Blake, 2 min, a slice of his own interview',
    body: (c) => [
      `The big one. Everything so far made ${c.agent} smart. This is what makes it yours.`,
      'Download the file, give it to your agent, then send the message underneath. It asks you real questions, one at a time. Answer honestly, nobody sees this but you two.',
      'At the very end it gives you a code. Paste that code in the box below to move on, so make sure you finish the whole interview.',
    ],
    downloads: [{ key: 'soul-interview', label: 'Download soul-interview.md' }],
    paste: {
      key: 'soul-interview',
      tail: 'Run this interview with me now.',
    },
    prompts: [{ label: 'Send this message', text: () => 'Run this interview with me now.' }],
    expect: () =>
      'a real conversation, one question at a time. It ends with a card about you, your own line for when you feel like quitting, and then your code.',
    gate: {
      kind: 'code',
      label: 'Paste your code',
      placeholder: 'Paste the code it gives you',
      code: 'SOUL-DONE-12',
      help: 'Your co-founder sends this at the very end of the interview. What you two talked about stays between you, this page never sees any of it.',
      stuck: 'This code only comes at the very end of the soul interview, on the last line of its final message, right after your anti-quit line. If the interview is finished and you missed it, send your co-founder this: "Send me the code from the end of my soul interview again." Do not ask for your SETUP CODE here, that is a different code for the last step.',
    },
  },
  {
    n: 6,
    title: 'Load its skills',
    time: '~3 min',
    videoLabel: 'Blake, 1 min, screen',
    body: (c) => [
      `Skills are the jobs your agent knows how to do. You get to choose them, and we have already built out every skill your agent needs to run an AI agency.`,
      `Finding your leads, researching any business, writing your outreach, prepping your sales calls, handling a no, building demos, writing proposals. Give this file to ${c.agent} the same way you gave it the brain, and it can run your entire agency from here on.`,
    ],
    downloads: [{ key: 'skills', label: 'Download skills.md' }],
    paste: {
      key: 'skills',
      tail: 'These are your skills. Add them to your brain and use them whenever they fit.',
    },
    prompts: [
      {
        label: 'Send this message',
        text: () => 'These are your skills. Add them to your brain and use them whenever they fit.',
      },
      { label: 'Then ask it this', text: () => 'What can you help me with now?' },
    ],
    expect: (c) =>
      `${c.agent} lists real jobs it can now do for you. Read that list. That is your new payroll, and it costs you nothing.`,
    gate: { kind: 'tick', label: 'Skills loaded. Next' },
  },
  {
    n: 7,
    title: 'Get your first plan',
    time: '~2 min',
    videoLabel: '',
    body: (c) => [
      `${c.agent} knows who you are and it now knows how to do the work. So put it straight to work. No video needed here, just three things to do.`,
      `1. Copy the message below and send it to ${c.agent}.`,
      '2. Read the answer properly. It should name one service, a rough price, and what your first week looks like.',
      '3. If any of those three is missing or vague, reply with "be more specific" and send it again.',
      'Keep that answer somewhere. It is your starting plan and you will come back to it.',
    ],
    prompts: [
      {
        label: 'Send this message',
        text: () =>
          'Based on everything you know about me, which of the three services should I sell first, roughly what would a local business pay me for it, and what should my first week look like? Keep it short and specific.',
      },
    ],
    expect: (c) =>
      `a straight answer: the service to start with, what it is worth, and what to do this week. That is ${c.agent} doing the thinking for you, and it is only day one.`,
    gate: { kind: 'tick', label: 'Locked. Next' },
  },
  {
    n: 8,
    title: 'Make it keep you honest',
    time: '~4 min',
    videoLabel: 'Blake, 1 min, screen',
    body: (c) => [
      `Every founder who makes it has someone who will not let them drift. Yours comes built in.`,
      `On the days and at the time you chose in the interview, ${c.agent} checks in. Every Sunday it sits you down and looks at your week with you. Download the file, give it to your agent, then send the message underneath.`,
    ],
    downloads: [{ key: 'check-ins', label: 'Download check-ins.md' }],
    paste: {
      key: 'check-ins',
      tail: 'That is your check-ins brief. Set up both automations exactly as it describes. One message at my check-in time on my check-in days, and the Sunday check-in. Tell me when they are live.',
    },
    prompts: [
      {
        label: 'Send this message',
        text: () =>
          "I've just given you a file called check-ins.md. Set up both automations exactly as that file describes. One message at my check-in time on my check-in days, and the Sunday check-in. Tell me when they are live.",
      },
    ],
    expect: (c) =>
      `${c.agent} says both are live. Then check for yourself: open its Automations page and you should see two, one on your check-in days and one on Sunday. If they are not there, ask it to set them up again.`,
    gate: { kind: 'tick', label: 'Both are there. Next' },
  },
  {
    n: 9,
    title: 'Put it in your phone',
    time: '~4 min',
    videoLabel: 'Blake, 2 min, screen and phone',
    body: (c) => [
      `From here on it is not an app you visit. It is a co-founder in your pocket.`,
      `In ${c.agentPossessive} settings, open Channels and connect Telegram. Follow the steps on screen. If you would rather use WhatsApp, that works the same way.`,
      'Then message it from your phone.',
    ],
    callout: () => 'Telegram is the one I use every day. Pick that one if you are not sure.',
    expect: (c) =>
      `${c.agent} replies on your phone. Same brain, same memory, wherever you are.`,
    gate: { kind: 'tick', label: "It's in my phone. Next" },
  },
  {
    n: 10,
    title: 'See what it can do',
    time: 'Your first website',
    videoLabel: 'Blake, 2 min, live',
    body: (c) => [
      `You have built it. Now watch what you built.`,
      `Pick one of the four brands below. Download the brand pack, attach it in ${c.agentPossessive} chat, and send the message. Your co-founder will turn the prepared design and real brand imagery into your own working concept page.`,
      `On your phone? Phones will not attach a zip file, so do not download anything. Use the phone message under the brand picker instead and your co-founder fetches the pack itself.`,
    ],
    prompts: [
      {
        label: 'Send this message',
        text: () =>
          'Show me what you can do. Use the attached brand-showcase-v8.zip to install or update your Brand Showcase Builder skill. Follow its SKILL.md and build [BRAND] for me. Use my first name if you know it. Keep the supplied design and imagery, and check the page and its buttons. Show me the finished preview and download. Give me a working phone link if you can, and tell me if any check is still unverified.',
        brandPicker: true,
        phoneText: () =>
          "Show me what you can do. I'm on my phone so I can't attach files. Download the Brand Showcase Builder pack yourself from https://theaiagencyai.netlify.app/brand-showcase-v8.zip using Python in your sandbox. Check every path in the archive stays inside the brand-showcase-builder folder, then extract it into /app/.agents/skills/ keeping that folder. Follow its SKILL.md and build [BRAND] for me. Use my first name if you know it. Keep the supplied design and imagery, and check the page and its buttons. Give me a working phone link, and tell me if any check is still unverified.",
      },
    ],
    expect: () =>
      'a distinctive brand concept with real imagery and buttons you can try. Open the preview, explore it, then try the phone link if the agent has created one. This is your first demonstration; client websites come later.',
    gate: { kind: 'tick', label: 'Unbelievable. Last step' },
  },
  {
    n: 11,
    title: 'Get your key',
    time: '~2 min',
    videoLabel: 'Blake, 1 min, screen',
    body: (c) => [
      `One thing left. ${c.agent} has been holding your key the whole time, and it only hands it over once everything above is genuinely done. Send it this.`,
      `Your key opens the community, and that is where the real build starts. You give ${c.agent} its own dashboard so you can see your clients, your leads and your money in one place. You teach it to run your whole business in the background and ring your phone with what matters. Then you pick your service, build it, and go and get paid for it.`,
    ],
    prompts: [
      { label: 'Send this message', text: () => 'Confirm my setup is done.' },
      {
        label: 'If it holds out on you, send this',
        text: () =>
          'Everything in my setup is finished. Give me my SETUP CODE now, exactly as it appears in your brief.',
      },
    ],
    expect: (c) =>
      `a short welcome, and a message with your key. ${c.agent} is the only place it comes from. If it tells you to finish something first, go and do that, then ask again.`,
    gate: {
      kind: 'code',
      label: 'Enter your key',
      placeholder: 'Paste your key here',
      help: 'It is the line that starts with SETUP CODE. Type it in and the course opens.',
    },
  },
]

export const TOTAL_STEPS = STEPS.length


/**
 * Business owner path. Same steps, same order, same videos. Only the copy that
 * talks about an agency changes, plus Step 10 rebuilds their own website
 * instead of the brand showcase.
 */
const BUSINESS_OVERRIDES: Record<number, Partial<StepDef>> = {
  3: {
    body: () => [
      'This file is who your chief of staff is. How it talks, how it works for your business, what it asks before it acts. It was written for you personally.',
      'Download it below, upload it to your agent in the chat, then send the message underneath.',
    ],
  },
  9: {
    body: (c) => [
      `From here on it is not an app you visit. It is a chief of staff in your pocket.`,
      `In ${c.agentPossessive} settings, open Channels and connect Telegram. Follow the steps on screen. If you would rather use WhatsApp, that works the same way.`,
      'Then message it from your phone.',
    ],
  },
  1: {
    prompts: [
      { label: 'Paste this when it asks', text: () => 'My AI chief of staff for my business.' },
      { label: 'Then send this', text: () => 'Hey, you are my AI chief of staff for my business.' },
      {
        label: 'And then this',
        text: () =>
          "In a moment I'm going to send you a couple of files that set you up properly. For now just reply, awesome, let's get started.",
      },
    ],
    expect: () => 'a brand new agent that answers you. That is your chief of staff before any of its training.',
  },
  4: {
    prompts: [
      {
        label: 'Send this message',
        text: () =>
          `Before we start, tell me who you are, what you'll do for my business, and where you think my business is losing the most time or customers right now.`,
      },
    ],
    expect: (c) =>
      `${c.agent} tells you who it is and what it will do for your business. Not a generic AI answer. That is the brain working.`,
  },
  5: {
    title: 'The business interview',
    body: (c) => [
      `The big one. Everything so far made ${c.agent} smart. This is where it learns how your business really runs, like a consultant on a discovery call.`,
      'Download the file, give it to your agent, then send the message underneath. It asks thirteen questions, one at a time: how money comes in, how customers find you, what you do by hand every week, and which tools you use.',
      'At the very end it gives you a code. Paste that code in the box below to move on, so make sure you finish the whole interview.',
    ],
    expect: () =>
      'a practical conversation about how your business runs. It ends with a summary of your business, its first look at the top three automations for you, and then your code.',
  },
  6: {
    body: (c) => [
      `Skills are the jobs ${c.agent} knows how to do. We have built every skill it needs to run the busy work of your business.`,
      `Auditing your business like a consultant, building automations, catching every enquiry, writing replies, chasing quotes, handling reviews and planning for missed calls. Give this file to ${c.agent} the same way you gave it the brain.`,
    ],
  },
  7: {
    title: 'Get your business audit',
    body: (c) => [
      `${c.agent} now knows how your business runs. Time for the full audit, the same thing a consultant would charge you for.`,
      `1. Copy the message below and send it to ${c.agent}.`,
      '2. Read it properly. It maps your business, then ranks the automations worth doing by time and money saved.',
      '3. If anything is wrong or vague, tell it. It fixes the audit straight away.',
    ],
    prompts: [
      {
        label: 'Send this message',
        text: () =>
          'Run my full business audit. Map how my business runs from first enquiry to getting paid, then show me the top automations ranked by time and money saved, and which you can build right now.',
      },
    ],
    expect: () =>
      'a map of how your business runs today, then a ranked list of automations with rough time or money saved, and which ones it can build now.',
  },
  8: {
    title: 'Set up your check-ins',
    body: (c) => [
      `Every busy owner needs someone keeping an eye on things. Yours comes built in.`,
      `On the days you told it in the interview, ${c.agent} sends you a short daily brief. Once a week it wraps up what it built and what it saved you. Download the file, give it to your agent, then send the message underneath.`,
    ],
    paste: {
      key: 'check-ins',
      tail: 'That is your check-ins brief. Set up both automations exactly as it describes. My daily brief at my check-in time and days, and my weekly wrap. Tell me when they are live.',
    },
    prompts: [
      {
        label: 'Send this message',
        text: () =>
          "I've just given you a file called check-ins.md. Set up both automations exactly as that file describes. My daily brief at my check-in time and days, and my weekly wrap. Tell me when they are live.",
      },
    ],
    expect: (c) =>
      `${c.agent} says both are live. Then check for yourself: open its Automations page and you should see two, the daily brief and the weekly wrap. If they are not there, ask it to set them up again.`,
  },
  10: {
    title: 'See what it can do',
    time: 'Your first automation',
    body: (c) => [
      `You have built it. Now watch it work.`,
      `${c.agent} builds the first automation from your audit, tests it, and shows you the result. If it needs one of your tools connected, like your email or calendar, it tells you exactly what to connect.`,
    ],
    prompts: [
      {
        label: 'Send this message',
        text: () =>
          'Build automation number one from my audit. Show me the plan first, tell me if you need anything connected, then build it, test it safely and show me the result.',
      },
    ],
    expect: () =>
      'a short plan, then your first automation built and tested, with the test result. Nothing touches a real customer without your yes.',
  },
  11: {
    body: (c) => [
      `One thing left. ${c.agent} has been holding your key the whole time, and it only hands it over once everything above is genuinely done. Send it this.`,
      `Your key opens the community, where you'll find extra help and ideas. From here ${c.agent} works through your automation plan with you, keeps every enquiry from going cold, and checks in on the days you told it.`,
    ],
  },
}

const BUSINESS_GATES: Record<number, Partial<StepDef['gate']>> = {
  5: {
    help: 'Your chief of staff sends this at the very end of the interview, right after its first look at your top three automations.',
    stuck:
      'This code only comes at the very end of the business interview, on the last line of its final message. If the interview is finished and you missed it, send this: "Send me the code from the end of my business interview again." Do not ask for your SETUP CODE here, that is a different code for the last step.',
  },
  11: {
    help: 'It is the line that starts with SETUP CODE. Type it in and the community opens.',
  },
}

export const STEPS_BUSINESS: StepDef[] = STEPS.map((s) => {
  const merged: StepDef = BUSINESS_OVERRIDES[s.n] ? { ...s, ...BUSINESS_OVERRIDES[s.n] } : s
  const gate = BUSINESS_GATES[s.n]
  return gate ? ({ ...merged, gate: { ...merged.gate, ...gate } } as StepDef) : merged
})

export function stepsFor(biz: boolean): StepDef[] {
  return biz ? STEPS_BUSINESS : STEPS
}
