/** Case and whitespace forgiving comparison for typed gates. */
export function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’“”]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const BRAIN_REPLY = 'Locked in. Ready when you are.'

export function matchesBrainReply(input: string): boolean {
  return normalise(input) === normalise(BRAIN_REPLY)
}

/** The phrase gate: their own anti-quit line. We accept anything real, we never verify it. */
export function matchesPhrase(input: string): boolean {
  return input.trim().length >= 8
}

/**
 * Forgiving on case, spaces and stray punctuation. The code is a key, not a password.
 * Also accepts the code pasted inside a longer line, because agents hand it over as
 * "SETUP CODE: WORD-WORD-00" and students paste the whole thing.
 */
export function matchesCode(input: string, setupCode: string): boolean {
  const tidy = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const want = tidy(setupCode)
  const got = tidy(input)
  return want !== '' && got !== '' && got.includes(want)
}
