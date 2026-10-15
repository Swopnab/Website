# Swopnab Bikram Karki — Portfolio

A responsive portfolio built with HTML, CSS, and JavaScript.

[View the website](https://swopnab-web.vercel.app/)

## Features

- Red, black, and white design with personal photography and résumé downloads.
- Animated project marquee with tilted previews, pause controls, and live demo links.
- Six categorized projects with demos, screenshots, and expandable build notes.
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
