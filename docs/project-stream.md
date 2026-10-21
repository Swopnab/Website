# Project image stream

The supplied ImageStreamHero corridor geometry is adapted natively in
`components/ui/image-stream-hero.js`, with styles in `styles/project-stream.css`.
The two perspective rails contain the thirteen public, non-forked project articles, once each.
Their screenshots, natural colors, demo/source URLs, IDs, category filters, and
build notes are preserved. No external repository scripts run in the browser.

Hover anywhere in the stream or focus a control/link to freeze every card in
place; the original demo/source anchors open directly. Touch users can swipe
large cards and tap the same links. The alternate project list exposes the full
build notes; services that link to a project switch to that list and reveal all
projects before navigating. Reduced motion uses the complete static list.

The stream wrapper retains the existing scroll tilt/scale/lift, while rail
motion belongs to a separate child wrapper. Focus no longer flattens either
large interactive wrapper, preventing buttons from moving between pointer-down
and pointer-up. Other content retains its previous focus/scroll behavior.

The useful ideas taken from `Swopnab/brag` are demo-first presentation, real
project screenshots, concise summaries, and direct access to the actual build.
The linked brag repo is a fork and is not added to the owner's project gallery.
No brag plugin or runtime is installed.

For a future React port, use the optional Vite/shadcn setup documented in
`docs/orbital-toolkit.md`, put the supplied component in
`src/components/ui/image-stream-hero.tsx`, and keep the interactive anchors,
hover/focus freeze, source data, and static/reduced-motion alternative.

The October 20 refresh adds Beast Brawl, Beast Brawl Arcade, The Button, and
Unstuck. The games link to their public demos. Unstuck links to local setup
because its hosted preview is owner-only; no private preview access is exposed.
