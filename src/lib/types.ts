export type Gates = Record<string, boolean>

export type Path = 'agency' | 'business'

export interface Student {
  id: string
  email: string
  first_name: string
  agent_name: string | null
  setup_code: string
  current_step: number
  gates: Gates
  /** Which onboarding path they chose. Null until they pick one. */
  path: Path | null
  created_at: string
  updated_at: string
}

export type StudentPatch = Partial<Pick<Student, 'agent_name' | 'current_step' | 'gates' | 'path'>>

export type SaveState = 'idle' | 'saving' | 'retrying' | 'failed'
