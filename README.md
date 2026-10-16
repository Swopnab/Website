# Swopnab Bikram Karki — Portfolio

A responsive portfolio built with HTML, CSS, and JavaScript.

[View the website](https://swopnab-web.vercel.app/)

## Features

- Image-independent S. marks in the header and sidebar.
- Dark glass panels, reflective borders, and a slow red glow; project screenshots
  and photography keep their source colors.
- One Projects section with all nine public, non-forked repositories, category
  filters, demo/source links, and expandable build notes inside the same cards.
- A sticky glass filter bar with responsive three-, two-, and one-column cards.
- Four skill areas tied to real project evidence, plus everyday tools.
- An About section covering Computer Science at UTA, Fall 2028 graduation, and
  the owner's supplied hobbies and interests.
- Résumé downloads, public links, a copy-email control, and contact paths for
  internships and collaborations.
- Collapsible navigation, keyboard focus styles, and reduced-motion support.

## Run locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://localhost:4173. No build step or package installation is required.
The active stylesheet is `styles/cinematic.css`; behavior is in `js/portfolio.js`.
Media and the résumé are in `assets/`. Existing blog files are retained separately.

## Public projects

The October 15, 2026 import uses GitHub's public owner repository endpoint:
`https://api.github.com/users/Swopnab/repos?type=owner&per_page=100`.
Forks and private repositories are excluded. `data/public-projects.json` records
the imported public collection and curated summaries. This is a snapshot, not an
automatic sync. Public cards are rendered in `index.html`, with no visitor API
calls, access tokens, or backend required.

## UI behavior

The supplied UI ideas are adapted natively to the existing static site. The
project filter bar stays in view while scrolling through the single collection.
Build notes expand in place. Legacy `#project-details` links redirect to Projects;
`#background` remains an alias for About. Skill evidence links reveal their target
project if another category was selected.

Glass panels use translucent gradients, inset highlights, and backdrop blur, with
an opaque fallback where blur is unavailable. Reduced-motion preferences disable
scroll transforms and the ambient gradient animation. Navigation collapse/reopen
remains available and remembers the choice in local storage.

The About section currently uses the owner's existing photos; replacements can
be added without changing the layout or personal copy.
