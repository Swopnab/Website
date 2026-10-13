# Swopnab Bikram Karki — Portfolio

A responsive portfolio built with HTML, CSS, and JavaScript.

[View the website](https://swopnab-web.vercel.app/)

## Features

- Red, black, and white design with personal photography and résumé downloads.
- Expandable project galleries with live demos and GitHub links.
- Skills and tools arranged along a development map.
- Pointer-driven spotlight effects and subtle card depth.
- Jujutsu mode with a Special Grade profile, technique gallery, and video intro.
- Keyboard navigation, mobile layouts, and reduced-motion support.

## Run locally

From the repository directory:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://localhost:4173. No build step or package installation is required.

The portfolio uses `styles/cinematic.css` and `js/portfolio.js`. Media and the
résumé are in `assets/`. The existing blog pages are retained in the repository.

## Engineering portfolio notes

The featured-project carousel highlights original work: WorkLikeADog, CyberSteer, Music Player and the authentication service, plus Zabum AI. `engineering.html` explains architecture, failure cases, test evidence and limits. Synthetic benchmark numbers are explicitly labeled; no user counts, real-world accuracy or production success rates are invented. Forks are not presented as original projects. WorkLikeADog’s image is its actual static demo; Music Player’s image is the existing library UI.

The optional intro video uses `preload="none"` so ordinary portfolio visits do not eagerly download it. Existing visual modes and project carousel interactions are preserved.

```sh
npm ci
npx playwright install chromium --only-shell
npm test
```

Free development-only Playwright checks the project links, carousel, engineering notes, deferred-video setting and 390px/768px/1440px layouts with external resources blocked. CI runs the same checks.
