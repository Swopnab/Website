# Swopnab Bikram Karki — Portfolio

A responsive portfolio built with HTML, CSS, and JavaScript.

[View the website](https://swopnabbkarki.com/)

## Features

- Image-independent S. marks in the header and sidebar.
- Dark glass panels, reflective borders, and a slow red glow; project screenshots
  and photography keep their source colors.
- One Projects section with all nine public, non-forked repositories, category
  filters, demo/source links, and expandable build notes inside the same cards.
- A perspective project stream that freezes on hover/focus, with direct demo/source links
  and an alternate list view. Phones use swipeable cards.
- A searchable, categorized directory combining all 68 LinkedIn-listed skills
  with résumé and profile details (116 distinct skills/tools).
- A large centered orbital toolkit with ten continuously moving categories, hover/tap
  details, a curved category picker, and an alternate list view. See [integration notes](docs/orbital-toolkit.md).
- Six project-backed service offerings with contact and example links.
- Eight certificate-style cards with issuers, listed dates, and direct credential links.
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
scroll transforms and the ambient gradient animation. Content panels across
the site use the supplied scroll-container style: perspective tilt, scale, and
heading movement, with smaller transforms on phones. Navigation collapse/reopen
remains available and remembers the choice in local storage.

The About section uses the owner's existing photos and a self-hosted 9.875-second
creative film above Beyond the Code. The supplied 8-second film is preserved and
a 1.875-second blur/zoom return bridges the study room to the opening frame.
The audio bridge matches the original start at the loop boundary. Native controls
let visitors start playback and sound; the clip loops without forced autoplay.
No new AI footage was generated for the extension.

## Primary domain and release verification

The primary public portfolio is **https://swopnabbkarki.com/**. Prioritize this
custom domain for all updates and user-facing links. After every publication,
verify the new page, stylesheet, scripts, and key interactions on this domain
before considering the release complete. The Vercel hostname is a secondary
diagnostic endpoint; verifying it alone is insufficient.

## Skills and credentials

`data/skills.json` and `data/certifications.json` record the October 15, 2026
import from the owner's LinkedIn profile, plus résumé-backed toolkit entries.
Skill display aliases normalize names such as React.js/React and HTML/HTML5.
All 68 profile skills remain represented. Credential dates are shown only where
listed on LinkedIn, with no invented expiry dates or verification claims.
The Apple credential link is the destination of the profile's public outbound
link; LinkedIn's tracking wrapper is not published.

This is an explicit import, not a live LinkedIn connection. No account session,
private analytics, credentials, or tokens are included in the site. Public visitors
can follow each credential link without receiving the owner's session.

See [scroll integration notes](docs/scroll-animation.md) for the native behavior
and optional React/TypeScript/Tailwind/shadcn setup for the original TSX.

Before publishing an edit to CSS or JavaScript, run:

```sh
python3 scripts/version-assets.py
```

This gives active CSS and JavaScript URLs a content-based version so a new HTML release asks
for its matching stylesheet and behavior through the primary domain's cache.
