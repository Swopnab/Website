# Swopnab Bikram Karki — Portfolio

A responsive portfolio built with HTML, CSS, and JavaScript.

[View the website](https://swopnab-web.vercel.app/)

## Features

- Red, black, and white design with personal photography and résumé downloads.
- Three-column project gallery with a sticky center on larger screens and a stacked mobile layout.
- Nine public, non-forked GitHub projects with real screenshots, demos, source links, and build notes.
- Education and project milestones drawn from the résumé.
- Skills and tools arranged along a development map.
- A copy-email control and contact links for internships and collaborations.
- Pointer-driven spotlight effects and subtle card depth.
- Keyboard navigation, mobile layouts, and reduced-motion support.

## Run locally

From the repository directory:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://localhost:4173. No build step or package installation is required.

The portfolio uses `styles/cinematic.css` and `js/portfolio.js`. Media and the
résumé are in `assets/`. The existing blog pages are retained in the repository.

## Interface motion and navigation

Photos and project screenshots keep their source colors. The hero uses normal
layout flow so its actions stay above the metadata bar. The navigation chevron
collapses/reopens the rail (or mobile dock), supports Escape, and remembers the
choice locally.

The supplied scroll-container interaction is implemented with native JavaScript
and CSS in `js/portfolio.js` and `styles/cinematic.css`. Panels tilt and scale as
they enter the viewport; headings move subtly. Reduced-motion preferences disable
these transforms. No React, Tailwind, TypeScript, or animation package is required
for the current static site.

## Public project collection

The October 15, 2026 import uses GitHub’s public owner repository endpoint,
`https://api.github.com/users/Swopnab/repos?type=owner&per_page=100`.
Forks and private repositories are excluded. `data/public-projects.json` records
the imported public collection and curated summaries. The gallery is rendered
in `index.html`; visitors do not need GitHub API access or credentials.
This is a snapshot, not an automatic live sync.

The supplied `sticky-scroll.tsx` layout is adapted to CSS grid and native sticky
positioning in `styles/cinematic.css`, preserving the static deployment. The
center column pins on roomy desktop viewports, with ordinary flow on smaller
screens and for reduced motion. A slow red gradient lights the left side;
photos and project screenshots retain their original colors.
