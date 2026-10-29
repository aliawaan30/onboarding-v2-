/**
 * One video per step. Two kinds are supported:
 *   - a local file in /course-media/onboarding/ (plays inline, no third party)
 *   - a Loom share or embed url (renders as an iframe)
 * Empty string renders a labelled placeholder box instead.
 *
 * Step keys match the eleven-step flow. 0 is the intro at the top.
 */
export const LOOM_URLS: Record<number, string> = {
  0: '/course-media/onboarding-start.mp4', // "Watch this first" intro
  1: '/course-media/onboarding/onboarding-01-create.mp4', // bring it to life
  2: '/course-media/onboarding/onboarding-02-memory.mp4', // switch its memory on
  3: '/course-media/onboarding/onboarding-03-brain-v2.mp4', // brain, and name it
  4: '', // let it meet you, not filmed yet
  5: '/course-media/onboarding/onboarding-05-soul-v2.mp4', // the soul interview
  6: '/course-media/onboarding/onboarding-06-skills-v2.mp4', // load its skills
  7: '', // find your goldmine, not filmed yet
  8: '/course-media/onboarding/onboarding-08-checkins-v3.mp4', // keep you honest
  9: '/course-media/onboarding/onboarding-09-phone.mp4', // put it in your phone
  10: '/course-media/onboarding/onboarding-10-website.mp4', // see what it can do
  11: '/course-media/onboarding/onboarding-11-outro-v2.mp4', // get your key (interim, Blake reshooting off GET-YOUR-KEY-SCRIPT.md)
}

/** True for a local file we host ourselves. */
export function isLocalVideo(url: string): boolean {
  return url.startsWith('/') || url.endsWith('.mp4')
}

/** Turns a Loom share url into an embed url. Leaves anything else untouched. */
export function toEmbedUrl(url: string): string {
  const m = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/)
  return m ? `https://www.loom.com/embed/${m[1]}` : url
}
