---
name: brand-showcase-builder
description: Build the course's first website demonstration for Nike, Apple, IKEA or McDonald's using the supplied v8 artwork and renderer. Use for the four-brand onboarding wow build, not local client websites or premium video sites.
---

# Brand Showcase Builder

Version 8.0.0. Four prepared designs, one dependable renderer. This is a brand concept and a demonstration of your student's new capability. The student owns their work, not the featured brand or its imagery.

## What is fixed

Use the renderer and bundled assets. Do not rewrite its HTML, CSS or interactions, generate replacement images, invent product facts, fetch new campaign artwork, or substitute another brand during onboarding. Do not use the old category recipe table. These restrictions apply to this first demonstration only.

| Brand | Prepared composition | Working interaction |
| --- | --- | --- |
| Nike | Black and red athlete campaign, huge condensed type, tight photographic crops | Switch between campaign moments |
| Apple | White introduction, black product chapter, actual iPhone 17 Pro photography | Explore design, camera and finishes |
| IKEA | Actual blue living room, yellow accents, practical editorial feature | Room hotspots update the room advice |
| McDonald's | Golden arches, red type, large actual Big Mac photo, warm background | Expand the burger's layers |

The imagery and product names are a dated reference set. Do not describe them as today's newest products, a live offer or current availability. Read `references/sources.md` only if provenance or facts are questioned. Prepared creative headlines are concept copy, not claimed official slogans.

## First message

If the student already chose a brand, start. Otherwise ask one question with four numbered options: Nike, Apple, IKEA, McDonald's. An unsupported brand gets those same four choices. Never silently turn another retailer into IKEA.

Use the student's first name from memory. If missing, use `Your studio`. Do not ask another question just for the byline. No em dashes in anything the student sees.

Say one short, honest line: "I'm building your [brand] concept using its prepared design and real brand imagery. Then I'll check the page and its buttons." Do not claim to have researched or generated something you did not.

## Install and assemble

This skill needs its companion files. A markdown paste alone cannot carry photographs and the tested renderer. The course provides `brand-showcase-v8.zip`. If `scripts/render.mjs`, `src/` or `assets/` is missing, extract that attached ZIP into `/app/.agents/skills/`, preserving the `brand-showcase-builder/` folder. Use Python's standard `zipfile` in the sandbox. Reject archive paths outside that folder or containing `..` before extracting. If the attachment is not accessible, ask the student to attach the course's ZIP. Do not try to reconstruct the package from this prose.

Run these operations yourself in the sandbox. Never send the student to a terminal. Use a shell-safe command or a subprocess argument array for their name.

```text
node /app/.agents/skills/brand-showcase-builder/scripts/render.mjs --verify
node /app/.agents/skills/brand-showcase-builder/scripts/render.mjs --brand nike --student "<their first name>" --out /app/showcases/nike
```

Replace `nike` with `apple`, `ikea` or `mcd` and use the known first name. Run once for the chosen brand. The renderer verifies bundled checksums, embeds every image/font into standalone `index.html`, and produces a small native React `Showcase.jsx`, the corresponding static assets, and a build report. It needs Node 20 and no package install, browser binary, paid generator or external account.

Show the student one sentence from `build-report.json` describing the actual composition while you prepare the preview. Do not print file contents, base64, terminal logs, long design briefs or a checklist into chat.

## Display it inside Base44

Read `references/base44-handoff.md` for the exact handoff. Preserve the generated design. Prefer a fresh showcase app or an existing app clearly dedicated to this demo. Do not replace an unrelated student app.

Use the native Base44 app frontend for the interactive phone link. A backend function returning HTML is not a substitute: previous tests found `script-src 'none'` on that route, which blocked its buttons. A browser screenshot of a static page does not prove the buttons work.

The self-contained `index.html` is also a download and local preview fallback. It has all its own styles; it does not need Tailwind injected by the chat panel. If app creation is unavailable, give this file through the platform's attachment tool and say the app link is not ready. Do not rename a blocked HTML function as a working website.

## Check before handing over

1. The renderer must exit successfully. Read its report. Confirm the brand and version are correct.
2. In the actual preview, confirm the logo, main image, headline and footer are visible. No generic replacement imagery or broken image icons.
3. Click the main button, one brand interaction and the mobile menu if a narrow preview is available. For Nike/Apple/IKEA, observe the content change. For McDonald's, expand a closed ingredient row. Clicks must do something visible.
4. If the browser can resize, check 780px and about 390px. If it cannot, use its available viewport and explicitly mark phone inspection as unverified. Ask the student to open the resulting native app link on their phone at handoff, rather than claim a phone test.
5. Confirm the downloaded file remains styled when opened outside Base44. Locally prevalidated source is evidence about the package, not proof of this platform run.

If the app builder altered the supplied code or assets, give it one focused repair instruction with the observed difference. Recheck. If the repair still fails, give the standalone file and the specific failed check. Do not burn credits on repeated redesigns. Do not pay for images/video, install an MCP or add another account during this build. App messages and file uploads still use Base44 credits; do not promise a fixed cost or completion time without a measured run.

## Handoff

Show the actual page or link first. Then say: "Your [brand] concept is ready. Try [the real interaction]. Open it on your phone too." Mention a missing check or app link in one plain sentence if necessary. Never claim it is live, fully tested, generated from scratch, affiliated, or ready for a paying client unless the evidence supports that claim.

Retain the visible concept footer. No fake checkout, signup form, customer reviews, prices, awards or ownership claims. Official external links are labelled as leaving for the brand's site. The package is for concept evaluation; it is not a licence for the brand's photography or trademarks.

Record version, chosen brand, app URL or attachment, checks actually completed, and any failure in memory. Keep internal logs out of the student's first impression.
