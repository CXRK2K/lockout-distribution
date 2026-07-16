# LOCKOUT!

**Competitive buzzer-style trivia — local-first, no cloud required.**

[Play in Browser](https://cxrk2k.github.io/lockout-distribution/) — instant web trial, no install needed

---

## What is LOCKOUT!

LOCKOUT! is a fast-paced competitive trivia game for desktops. Race the CPU through multi-round match sets, host live buzzer rounds over your local Wi-Fi, or drill questions solo in Study Mode — all without an internet connection or a required account.

Built with [Tauri](https://tauri.app) for macOS and Windows.

## What This Repo Is

`lockout-distribution` is the public static release surface for LOCKOUT!. It contains the GitHub Pages web app, public bootstrap JSON, mobile buzzer client, public install/release material, and static validation scripts.

## What This Repo Is Not

This repo is not the source app and not a private operations repo.

- Source code, owner dashboard code, match engine code, and build scripts belong in `lockout-core`.
- Private backend/security/closed-source operational material belongs in `lockout-private`.
- Owner/admin tools, private databases, unpublished content, credentials, audit logs, and internal release material are forbidden here.

## Start Here

| Step | File | Why |
|---|---|---|
| 1 | [README.md](./README.md) | You are here. It explains the public repo role. |
| 2 | [DEPLOY.md](./DEPLOY.md) | Static deploy, validation, and rollback runbook. |
| 3 | [scripts/validate-static.mjs](./scripts/validate-static.mjs) | Public static validation command. |
| 4 | [docs/README.md](./docs/README.md) | Public docs-folder index for what GitHub Pages serves. |

---

## Play Now

The web trial runs entirely in your browser — no download, no sign-up:

> **[cxrk2k.github.io/lockout-distribution](https://cxrk2k.github.io/lockout-distribution/)**

Guest mode drops you into a match in seconds.

---

## Features

| Feature | Description |
|---|---|
| **Solo Match Play** | Race the CPU through multi-round question sets with live scoring |
| **Wi-Fi Multiplayer** | Host a match; players join via QR code or room code on the same network |
| **Phone Buzzer Client** | Participants answer from their phones at `/mobile-client/` |
| **Study Mode** | Drill any category at your own pace with instant answer feedback |
| **Crash Recovery** | Matches auto-resume from the last checkpoint if the app closes unexpectedly |
| **Guest Mode** | Jump in instantly — no account required |
| **Local-First** | All data stays on your device; no server, no sync, no telemetry |

---

## Desktop App

Windows installers are published on [Releases](https://github.com/CXRK2K/lockout-distribution/releases) — grab the latest `LOCKOUT_<version>_x64-setup.exe` (NSIS) or `LOCKOUT_<version>_x64_en-US.msi`.

> **Unsigned-binary note:** installers are not code-signed (no signing
> certificate exists for this project yet). Windows SmartScreen will warn on
> first run — choose "More info" → "Run anyway". On macOS, if/when builds are
> published, Gatekeeper requires right-click → Open on first launch.

---

## Mobile Buzzer Client

When a host starts a Wi-Fi match on the desktop app, players on the same local network can submit answers from their phones:

> **[cxrk2k.github.io/lockout-distribution/mobile-client](https://cxrk2k.github.io/lockout-distribution/mobile-client/)**

Stay connected to the same Wi-Fi as the host. Answers sync locally — no internet relay.

---

## Version

**v2.0.2** — Built from the private `lockout-core` repository.

---

## Repository Structure

| Folder/file | What it is | Safety rule |
|---|---|---|
| `docs/index.html` | Main public web app entry point | Public-safe only |
| `docs/404.html` | GitHub Pages SPA fallback | Preserve during sync |
| `docs/assets/` | Bundled public JS/CSS/fonts | Built output only |
| `docs/data/` | Public bootstrap data | Must be generated as public-safe slice |
| `docs/mobile-client/` | Same-Wi-Fi phone buzzer client | Preserve during sync |
| `docs/lockout-icon.svg` | Public icon | Public-safe |
| `scripts/validate-static.mjs` | Static validation script | Run before deploy |

---

## Commands

| Command | What it does |
|---|---|
| `node scripts/validate-static.mjs` | Confirms required public static files and relative paths exist. |
| `git status --short --branch` | Shows changed public output before commit. |
| `git revert <sha>` | Roll back a bad public static release with normal Git history. |

## Public/Private Safety Rules

- This repo is public. Treat every file as visible to everyone.
- Safe files: public web app bundles, public bootstrap JSON, mobile buzzer client, public icons, public release/install docs.
- Forbidden files: owner/admin tools, `.env` files, private databases, unpublished content, private control mirrors, credentials/templates with real values, audit logs, internal installers, signing material.
- `docs/data/public-bootstrap.json` must contain only public-safe questions, announcements, presets, and public strings.
- Preserve `docs/404.html`, `docs/mobile-client/`, and `docs/data/` when syncing new web output.

## How This Repo Connects To The Other Two Repos

| Repo | Relationship |
|---|---|
| `lockout-core` | Builds the public static app and exports public-safe bootstrap data. |
| `lockout-private` | Stores private/security/closed-source operational material that must not be copied here. |
| `lockout-distribution` | Publishes only the static public output generated from the safe release flow. |

Question updates flow into this repo only after `lockout-core` strips private fields and writes a public bootstrap artifact.

## Deployment & Maintenance

See [DEPLOY.md](./DEPLOY.md) for the full deployment runbook, smoke-test checklist, and rollback procedure.

---

## For Developers

This repository is a **distribution-only** repo: it hosts the GitHub Pages web trial, the mobile buzzer client static bundle, and public release/install material. It contains built public JavaScript, but not the editable source app or owner dashboard source.

All app development happens in the private [`lockout-core`](https://github.com/CXRK2K/lockout-core) repo. Internal admin assets (DB snapshots, env templates, the canonical graphify knowledge graph) live in the private [`lockout-private`](https://github.com/CXRK2K/lockout-private) repo.

To rebuild the static `docs/` payload from the latest `lockout-core` source:

```bash
# In the lockout-core repo:
npm install
npm run build:public
npm run build:web                  # writes dist_web/
# copy dist_web into this repo's docs/ while preserving docs/404.html, docs/mobile-client/, and docs/data/

# Then in this repo:
node scripts/validate-static.mjs
git add docs/
git commit -m "release: rebuild static web trial from lockout-core <commit>"
git push
```

GitHub Pages serves from `docs/` on the `main` branch. The deployment runbook is in [DEPLOY.md](./DEPLOY.md).

If you are an AI agent, see the master workspace README at the parent of this repo for the full 3-repo split, knowledge graph pointers, and operating protocol.

---

*Source code and internal tooling live in the private `lockout-core` and `lockout-private` repositories.*
