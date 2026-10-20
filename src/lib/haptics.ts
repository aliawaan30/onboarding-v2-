// Haptics are a bonus, never load bearing. Android Chrome supports vibrate,
// iOS Safari does not.
export function buzz(ms = 30) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(ms)
    }
  } catch {
    // ignore
  }
}
