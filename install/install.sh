#!/usr/bin/env bash
set -euo pipefail

REPO="CXRK2K/lockout-distribution"
MANIFEST_URL="https://raw.githubusercontent.com/${REPO}/main/docs/stable.json"
OS_NAME="$(uname -s)"
TMP_DIR="$(mktemp -d)"

cleanup() {
  if [[ "${OS_NAME}" != "Linux" ]]; then
    rm -rf "${TMP_DIR}"
  fi
}

trap cleanup EXIT

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required to install the LOCKOUT! app." >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required to parse the LOCKOUT! stable manifest." >&2
  exit 1
fi

# Hash verification is mandatory here because this script downloads and launches
# a platform-specific binary from the public distribution channel.
hash_file() {
  local target="$1"

  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$target" | awk '{print $1}'
    return 0
  fi

  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$target" | awk '{print $1}'
    return 0
  fi

  echo "Either shasum or sha256sum is required to verify the installer checksum." >&2
  exit 1
}

# The manifest is the single source of truth for the latest stable asset URLs and
# their expected hashes across macOS, Windows, and Linux.
manifest_json="$(curl -fsSL "${MANIFEST_URL}")"
asset_info="$(
  printf '%s' "${manifest_json}" | python3 - "${OS_NAME}" <<'PY'
import json
import sys

release = json.load(sys.stdin)
os_name = sys.argv[1]
assets = release.get("assets", {})

if os_name == "Darwin":
    asset = assets.get("macos")
elif os_name == "Linux":
    asset = assets.get("linux")
else:
    raise SystemExit(2)

if not asset:
    raise SystemExit(1)

print(asset["name"])
print(asset["url"])
print(asset["sha256"])
PY
)"

if [[ -z "${asset_info}" ]]; then
  echo "No stable LOCKOUT! installer is published for ${OS_NAME} yet." >&2
  exit 1
fi

file_name="$(printf '%s\n' "${asset_info}" | sed -n '1p')"
asset_url="$(printf '%s\n' "${asset_info}" | sed -n '2p')"
expected_hash="$(printf '%s\n' "${asset_info}" | sed -n '3p')"
target_path="${TMP_DIR}/${file_name}"
curl -fL "${asset_url}" -o "${target_path}"
actual_hash="$(hash_file "${target_path}")"

if [[ "${actual_hash}" != "${expected_hash}" ]]; then
  echo "Checksum verification failed for ${file_name}." >&2
  exit 1
fi

# On desktop platforms we hand off to the native installer or executable only
# after the downloaded file matches the published SHA-256 value.
case "${OS_NAME}" in
  Darwin)
    echo "Verified ${file_name}. Opening installer..."
    open "${target_path}"
    ;;
  Linux)
    chmod +x "${target_path}"
    echo "Verified ${file_name}. Downloaded to ${target_path}"
    echo "Launching AppImage..."
    "${target_path}" >/dev/null 2>&1 &
    ;;
  *)
    echo "Unsupported operating system: ${OS_NAME}" >&2
    exit 1
    ;;
esac
