# Orbital toolkit integration

The supplied radial orbital timeline is adapted for the existing static portfolio
in `components/ui/radial-orbital-timeline.js`. Component styles live in
`styles/orbital-toolkit.css`; global styles remain in `styles/cinematic.css`.
Both component assets load before `js/portfolio.js` and receive content hashes
from `python3 scripts/version-assets.py`.

The ten existing skill groups are the nodes. Selecting one pauses the orbit,
shows its original skill article, and highlights connected categories. No source
skills are duplicated or dropped. Search covers all 116 entries, selects a
matching category, and dims categories without matches. The alternate list view
shows all matches together. Services and certificate cards keep their own content.
No invented energy scores, skill levels, completion statuses, or dates are used.

Rotation uses synchronized CSS transforms, pauses on hover/focus and selection,
and stops when offscreen, in a background tab, or when reduced motion is enabled.
The pause control can resume a selected orbit. Nodes are keyboard buttons; Escape
closes the current category, a close button is provided, and a native category
picker supports small screens. Without JavaScript, the original complete skill
directory remains readable. If only the orbital script fails, the existing
search behavior in `js/portfolio.js` remains available.

## React / shadcn setup if migrating later

This codebase has no React root, TypeScript compiler, Tailwind build, or shadcn
registry. Adding unused TSX files and dependencies would not render the component.
The live integration therefore uses native DOM and CSS equivalents.

For a separate React/TypeScript migration, initialize the shadcn Vite template:

```sh
npx shadcn@latest init -t vite
npx shadcn@latest add badge button card
npm install lucide-react class-variance-authority @radix-ui/react-slot
```

Follow the [official Vite setup](https://ui.shadcn.com/docs/installation/vite) for
Tailwind and the `@/*` alias. Place the React component in
`src/components/ui/radial-orbital-timeline.tsx`, with `@/*` mapped to `src/*`;
put global styles in `src/index.css`. A shared `components/ui` directory keeps
reusable components separate from page content. The native version already uses
the root `components/ui` directory for that purpose.

If porting the original TSX, replace clickable divs with buttons, avoid updating
other state inside a state updater, use a responsive radius and separate detail
panel, respect reduced motion, and remove the sample timeline/energy data.
