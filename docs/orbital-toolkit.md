# Orbital toolkit and arc picker

The supplied React UI is adapted for the existing static portfolio. Shared
components live in `components/ui/arc-picker.js` and
`components/ui/radial-orbital-timeline.js`; scoped styles live in
`styles/orbital-toolkit.css`. No React runtime, unused packages, or remote
component scripts are installed. Global styling and existing scroll transforms
remain in `styles/cinematic.css` and `js/portfolio.js`.

The orbit is large and centered. Nothing is selected on load. Hover or keyboard
focus previews the original skill article; tap/click keeps it open. The detail
panel is inside the orbit on desktop and below it on phones. Escape or the close
control dismisses it. Moving from a node into its detail panel does not dismiss
it. The orbit continues while hovered/selected, with no pause button. It stops
only for reduced-motion preferences, offscreen work, or a background tab.

The supplied ArcPicker idea becomes a native curved radio-button picker with
bracketed selection, sideways dragging, short flick momentum, horizontal wheel
or Shift-wheel selection, arrow keys, Home, and End. Ordinary vertical wheel and
vertical touch gestures remain page scrolling. Search covers all 116 skills;
related categories and the alternate complete list remain available. Values are
written as text, not parsed as user-provided markup.

If either enhancement cannot load, the original complete skills directory and
fallback search remain available. Cards are not duplicated. No invented skill
levels, energy scores, dates, or completed-status claims are displayed.

## Optional React migration

For a separate React/TypeScript migration:

```sh
npx shadcn@latest init -t vite
npm install motion
```

Follow the [official shadcn Vite setup](https://ui.shadcn.com/docs/installation/vite)
for TypeScript, Tailwind, and the `@/*` alias. Place the supplied TSX in
`src/components/ui/arc-picker.tsx`, map `@/*` to `src/*`, and use `src/index.css`
for global styles. The component imports `motion/react`, so its package is
`motion`. The shared `components/ui` convention separates reusable components
from page content; the native integration already uses that directory.
