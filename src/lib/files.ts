import agencyBrain from '../templates/agency/brain.md?raw'
import agencySoul from '../templates/agency/soul-interview.md?raw'
import agencySkills from '../templates/agency/skills.md?raw'
import agencyCheckIns from '../templates/agency/check-ins.md?raw'
import businessBrain from '../templates/business/brain.md?raw'
import businessSoul from '../templates/business/soul-interview.md?raw'
import businessSkills from '../templates/business/skills.md?raw'
import businessCheckIns from '../templates/business/check-ins.md?raw'
import brandShowcaseRaw from '../templates/brand-showcase-v8.md?raw'
import type { Path } from './types'

export type TemplateKey = 'brain' | 'soul-interview' | 'skills' | 'check-ins'

const BRAND_SHOWCASE = brandShowcaseRaw.replace(/^---\n[\s\S]*?\n---\n/, '').trim()

const RAW: Record<Path, Record<TemplateKey, string>> = {
  agency: {
    brain: agencyBrain,
    'soul-interview': agencySoul,
    skills: agencySkills.replace('{{BRAND_SHOWCASE_SKILL_V8}}', BRAND_SHOWCASE),
    'check-ins': agencyCheckIns,
  },
  business: {
    brain: businessBrain,
    'soul-interview': businessSoul,
    skills: businessSkills,
    'check-ins': businessCheckIns,
  },
}

/** Which path's files to hand out. Set by the app once the student has picked. */
let currentPath: Path = 'agency'

export function setFilePath(path: Path | null) {
  currentPath = path ?? 'agency'
}

export const FILE_NAMES: Record<TemplateKey, string> = {
  brain: 'brain.md',
  'soul-interview': 'soul-interview.md',
  skills: 'skills.md',
  'check-ins': 'check-ins.md',
}

/**
 * Bakes the student's own details into a template at download time.
 * The brain file is the one that carries them: their first name, and their
 * personal setup code in place of the sample code in the source file.
 */
export function personalise(raw: string, firstName: string, setupCode: string): string {
  return raw
    .split('[YOUR FIRST NAME]').join(firstName)
    .split('[FIRST NAME]').join(firstName)
    .split('[YOUR CODE]').join(setupCode)
    .split('GREEN-LIGHT-90').join(setupCode)
}

export function buildFile(key: TemplateKey, firstName: string, setupCode: string): string {
  return personalise(RAW[currentPath][key], firstName, setupCode)
}

export function downloadTemplate(key: TemplateKey, firstName: string, setupCode: string) {
  const text = buildFile(key, firstName, setupCode)
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = FILE_NAMES[key]
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}
