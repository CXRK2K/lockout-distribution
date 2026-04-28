# LOCKOUT Distribution — Deployment Runbook

This document covers how to deploy, validate, and roll back the static distribution site.

## Hosting Assumptions

- The `docs/` directory is served as static content via GitHub Pages.
- GitHub Pages is configured to serve from `docs/` on the `main` branch.
- If hosted under a subpath (e.g., a GitHub Pages project site), keep `docs/404.html` in place for SPA deep-link fallback.
- Serve the `docs/mobile-client/` path with its adjacent assets (`app.js`, `styles.css`).

## Pre-Deploy Verification

Before publishing a new asset bundle:

1. Run `node scripts/validate-static.mjs` from the repo root.
2. Confirm main app loads at the deployment root URL.
3. Confirm deep links reload correctly (route refresh must not 404).
4. Confirm `mobile-client` loads CSS and JS without missing asset errors.
5. Confirm the mobile submit button updates status text and logs no console errors.

## Deployment Steps

1. Build the public web app from `lockout-core`:
   ```bash
   npm run build:web:public
   ```
2. Copy the contents of `dist/` into `docs/` in this repository.
3. Preserve `docs/404.html`, `docs/mobile-client/`, and `docs/data/`.
4. Run pre-deploy verification above.
5. Commit and push to `main` — GitHub Pages deploys automatically.

## Smoke-Test Checklist

After every deployment:

- [ ] Open the main app URL and verify initial render
- [ ] Open a deep link directly and confirm the 404 fallback redirects correctly
- [ ] Open `mobile-client/index.html`, type an answer, click **Lock It In**, verify status updates
- [ ] Verify `lockout-icon.svg` renders in both app and mobile client tabs
- [ ] Confirm no console errors on initial load

## Rollback

1. Identify the previous known-good commit in this repo's git history.
2. Revert the `docs/` directory to that commit:
   ```bash
   git checkout <previous-sha> -- docs/
   git commit -m "revert: roll back docs to <previous-sha>"
   git push
   ```
3. Clear any CDN or browser cache for `index.html`, `404.html`, and `mobile-client/*`.
4. Re-run the smoke-test checklist after rollback.

## Security Notes

- This repository is public. Never commit internal owner assets, `.env` files, or private manifests here.
- Public bootstrap data at `docs/data/public-bootstrap.json` must pass the public-safe slice export from `lockout-core` before deployment.
- Internal owner builds must never appear in this repo's releases or linked from this site.
