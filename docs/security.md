# Security review — October 20, 2026

This is a static portfolio, with no login endpoint, payment flow, visitor data
database, or server-side form processing. This review covers this repository and
the deployed portfolio, not the security of separately linked project demos.
No claim of “bulletproof” security or a comprehensive penetration test is made.

## Hardening

- Content Security Policy allows local scripts and the existing Cloudflare
  analytics script. Inline JavaScript, inline event handlers, dynamic evaluation,
  third-party frames, plugin objects, and form submission are blocked.
- A matching HTML meta policy protects the main page even if an upstream proxy
  drops the origin’s response policy. `frame-ancestors` still requires the HTTP
  header; a meta policy cannot replace that restriction.
- Styles retain inline-style support for the supplied animated geometry; this
  does not allow inline JavaScript. Fonts remain limited to Google’s font hosts.
- Vercel response headers add referrer limits, capability restrictions,
  HTTPS-only HSTS (without subdomain/preload changes), MIME sniffing protection,
  and denial of framing. Existing external links retain `rel="noopener"`.
- Profile/search strings are written with textContent. The only HTML template
  contains developer-owned constants; the project stream moves the existing
  articles rather than ingesting arbitrary remote HTML or scripts.
- No new runtime dependencies, authentication sessions, account tokens, API
  keys, remote installation scripts, or third-party repository code are shipped.

## Checks

Run `python3 scripts/check-security.py` for source guardrails, and verify browser
interactions, images, font loads, and console errors before a release. A finite
secret-pattern check cannot prove a repository contains no secrets. A source
review cannot establish hosting-account MFA, access controls, DNS ownership,
Cloudflare rule safety, or the security of the user’s devices.

Check response headers on **swopnabbkarki.com**, not only the Vercel hostname.
Cloudflare can cache or transform origin responses; unobserved edge settings
must not be reported as secured. The separate project demos do not inherit this
portfolio’s Permissions Policy or security headers when opened in their own tabs.

Sources: [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy)
and [Vercel project configuration](https://vercel.com/docs/project-configuration).
