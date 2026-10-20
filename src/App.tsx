import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isConfigured, supabase } from './lib/supabase'
import type { Gates, Path, Student, StudentPatch } from './lib/types'
import { INTRO, NAME_STEP, TOTAL_STEPS, WATCH, stepsFor, type Ctx } from './content/steps'
import { matchesBrainReply, matchesCode, matchesPhrase } from './lib/gates'
import { ding, fanfare } from './lib/sound'
import { buzz } from './lib/haptics'
import { fireConfetti } from './lib/confetti'
import { SignIn } from './components/SignIn'
import { Signup } from './components/Signup'
import { ProgressBar } from './components/ProgressBar'
import { StepCard, TickIcon, type StepStatus } from './components/StepCard'
import { LoomEmbed } from './components/LoomEmbed'
import { SKOOL_URL } from './config/app'
import { setFilePath } from './lib/files'

type Phase = 'loading' | 'signed-out' | 'no-row' | 'ready'

// Film mode: ?film on the URL skips sign-in and the database entirely.
// Progress lives only in this tab. For recording and testing, never students.
const FILM_MODE = new URLSearchParams(window.location.search).has('film')

const FILM_STUDENT: Student = {
  id: 'film',
  email: 'film@local',
  first_name: 'Blake',
  agent_name: null,
  setup_code: 'GREEN-LIGHT-90',
  current_step: 0,
  gates: {},
  path: null,
  created_at: '',
  updated_at: '',
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [session, setSession] = useState<Session | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [justPassed, setJustPassed] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)
  const [announce, setAnnounce] = useState('')
  const [showWatch, setShowWatch] = useState(false)
  const [choosingPath, setChoosingPath] = useState(false)

  const stepRefs = useRef<Record<number, HTMLElement | null>>({})
  const pendingRef = useRef<StudentPatch | null>(null)
  const flushingRef = useRef(false)
  const confettiFiredRef = useRef(false)

  // ---------------------------------------------------------------- auth
  useEffect(() => {
    if (FILM_MODE) {
      setStudent({ ...FILM_STUDENT })
      setPhase('ready')
      return
    }
    if (!isConfigured) return
    let alive = true

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data.session)
      if (!data.session) setPhase('signed-out')
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (!next) {
        setStudent(null)
        setPhase('signed-out')
      }
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // ------------------------------------------------------- load the row
  useEffect(() => {
    const email = session?.user?.email
    if (!email) return
    let alive = true

    ;(async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle()

      if (!alive) return
      if (error || !data) {
        setPhase('no-row')
        return
      }
      const row = data as Student
      setStudent({ ...row, gates: (row.gates ?? {}) as Gates })
      if (row.gates?.confetti_shown) confettiFiredRef.current = true
      setPhase('ready')
    })()

    return () => {
      alive = false
    }
  }, [session?.user?.email])

  // -------------------------------------------- persistence with retry
  const flush = useCallback(async (id: string) => {
    if (flushingRef.current) return
    flushingRef.current = true

    while (pendingRef.current) {
      const patch = pendingRef.current
      pendingRef.current = null
      setSaving(true)

      let saved = false
      for (let attempt = 0; attempt < 4 && !saved; attempt++) {
        const { error } = await supabase.from('students').update(patch).eq('id', id)
        if (!error) {
          saved = true
          break
        }
        setSaveFailed(true)
        await new Promise((r) => setTimeout(r, 600 * 2 ** attempt))
      }

      if (saved) setSaveFailed(false)
    }

    setSaving(false)
    flushingRef.current = false
  }, [])

  const queueSave = useCallback(
    (patch: StudentPatch, id: string) => {
      if (FILM_MODE) return
      pendingRef.current = { ...(pendingRef.current ?? {}), ...patch }
      void flush(id)
    },
    [flush],
  )

  // -------------------------------------------------------------- derived
  // Anyone who started before paths existed is on the agency path.
  const path: Path | null = student?.path ?? ((student?.current_step ?? 0) > 0 ? 'agency' : null)

  const ctx: Ctx = useMemo(() => {
    const name = student?.agent_name?.trim()
    return {
      firstName: student?.first_name ?? '',
      agent: name || (path === 'business' ? 'your chief of staff' : 'your co-founder'),
      agentPossessive: name ? `${name}'s` : "your agent's",
      biz: path === 'business',
    }
  }, [student?.agent_name, student?.first_name, path])

  const completed = student?.current_step ?? 0
  const gates = student?.gates ?? {}
  const watchDone = gates['0'] === true || completed > 0
  const finished = completed >= TOTAL_STEPS
  const awaitingAgentName =
    gates[String(NAME_STEP)] === true && !student?.agent_name && completed < NAME_STEP

  const scrollToStep = useCallback((n: number) => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    window.setTimeout(() => {
      const el = stepRefs.current[n]
      el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }, 320)
  }, [])

  const reward = useCallback((n: number, big: boolean) => {
    if (big) fanfare()
    else ding()
    buzz(30)
    setJustPassed(n)
    window.setTimeout(() => setJustPassed(null), 1200)
  }, [])

  // -------------------------------------------------------------- actions
  const passStep = useCallback(
    (n: number) => {
      if (!student) return
      const nextGates: Gates = { ...student.gates, [String(n)]: true }

      // One step holds the door until they tell us the agent's name.
      if (n === NAME_STEP && !student.agent_name) {
        setStudent({ ...student, gates: nextGates })
        queueSave({ gates: nextGates }, student.id)
        reward(n, false)
        setAnnounce('Locked in. Now tell us its name.')
        return
      }

      const nextStep = Math.max(student.current_step, n)
      const isFinal = n === TOTAL_STEPS
      if (isFinal) nextGates.confetti_shown = true

      setStudent({ ...student, gates: nextGates, current_step: nextStep })
      queueSave({ gates: nextGates, current_step: nextStep }, student.id)
      reward(n, isFinal)

      if (isFinal) {
        if (!confettiFiredRef.current) {
          confettiFiredRef.current = true
          fireConfetti(2000)
        }
        setAnnounce(`All ${TOTAL_STEPS} steps done. Skool is open.`)
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
        window.setTimeout(() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }), 320)
      } else {
        setAnnounce(`Step ${n} done. Step ${n + 1} is open.`)
        scrollToStep(n + 1)
      }
    },
    [student, queueSave, reward, scrollToStep],
  )

  const saveAgentName = useCallback(
    (name: string) => {
      if (!student) return
      const nextStep = Math.max(student.current_step, NAME_STEP)
      setStudent({ ...student, agent_name: name, current_step: nextStep })
      queueSave({ agent_name: name, current_step: nextStep }, student.id)
      reward(NAME_STEP, false)
      setAnnounce(`Step ${NAME_STEP} done. ${name} is set up. Step ${NAME_STEP + 1} is open.`)
      scrollToStep(NAME_STEP + 1)
    },
    [student, queueSave, reward, scrollToStep],
  )

  const choosePath = useCallback(
    (next: Path) => {
      if (!student) return
      setChoosingPath(false)
      setStudent({ ...student, path: next })
      queueSave({ path: next }, student.id)
      reward(0, false)
      setAnnounce(next === 'business' ? 'Business owner path chosen.' : 'AI agency path chosen.')
    },
    [student, queueSave, reward],
  )

  const passWatch = useCallback(() => {
    if (!student) return
    const nextGates: Gates = { ...student.gates, '0': true }
    setStudent({ ...student, gates: nextGates })
    queueSave({ gates: nextGates }, student.id)
    reward(0, false)
    setAnnounce('Video done. Step 1 is open.')
    scrollToStep(1)
  }, [student, queueSave, reward, scrollToStep])

  // --------------------------------------------------------------- render
  if (!isConfigured) {
    return (
      <main className="shell shell-centre">
        <div className="card card-auth">
          <h1 className="auth-title">Not configured yet</h1>
          <p className="auth-body">
            Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then reload. See the README.
          </p>
        </div>
      </main>
    )
  }

  if (phase === 'loading') {
    return (
      <main className="shell shell-centre">
        <div className="card card-auth">
          <p className="auth-body">Loading your setup</p>
        </div>
      </main>
    )
  }

  if (phase === 'signed-out') return <SignIn />
  if (phase === 'no-row')
    return (
      <Signup
        email={session?.user?.email ?? ''}
        onCreated={(row) => {
          setStudent({ ...row, gates: (row.gates ?? {}) as Gates })
          setPhase('ready')
        }}
      />
    )
  if (!student) return null

  setFilePath(path)
  const steps = stepsFor(ctx.biz)
  const currentStepNumber = Math.min(completed + 1, TOTAL_STEPS)

  return (
    <>
      <ProgressBar
        completed={completed}
        currentStep={currentStepNumber}
        saving={saving}
        saveFailed={saveFailed}
      />

      <main className="shell">
        <div className="intro">
          <p className="eyebrow">{ctx.biz ? 'Build Your AI Chief of Staff' : 'Build Your AI Agency'}</p>
          <h1 className="intro-title">{ctx.biz ? 'Build Your AI Chief of Staff' : INTRO.title}</h1>
          {completed > 0 && !finished && <p className="welcome-back">Welcome back, {student.first_name}.</p>}
          {INTRO.body(ctx).map((p, i) => (
            <p key={i} className="intro-para">
              {p}
            </p>
          ))}
          <div className="hero-progress" aria-hidden="true">
            <div className="hero-progress-row">
              <span className="hero-progress-label">Your build</span>
              <span className="hero-progress-pct">{Math.round((completed / TOTAL_STEPS) * 100)}%</span>
            </div>
            <div className="segments">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <span key={i} className={`segment${i < completed ? ' is-filled' : i === completed ? ' is-current' : ''}`} />
              ))}
            </div>
          </div>
          <p className="intro-time">Eleven steps, about 30 minutes. Your progress saves itself, on any device.</p>
        </div>

        {finished && (
          <div className="finish card" role="status">
            <span className="finish-badge">Day 1</span>
            <h2 className="finish-title">
              You&apos;re in. The course just opened.
            </h2>
            <p className="finish-body">
              You built {ctx.agent}, {ctx.biz ? 'a chief of staff that knows your business' : 'a co-founder that knows you'}, checks in on you and lives in your phone. That was the hard part. Your access is below, and every module lives in there.
            </p>
            {SKOOL_URL && (
              <a className="btn btn-primary" href={SKOOL_URL} target="_blank" rel="noreferrer">
                Open the community
              </a>
            )}
          </div>
        )}

        <ol className="steps">
          <li className={path && !choosingPath ? 'spine-on' : undefined}>
            <section className={`step is-${path && !choosingPath ? 'done' : 'open'}`} aria-labelledby="path-title">
              <div className="step-head">
                <span className="step-badge" aria-hidden="true">{path && !choosingPath ? <TickIcon /> : '?'}</span>
                <div className="step-heading">
                  <h2 id="path-title" className="step-title">
                    <span className="step-title-text">
                      {path && !choosingPath
                        ? ctx.biz
                          ? 'Your path: business owner'
                          : 'Your path: AI agency builder'
                        : 'Which one sounds like you?'}
                    </span>
                  </h2>
                  <span className="step-meta">{path && !choosingPath ? 'Done' : '~10 sec'}</span>
                </div>
                {(!path || choosingPath) && <span className="step-chip is-open">Start</span>}
                {path && !choosingPath && completed < 3 && (
                  <button type="button" className="btn btn-ghost btn-show" onClick={() => setChoosingPath(true)}>
                    Change
                  </button>
                )}
              </div>
              {(!path || choosingPath) && (
                <div className="step-body">
                  <p className="step-para">
                    {choosingPath
                      ? 'Pick again. The steps below and the files you download will switch to match.'
                      : 'Pick one. Your AI, its files and every step below are set up for it.'}
                  </p>
                  <div className="gate path-choice">
                    <button type="button" className="btn btn-gate" onClick={() => choosePath('business')}>
                      <span className="gate-tick" aria-hidden="true" />
                      I have a business and want my own AI for it
                    </button>
                    <button type="button" className="btn btn-gate" onClick={() => choosePath('agency')}>
                      <span className="gate-tick" aria-hidden="true" />
                      I want to build an AI agency
                    </button>
                    {choosingPath && (
                      <button type="button" className="btn btn-ghost" onClick={() => setChoosingPath(false)}>
                        Keep my current path
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>
          </li>

          <li className={watchDone ? 'spine-on' : undefined}>
            <section
              className={`step watch-card is-${watchDone ? 'done' : path ? 'open' : 'locked'}`}
              aria-labelledby="watch-title"
            >
              <div className="step-head">
                <span className="step-badge" aria-hidden="true">
                  {watchDone ? <TickIcon /> : path ? '\u25B6' : <LockGlyph />}
                </span>
                <div className="step-heading">
                  <h2 id="watch-title" className="step-title">
                    <span className="step-title-text">{WATCH.title}</span>
                  </h2>
                  {path && <span className="step-meta">{watchDone ? 'Done' : WATCH.time}</span>}
                </div>
                {path && !watchDone && <span className="step-chip is-open">Start</span>}
                {watchDone && (
                  <button type="button" className="btn btn-ghost btn-show" onClick={() => setShowWatch((v) => !v)}>
                    {showWatch ? 'Hide' : 'Show'}
                  </button>
                )}
              </div>
              {path && (!watchDone || showWatch) && (
                <div className="step-body">
                  <LoomEmbed step={0} label={WATCH.videoLabel} />
                  <div className="watch-alert">
                    <p className="watch-alert-title">Watch this 1 minute video before you start</p>
                    <div className="video">
                      <video
                        src="/course-media/onboarding/finish-the-whole-thing.mp4"
                        title="Video: finish the whole page"
                        controls
                        preload="metadata"
                        playsInline
                      />
                    </div>
                  </div>
                  {WATCH.body().map((p, i) => (
                    <p key={i} className="step-para">
                      {p}
                    </p>
                  ))}
                  {!watchDone && (
                    <div className="gate">
                      <button type="button" className="btn btn-gate" onClick={passWatch}>
                        <span className="gate-tick" aria-hidden="true" />
                        {WATCH.gateLabel}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </li>

          {steps.map((step) => {
            const status: StepStatus =
              step.n <= completed ? 'done' : step.n === completed + 1 && watchDone && path ? 'open' : 'locked'

            const validate =
              step.gate.kind === 'typed'
                ? (v: string) => matchesBrainReply(v)
                : step.gate.kind === 'phrase'
                  ? (v: string) => matchesPhrase(v)
                  : step.gate.kind === 'code'
                    ? (v: string) => matchesCode(v, step.gate.code ?? student.setup_code)
                    : undefined

            return (
              <li key={step.n} className={status === 'done' ? 'spine-on' : undefined}>
                <StepCard
                  ref={(el) => {
                    stepRefs.current[step.n] = el
                  }}
                  step={step}
                  ctx={ctx}
                  status={status}
                  firstName={student.first_name}
                  setupCode={student.setup_code}
                  awaitingAgentName={step.n === NAME_STEP && awaitingAgentName}
                  justPassed={justPassed === step.n}
                  validate={validate}
                  onPass={() => passStep(step.n)}
                  onSaveAgentName={saveAgentName}
                />
              </li>
            )
          })}
        </ol>

        <footer className="foot">
          <span>{student.email}</span>
          <button type="button" className="btn btn-ghost" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </footer>
      </main>

      <span className="sr-only" aria-live="polite" role="status">
        {announce}
      </span>
    </>
  )
}

function LockGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
      <rect x="4.5" y="8.5" width="11" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.2 8.5V6.6a2.8 2.8 0 0 1 5.6 0v1.9" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
