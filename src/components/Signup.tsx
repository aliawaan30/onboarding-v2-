import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Student } from '../lib/types'

export function Signup({ email, onCreated }: { email: string; onCreated: (row: Student) => void }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError('')
    const { data, error } = await supabase.rpc('signup_student', { p_first_name: name.trim() })
    setBusy(false)
    if (error || !data) {
      setError('That did not save. Give it another go.')
      return
    }
    onCreated(data as Student)
  }

  return (
    <main className="shell shell-centre">
      <div className="card card-auth">
        <div className="auth-rail" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <p className="eyebrow">Build Your AI Agency</p>
        <h1 className="auth-title">Nearly there</h1>
        <p className="auth-body">
          You are signed in as <strong>{email}</strong>. One thing before we start: what is your first name?
        </p>
        <form onSubmit={submit} className="auth-form">
          <label className="field-label" htmlFor="first-name">
            Your first name
          </label>
          <input
            id="first-name"
            className="field"
            type="text"
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Blake"
            required
          />
          <button type="submit" className="btn btn-primary" disabled={busy || !name.trim()}>
            {busy ? 'Setting you up' : "Let's go"}
          </button>
        </form>
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <button type="button" className="btn btn-ghost" onClick={() => supabase.auth.signOut()}>
          Use a different email
        </button>
      </div>
    </main>
  )
}
