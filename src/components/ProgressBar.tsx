import { STEPS, TOTAL_STEPS } from '../content/steps'

interface Props {
  completed: number
  currentStep: number
  saving: boolean
  saveFailed: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')

export function ProgressBar({ completed, currentStep, saving, saveFailed }: Props) {
  const finished = completed >= TOTAL_STEPS
  const label = finished ? 'All 9 steps done' : `Step ${currentStep} of ${TOTAL_STEPS}`
  const caption = finished ? 'Setup complete' : (STEPS.find((s) => s.n === currentStep)?.title ?? '')

  return (
    <header className="progress" role="banner">
      <div className="progress-inner">
        <div className="progress-row">
          <div className="progress-lead">
            <span
              className="progress-count"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={TOTAL_STEPS}
              aria-valuenow={completed}
              aria-valuetext={label}
            >
              {pad(finished ? TOTAL_STEPS : currentStep)}
              <span className="progress-of">/{pad(TOTAL_STEPS)}</span>
            </span>
            <span className="progress-title">{caption}</span>
          </div>
          <span className={`save-dot${saveFailed ? ' is-failed' : saving ? ' is-saving' : ''}`} aria-live="polite">
            {saveFailed ? 'Not saved, retrying' : saving ? 'Saving' : 'Saved'}
          </span>
        </div>
        <div className="segments" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`segment${i < completed ? ' is-filled' : i === completed ? ' is-current' : ''}`}
            />
          ))}
        </div>
      </div>
    </header>
  )
}
