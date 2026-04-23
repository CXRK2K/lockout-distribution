# Security Notes

This repository is the **public** installer and release surface for LOCKOUT!.

## What Belongs Here

- public stable installers
- public release notes
- checksum files
- the GitHub Pages install site
- public-safe manifests and bootstrap data

## What Must Never Belong Here

- private source code
- internal owner installers
- `.env.admin` or any internal environment file
- private databases or unpublished content banks
- signing keys, GitHub tokens, or CI secrets
- internal-only logs, release notes, or device registries

## Release Boundary

- Public fan, player, and coach installers may be published here.
- Internal owner builds must stay in the private `lockout-core` release path only.
- Public manifests must never point at internal assets.
- Public site copy must never mention internal release URLs, internal repo names, or private operations tooling.

## Download Safety

- Prefer the official GitHub Pages install page, the published GitHub Release assets, or the verified install scripts.
- Verify downloaded binaries against `SHA256SUMS.txt` when downloading manually.
- Treat any LOCKOUT! installer hosted outside the official GitHub repositories as untrusted.

## Reporting

If you suspect a compromised binary, leaked credential, or malicious repository change:

1. remove the affected installer from the public release surface
2. rotate the matching credentials or secrets
3. inspect the corresponding GitHub Actions run and recent repository history
4. publish a clean replacement release only after the boundary is understood
