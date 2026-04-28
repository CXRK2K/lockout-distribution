# LOCKOUT Distribution Runbook

This repository hosts prebuilt static assets for web distribution.

## Hosting assumptions

- Deploy the `docs/` directory as static content.
- If hosted under a subpath (for example, GitHub Pages project site), keep `docs/404.html` in place for SPA deep-link fallback.
- Serve the `docs/mobile-client/` path with its adjacent assets (`app.js`, `styles.css`).

## Pre-deploy verification

- Run `node scripts/validate-static.mjs`.
- Confirm main app loads at the deployment root.
- Confirm deep links reload correctly (for example, route refresh does not 404).
- Confirm `mobile-client` loads CSS and JS without missing asset errors.
- Confirm the mobile submit button updates status text and does not throw console errors.

## Smoke-test checklist

- Open main app URL and verify initial render.
- Open a deep link directly and confirm redirect/fallback behavior.
- Open `mobile-client/index.html`, type an answer, click `Lock It In`, and verify status updates.
- Verify `lockout-icon.svg` renders in both app and mobile client tabs.

## Rollback

- Revert hosting target to the previous known-good `docs/` artifact version.
- Clear CDN/static cache for `index.html`, `404.html`, and `mobile-client/*`.
- Re-run the smoke-test checklist after rollback.
