# Anthony AI Factory — Public Website

Minimal public website for Anthony AI Factory: a home page and the legal
pages (`/privacy`, `/terms`) required for third-party developer
integrations (e.g. TikTok). This is a placeholder identity/legal site —
**the Anthony AI Factory application itself is not built yet.**

## Stack

Plain static HTML, CSS, and a single small JavaScript config file. No
build step, no framework, no dependencies.

## Structure

```
index.html          Home page ("/")
privacy/index.html  Privacy Policy ("/privacy")
terms/index.html    Terms of Service ("/terms")
assets/style.css    Shared styles
assets/config.js    Centralized product name, contact email, and dates
favicon.svg         Favicon
```

To change the product name, contact email, or the "Last updated" dates on
the legal pages, edit `assets/config.js` only — every page reads from it.

The contact email is set in `assets/config.js` (`contactEmail`).

## Run locally

No dependencies to install. From the project root, start any static file
server, for example:

```
python3 -m http.server 8080
```

Then open:

- http://localhost:8080/
- http://localhost:8080/privacy/
- http://localhost:8080/terms/

## Deployment

This is a static site — deploy the repository root as-is to any static
host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3, etc.). No build
command is required. Ensure the host serves `privacy/index.html` at
`/privacy` and `terms/index.html` at `/terms` (most static hosts do this
automatically for directories containing an `index.html`).
