import { useState, type FormEvent } from 'react'

export function AgentNameForm({ onSave }: { onSave: (name: string) => void }) {
  const [value, setValue] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const name = value.trim()
    if (name.length === 0) return
    onSave(name)
  }

  return (
    <form className="gate gate-typed name-form" onSubmit={onSubmit}>
      <p className="gate-label">One more thing.</p>
      <label className="gate-label name-q" htmlFor="agent-name">
        What did you name it?
      </label>
      <p className="gate-help" id="agent-name-help">
        The name it answers to now.
      </p>
      <div className="gate-row">
        <input
          id="agent-name"
          className="gate-input"
          type="text"
          value={value}
          placeholder="Its name"
          autoComplete="off"
          maxLength={40}
          aria-describedby="agent-name-help"
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className="btn btn-gate" disabled={value.trim().length === 0}>
          Save
        </button>
      </div>
    </form>
  )
}
