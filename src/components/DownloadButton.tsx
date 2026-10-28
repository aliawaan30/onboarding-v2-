import { useState } from 'react'
import { downloadTemplate, type TemplateKey } from '../lib/files'
import { tick } from '../lib/sound'

interface Props {
  templateKey: TemplateKey
  label: string
  note?: string
  firstName: string
  setupCode: string
}

export function DownloadButton({ templateKey, label, note, firstName, setupCode }: Props) {
  const [done, setDone] = useState(false)

  function onClick() {
    downloadTemplate(templateKey, firstName, setupCode)
    tick()
    setDone(true)
  }

  return (
    <div className="download">
      <button type="button" className="btn btn-download" onClick={onClick}>
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 15.5h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {label}
      </button>
      {note && <span className="download-note">{note}</span>}
      <span className="sr-only" aria-live="polite">{done ? 'File downloaded' : ''}</span>
    </div>
  )
}
