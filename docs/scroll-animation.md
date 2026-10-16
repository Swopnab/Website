# Scroll container integration

The deployed portfolio is static HTML/CSS/JavaScript. There is no React root,
TypeScript compiler, Tailwind build, or shadcn component registry. Active styles
are in `styles/cinematic.css` and page behavior is in `js/portfolio.js`.

The requested component's perspective, rotation, scale, and heading movement are
implemented natively across project cards, the combined skills directory,
services, About, photos, certificates, public links, and contact routes. Desktop
panels enter with up to 28 degrees of tilt, 12% scale growth, and 88px of lift.
Phone panels use up to 14 degrees, 8% growth, and 48px of lift. The entrance
continues from the bottom to the upper fifth of the viewport, so even short
cards visibly move while scrolling. Headings lift by up to 72px (44px on phones).
Skills groups use a smaller tilt to preserve chip readability. No
content is placed in a fixed-height clipping frame. Keyboard focus flattens its
panel, and reduced-motion preferences disable all transforms and ambient motion.
Fixed navigation and the sticky project filter bar remain stable.

This implementation requires no React, Tailwind, TypeScript, or Framer Motion
runtime. Profile/certificate information is rendered as static HTML; no LinkedIn
login or tokens are shipped to visitors.

## Optional React + shadcn setup for the original TSX

If migrating to React later, scaffold a **separate** Vite React/TypeScript project:

```sh
npx shadcn@latest init -t vite
npm install framer-motion
```

The [official shadcn Vite guide](https://ui.shadcn.com/docs/installation/vite)
covers React/TypeScript, Tailwind CSS, and the `@/*` alias. For an existing Vite
project without Tailwind, install `tailwindcss` and `@tailwindcss/vite`, add the
Vite plugin, and import Tailwind from `src/index.css` as shown in that guide.

Place the supplied component in
`src/components/ui/container-scroll-animation.tsx`; map `@/*` to `src/*` so its
import stays `@/components/ui/container-scroll-animation`. A shared `components/ui`
folder keeps reusable UI separate from page content. It is a convention, not a
React runtime requirement, and an unused folder is not necessary for this static
site.

Use typed header props instead of `any`. In the Vite demo use an ordinary `img`
instead of `next/image`, use real portfolio assets, remove the large demo spacer
paddings, and respect reduced-motion settings. The supplied component imports
`framer-motion`; newer Motion code uses `motion/react` as documented in the
[Motion installation guide](https://motion.dev/docs/react-installation). Keep the
package and import style consistent if porting it.
