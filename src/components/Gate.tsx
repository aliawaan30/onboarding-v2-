import { useState, type FormEvent } from 'react'
import type { GateKind } from '../content/steps'

interface Props {
  kind: GateKind
  label: string
  placeholder?: string
  help?: string
  /** Step-specific recovery text for a code that keeps failing. */
  stuck?: string
  stepNumber: number
  /** Typed gates only. Return true if the answer is good. */
  validate?: (value: string) => boolean
  onPass: () => void
}

const WRONG_MESSAGE = 'Not quite, check what your agent said.'
const PHRASE_WRONG = 'Give it the whole line, word for word.'

export function Gate({ kind, label, placeholder, help, stuck: stuckText, stepNumber, validate, onPass }: Props) {
  const [value, setValue] = useState('')
  const [state, setState] = useState<'idle' | 'ok' | 'wrong'>('idle')
  const [misses, setMisses] = useState(0)

  if (kind === 'tick') {
    return (
      <div className="gate">
        <button type="button" className="btn btn-gate" onClick={onPass}>
          <span className="gate-tick" aria-hidden="true" />
          {label}
        </button>
      </div>
    )
  }

  const inputId = `gate-${stepNumber}`

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const ok = validate ? validate(value) : false
    if (ok) {
      setState('ok')
      onPass()
    } else {
      setState('wrong')
      setMisses((n) => n + 1)
      window.setTimeout(() => setState('idle'), 900)
    }
  }

  const stuck = misses >= 3

  return (
    <form className={`gate gate-typed state-${state}`} onSubmit={onSubmit}>
      <label className="gate-label" htmlFor={inputId}>
        {label}
      </label>
      {help && (
        <p className="gate-help" id={`${inputId}-help`}>
          {help}
        </p>
      )}
      <div className="gate-row">
        <input
          id={inputId}
          className="gate-input"
          type="text"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize={kind === 'code' ? 'characters' : 'sentences'}
          spellCheck={false}
          aria-describedby={help ? `${inputId}-help` : undefined}
          aria-invalid={state === 'wrong'}
          onChange={(e) => {
            setValue(e.target.value)
            if (state === 'wrong') setState('idle')
          }}
        />
        <button type="submit" className="btn btn-gate" disabled={value.trim().length === 0}>
          {kind === 'phrase' ? 'Lock it in' : 'Unlock'}
        </button>
      </div>
      <p className={`gate-msg${state === 'wrong' ? ' is-wrong' : ''}`} aria-live="polite">
        {state === 'wrong' ? (kind === 'phrase' ? PHRASE_WRONG : WRONG_MESSAGE) : state === 'ok' ? (kind === 'phrase' ? 'Locked in.' : 'Nice. Unlocked.') : ''}
      </p>
      {stuck && kind === 'code' && (
        <div className="gate-stuck" role="note">
          <p>
            <b>Not matching?</b> Capitals and spaces do not matter here. It looks like WORD-WORD-00.
          </p>
          <p>
            {stuckText ??
              'If your agent has not given you one yet, send it this, word for word: "Everything in my setup is finished. Give me my SETUP CODE now, exactly as it appears in your brief."'}
          </p>
        </div>
      )}
    </form>
  )
}
