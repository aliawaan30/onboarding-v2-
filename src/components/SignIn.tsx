import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

// Long enough that a slow inbox has a chance, short enough that nobody sits
// there wondering. Supabase also enforces its own minimum interval per user.
const RESEND_AFTER = 30

// The Supabase email templates still send a link and no code. Until they carry
// {{ .Token }}, asking for six digits sends people looking for something that
// is not in the email. Flip this to true the moment both templates are updated
// (Authentication -> Emails -> Templates: Magic Link AND Confirm signup); the
// code path underneath is built and stays ready.
const EMAIL_HAS_CODE = true

// Crew door for filming and testing: add ?pw to the URL and a password field
// appears. Signs in with a password set in Supabase Studio, no email involved.
const crewDoor = new URLSearchParams(window.location.search).has('pw')

// Australians append .au out of habit, and a magic link to a domain that does
// not exist fails silently: the send succeeds, nothing ever lands. Catch the
// common shapes before we send, because the person cannot see what went wrong.
const GLOBAL_MAILBOXES = [
  'gmail', 'googlemail', 'icloud', 'me', 'mac', 'outlook',
  'hotmail', 'live', 'msn', 'proton', 'protonmail', 'aol',
]

export function likelyTypo(address: string): string {
  const at = address.lastIndexOf('@')
  if (at < 0) return ''
  const local = address.slice(0, at)
  const domain = address.slice(at + 1)

  // education.nsw.gov.com.au: a .gov or .edu domain never sits under .com.au
  let fixed = domain.replace(/\.(gov|edu)\.com\.au$/, '.$1.au')

  // gmail.com.au, icloud.com.au: the global providers have no country suffix
  const country = fixed.match(/^([a-z0-9-]+)\.com\.[a-z]{2}$/)
  if (country && GLOBAL_MAILBOXES.includes(country[1])) fixed = `${country[1]}.com`

  return fixed === domain ? '' : `${local}@${fixed}`
}

export function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [wait, setWait] = useState(0)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (wait <= 0) return
    const t = setTimeout(() => setWait((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  async function resend() {
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email: sentTo,
      options: { emailRedirectTo: window.location.origin },
    })
    setBusy(false)
    if (error) {
      setError('That did not send. Give it a minute and try once more.')
      return
    }
    setCode('')
    setResent(true)
    setWait(RESEND_AFTER)
  }

  // The code is typed into the tab they started in, so it survives the three
  // things that kill a tapped link: a mail scanner burning the single-use
  // token, asking for a second email and voiding the first, and the mail app
  // opening the link in a different browser than the one they signed up in.
  async function onCode(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    // A returning student gets a magic link code, a brand new one gets a signup
    // confirmation code. They verify under different types, so try both.
    const token = code.replace(/\D/g, '')
    let { error } = await supabase.auth.verifyOtp({ email: sentTo, token, type: 'email' })
    if (error) {
      const retry = await supabase.auth.verifyOtp({ email: sentTo, token, type: 'signup' })
      if (!retry.error) error = null
    }
    setBusy(false)
    if (error) {
      const msg = `${error.message || ''}`.toLowerCase()
      if (msg.includes('expired')) {
        setError('That code has run out. Send yourself a fresh one below.')
      } else {
        setError('That code did not match. Check the six digits and try again.')
      }
      return
    }
    // A good code signs us in; the app is listening for the session itself.
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    if (crewDoor && password) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      setBusy(false)
      if (error) setError('That did not match. Check the email and password.')
      return
    }
    const address = email.trim().toLowerCase()
    const maybe = likelyTypo(address)
    if (maybe && maybe !== suggestion) {
      setBusy(false)
      setSuggestion(maybe)
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: window.location.origin },
    })
    setBusy(false)
    if (error) {
      const msg = `${error.message || ''}`.toLowerCase()
      if (error.status === 429 || msg.includes('rate limit')) {
        setError('Too many sign in emails in a row. Give it a few minutes and try once more.')
      } else if (msg.includes('invalid')) {
        setError('That address does not look right. Check it and try again.')
      } else {
        setError('That did not send. Check the address and try again.')
      }
      return
    }
    setSuggestion('')
    setSentTo(address)
    setSent(true)
    setWait(RESEND_AFTER)
  }

  return (
    <main className="shell shell-centre">
      <div className="card card-auth">
        <div className="auth-rail" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <h1 className="auth-title">Sign in to Build Your AI Agency</h1>
        {sent ? (
          <>
            <p className="auth-body">
              {EMAIL_HAS_CODE ? (
                <>
                  Sent to <strong>{sentTo}</strong>. Open it and type the six digit code in here. It can take a minute.
                </>
              ) : (
                <>
                  Sent to <strong>{sentTo}</strong>. Open it and tap the link, on this device. It can take a minute.
                </>
              )}
            </p>
            {EMAIL_HAS_CODE && (
            <form onSubmit={onCode} className="auth-form">
              <label className="gate-label" htmlFor="code">
                Your six digit code
              </label>
              <input
                id="code"
                className="gate-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={7}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={busy || code.replace(/\D/g, '').length < 6}
              >
                {busy ? 'Checking' : 'Let me in'}
              </button>
              <p className="gate-msg is-wrong" aria-live="polite">
                {error}
              </p>
            </form>
            )}
            {!EMAIL_HAS_CODE && error && (
              <p className="gate-msg is-wrong" aria-live="polite">
                {error}
              </p>
            )}
            <p className="auth-body">
              Nothing after a minute? <strong>Check your junk or spam folder</strong>, it is the first place it goes.
              If it is not there either, the address above has a typo in it. Read it back one letter at a time.
            </p>
            <button type="button" className="btn btn-ghost" disabled={busy || wait > 0} onClick={resend}>
              {wait > 0 ? `Send it again in ${wait}` : 'Send it again'}
            </button>
            {resent && wait > 0 && (
              <p className="auth-note">
                Sent again. Use the newest email, the one before it has stopped working.
              </p>
            )}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setSent(false)
                setCode('')
                setError('')
              }}
            >
              Use a different email
            </button>
          </>
        ) : (
          <>
            <p className="auth-body">
              Pop your email in and we will send you a one tap sign in link. No password to remember.
            </p>
            <form onSubmit={onSubmit} className="auth-form">
              <label className="gate-label" htmlFor="email">
                Your email
              </label>
              <input
                id="email"
                className="gate-input"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {crewDoor && (
                <>
                  <label className="gate-label" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    className="gate-input"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Crew sign in"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </>
              )}
              {suggestion && (
                <p className="gate-msg is-wrong" aria-live="polite">
                  That domain does not exist, so nothing will arrive. Did you mean{' '}
                  <button
                    type="button"
                    className="link-inline"
                    onClick={() => {
                      setEmail(suggestion)
                      setSuggestion('')
                    }}
                  >
                    {suggestion}
                  </button>
                  ? Tap it to fix, or send again to use what you typed.
                </p>
              )}
              <button type="submit" className="btn btn-primary" disabled={busy || email.trim().length === 0}>
                {busy ? 'Sending' : 'Send my link'}
              </button>
              <p className="gate-msg is-wrong" aria-live="polite">
                {error}
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
