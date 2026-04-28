# LOCKOUT!

**Competitive buzzer-style trivia — local-first, no cloud required.**

[Play in Browser](https://cxrk2k.github.io/lockout-distribution/) — instant web trial, no install needed

---

## What is LOCKOUT!

LOCKOUT! is a fast-paced competitive trivia game for desktops. Race the CPU through multi-round match sets, host live buzzer rounds over your local Wi-Fi, or drill questions solo in Study Mode — all without an internet connection or a required account.

Built with [Tauri](https://tauri.app) for macOS and Windows.

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

Desktop builds for macOS and Windows are in development.

Once released, installers will be published to [Releases](https://github.com/CXRK2K/lockout-distribution/releases) and linked here.

---

## Mobile Buzzer Client

When a host starts a Wi-Fi match on the desktop app, players on the same local network can submit answers from their phones:

> **[cxrk2k.github.io/lockout-distribution/mobile-client](https://cxrk2k.github.io/lockout-distribution/mobile-client/)**

Stay connected to the same Wi-Fi as the host. Answers sync locally — no internet relay.

---

## Version

**v2.0.0** — Built from the private `lockout-core` repository.

---

## Repository Structure

```
lockout-distribution/
├── docs/               ← Static web assets served by GitHub Pages
│   ├── index.html      ← Main web trial entry point
│   ├── 404.html        ← SPA deep-link fallback
│   ├── assets/         ← Bundled JS/CSS/fonts
│   ├── data/           ← Published public bootstrap data
│   ├── mobile-client/  ← Phone buzzer client
│   └── lockout-icon.svg
└── scripts/            ← Static asset validation helpers
```

---

## Deployment & Maintenance

See [DEPLOY.md](./DEPLOY.md) for the full deployment runbook, smoke-test checklist, and rollback procedure.

---

*Source code and internal tooling live in the private `lockout-core` and `lockout-private` repositories.*
