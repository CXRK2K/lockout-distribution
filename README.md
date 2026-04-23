# LOCKOUT! Distribution

This public repository is the stable installer and download surface for **LOCKOUT!**.

## What This Repo Is For

- GitHub Pages install site
- stable release manifest
- checksum-verified install scripts
- public release notes and download instructions
- public desktop installers published through GitHub Releases

The source code stays private in the main `lockout-core` repository. Internal owner builds are never exposed here.

## Install

- Preferred: use the GitHub Pages install surface at [cxrk2k.github.io/lockout-distribution](https://cxrk2k.github.io/lockout-distribution/)
- Fallback: open the latest public release directly at [GitHub Releases](https://github.com/CXRK2K/lockout-distribution/releases/latest)

The current stable public binaries in this repository are the freshly rebuilt Windows installers for LOCKOUT!

macOS and Linux assets are intentionally withheld here until fresh renamed builds are published from the LOCKOUT! source repo.

## CLI Fallback

### macOS and Linux

```bash
curl -fsSLO https://raw.githubusercontent.com/CXRK2K/lockout-distribution/main/install/install.sh
bash install.sh
```

### Windows PowerShell

```powershell
iwr https://raw.githubusercontent.com/CXRK2K/lockout-distribution/main/install/install.ps1 -OutFile install.ps1
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

The install scripts verify the published SHA-256 before launching the native installer or AppImage.

## Public Release Surface

- `docs/index.html`: OS-aware install page
- `docs/stable.json`: stable channel manifest consumed by the site and install scripts
- `docs/data/public-bootstrap.json`: public content/bootstrap summary used by the site and desktop app
- `install/`: checksum-verifying install scripts
- `SHA256SUMS.txt`: published checksums for manual verification

## Security Boundary

- Only public fan/player/coach installers belong here.
- Do not place owner builds, internal environment files, private databases, or private release notes in this repository.
- Treat any LOCKOUT! installer hosted outside the official GitHub repositories as untrusted.

See [SECURITY.md](./SECURITY.md) for the full public distribution boundary.
