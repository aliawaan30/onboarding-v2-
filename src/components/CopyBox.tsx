import { useEffect, useRef, useState } from 'react'
import { copyText } from '../lib/files'
import { tick } from '../lib/sound'

export function CopyBox({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  async function onCopy() {
    const ok = await copyText(text)
    if (!ok) return
    tick()
    setCopied(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="copybox">
      <div className="copybox-head">
        <span className="copybox-label">{label}</span>
        <button type="button" className={`btn btn-copy${copied ? ' is-copied' : ''}`} onClick={onCopy}>
          {copied ? 'Copied' : 'Copy'}
          {copied && <Tick />}
        </button>
      </div>
      <p className="copybox-text">{text}</p>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Message copied to your clipboard' : ''}
      </span>
    </div>
  )
}

function Tick() {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" className="tick-icon">
      <path d="M4 10.5 8 14.5 16 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
