import { forwardRef, useState } from 'react'
import type { Ctx, StepDef } from '../content/steps'
import { LoomEmbed } from './LoomEmbed'
import { CopyBox } from './CopyBox'
import { buildFile } from '../lib/files'
import { DownloadButton } from './DownloadButton'
import { Gate } from './Gate'
import { AgentNameForm } from './AgentNameForm'

export type StepStatus = 'locked' | 'open' | 'done'

// On a phone the file route is download, find it in Files, attach it: three
// places to get lost. Open the paste route by default there instead.
const onPhone = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches

interface Props {
  step: StepDef
  ctx: Ctx
  status: StepStatus
  firstName: string
  setupCode: string
  /** Step 4 only: the phrase is in, we still need the agent's name. */
  awaitingAgentName?: boolean
  justPassed?: boolean
  validate?: (value: string) => boolean
  onPass: () => void
  onSaveAgentName?: (name: string) => void
}

const BRANDS = ['Nike', "McDonald's", 'IKEA', 'Apple']

export const StepCard = forwardRef<HTMLElement, Props>(function StepCard(
  { step, ctx, status, firstName, setupCode, awaitingAgentName, justPassed, validate, onPass, onSaveAgentName },
  ref,
) {
  const [showDone, setShowDone] = useState(false)
  const [brand, setBrand] = useState(BRANDS[0])

  const locked = status === 'locked'
  const done = status === 'done'
  const openBody = status === 'open' || (done && showDone)

  const activeBrand = brand

  return (
    <section
      ref={ref}
      className={`step is-${status}${justPassed ? ' just-passed' : ''}`}
      aria-labelledby={`step-${step.n}-title`}
    >
      <div className="step-head">
        <span className="step-badge" aria-hidden="true">
          {done ? <TickIcon /> : locked ? <LockIcon /> : step.n}
        </span>
        <div className="step-heading">
          <h2 id={`step-${step.n}-title`} className="step-title">
            <span className="step-n">Step {String(step.n).padStart(2, '0')}</span>
            <span className="step-title-text">{step.title}</span>
          </h2>
          {!locked && <span className="step-meta">{done ? 'Done' : step.time}</span>}
        </div>
        {status === 'open' && <span className="step-chip is-open">Start</span>}
        {done && (
          <button type="button" className="btn btn-ghost btn-show" onClick={() => setShowDone((v) => !v)}>
            {showDone ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {openBody && (
        <div className="step-body">
          {step.videoLabel !== '' && <LoomEmbed step={step.n} label={step.videoLabel} />}

          {step.body(ctx).map((para, i) => (
            <p key={i} className="step-para">
              {para}
            </p>
          ))}

          {step.callout && (
            <p className="step-callout">
              <span className="callout-mark" aria-hidden="true">
                &#10003;
              </span>
              {step.callout(ctx)}
            </p>
          )}

          {step.downloads?.map((d) => (
            <DownloadButton
              key={d.key}
              templateKey={d.key}
              label={d.label}
              note={d.note}
              firstName={firstName}
              setupCode={setupCode}
            />
          ))}

          {step.prompts?.map((p, i) => {
            if (p.brandPicker) {
              const text = p.text(ctx).replace('[BRAND]', activeBrand)
              return (
                <div key={i} className="brand-block">
                  <fieldset className="brand-picker">
                    <legend className="gate-label">Pick a brand</legend>
                    <div className="brand-options">
                      {BRANDS.map((b) => (
                        <label key={b} className={`brand-chip${brand === b ? ' is-on' : ''}`}>
                          <input
                            type="radio"
                            name={`brand-${step.n}`}
                            value={b}
                            checked={brand === b}
                            onChange={() => setBrand(b)}
                          />
                          {b}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="download">
                    <a className="btn btn-download" href="/brand-showcase-v8.zip" download="brand-showcase-v8.zip">
                      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                        <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 15.5h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Download the brand pack
                    </a>
                    <span className="download-note">The Nike, Apple, IKEA and McDonald's designs. Attach it below.</span>
                  </div>
                  <p className="step-para">Attach this file in {ctx.agentPossessive} chat with the message below.</p>
                  <CopyBox label={p.label} text={text} />
                  {p.phoneText && (
                    <details className="paste-alt" open={onPhone}>
                      <summary>On your phone? Send this instead</summary>
                      <p className="paste-alt-note">
                        Phones will not attach a zip file, so skip the download. Send this and {ctx.agent} fetches
                        the pack itself.
                      </p>
                      <CopyBox label="Send this message" text={p.phoneText(ctx).replace('[BRAND]', activeBrand)} />
                    </details>
                  )}
                </div>
              )
            }
            return <CopyBox key={i} label={p.label} text={p.text(ctx)} />
          })}

          {step.paste && (
            <details className="paste-alt" open={onPhone}>
              <summary>On your phone? Paste it instead</summary>
              <p className="paste-alt-note">
                Downloading and uploading a file on a phone is a pain, so skip it. Copy the whole thing below, paste it
                into the chat and send it. Same result, one message.
              </p>
              <CopyBox
                label="Copy the whole thing"
                text={`${buildFile(step.paste.key, firstName, setupCode)}\n\n---\n${step.paste.tail}`}
              />
            </details>
          )}

          {step.footnote && (
            <div className="step-footnote">
              <span className="footnote-mark" aria-hidden="true">
                !
              </span>
              <div>
                {step.footnote(ctx).map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}

          <p className="step-expect">
            <span className="step-expect-label">You should see:</span> {step.expect(ctx)}
          </p>

          {status === 'open' &&
            (awaitingAgentName ? (
              <AgentNameForm onSave={(name) => onSaveAgentName?.(name)} />
            ) : (
              <Gate
                kind={step.gate.kind}
                label={step.gate.label}
                placeholder={step.gate.placeholder}
                help={step.gate.help}
                stuck={step.gate.stuck}
                stepNumber={step.n}
                validate={validate}
                onPass={onPass}
              />
            ))}
        </div>
      )}
    </section>
  )
})

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
      <rect x="4.5" y="8.5" width="11" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.2 8.5V6.6a2.8 2.8 0 0 1 5.6 0v1.9" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function TickIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path
        className="tick-draw"
        d="M4.5 10.5 8.3 14.3 15.5 6.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
