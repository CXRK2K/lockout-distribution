const categoryLabels = {
  arts_entertainment: "Arts & Entertainment",
  current_events: "Current Events",
  language_literature: "Language & Literature",
  mathematics: "Mathematics",
  pop_culture_sports: "Pop Culture & Sports",
  potpourri: "Potpourri",
  science_technology: "Science & Technology",
  social_studies: "Social Studies",
};

function detectPlatform() {
  const userAgent = navigator.userAgent;

  if (/Windows/i.test(userAgent)) {
    return "windows";
  }
  if (/Mac/i.test(userAgent)) {
    return "macos";
  }
  if (/Linux/i.test(userAgent)) {
    return "linux";
  }

  return "unknown";
}

function pickAsset(platform, manifest) {
  if (!manifest?.assets) {
    return null;
  }

  if (platform === "windows") {
    return manifest.assets.windows?.primary ?? manifest.assets.windows?.fallback ?? null;
  }
  if (platform === "macos") {
    return manifest.assets.macos ?? null;
  }
  if (platform === "linux") {
    return manifest.assets.linux ?? null;
  }

  return null;
}

function animateCount(node, value) {
  const safeTarget = Number(value) || 0;
  const duration = 900;
  const started = performance.now();

  function frame(now) {
    const progress = Math.min((now - started) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = Math.round(safeTarget * eased).toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function setupRevealAnimations() {
  const nodes = [...document.querySelectorAll(".reveal")];
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    {
      threshold: 0.12,
    },
  );

  nodes.forEach((node) => observer.observe(node));
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = value;
  });
}

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request failed for ${path} with ${response.status}`);
  }
  return response.json();
}

function renderTrialLabel(trial) {
  const node = document.querySelector("[data-pack-name]");
  if (!node || !trial) {
    return;
  }

  node.textContent = `${trial.matchesAllowed} free CPU matches`;
}

function renderCategoryTrack(bootstrap) {
  const track = document.querySelector("[data-category-track]");
  if (!track || !bootstrap?.questions?.length) {
    return;
  }

  const names = [...new Set(bootstrap.questions.map((question) => categoryLabels[question.category] ?? question.category))];
  const repeated = [...names, ...names];
  track.innerHTML = repeated.map((name) => `<span class="school-chip">${name}</span>`).join("");
}

function renderPresetGrid(bootstrap) {
  const grid = document.querySelector("[data-preset-grid]");
  if (!grid || !bootstrap?.matchPresets?.length) {
    return;
  }

  grid.innerHTML = bootstrap.matchPresets
    .map((preset) => {
      const bonusLabel = preset.quickHost ? "Quick Host Ready" : "Expanded Format";
      return `
        <article class="preset-card">
          <span class="preset-format">${preset.format}</span>
          <h3>${preset.name}</h3>
          <p>${preset.description}</p>
          <span class="meta-pill">${bonusLabel}</span>
        </article>
      `;
    })
    .join("");
}

function syncInstallExperience(platform, manifest) {
  const asset = pickAsset(platform, manifest);
  const platformLabel = {
    windows: "Windows detected",
    macos: "macOS detected",
    linux: "Linux detected",
    unknown: "Platform not detected",
  }[platform];

  setText("[data-platform-label]", platformLabel);
  setText("[data-release-version]", manifest?.version ?? "Unavailable");
  setText("[data-release-channel]", `${manifest?.channel ?? "stable"} channel`);

  const downloadButtons = document.querySelectorAll("[data-download-button]");
  const releaseHref = "https://github.com/CXRK2K/lockout-distribution/releases/latest";

  if (asset?.url) {
    setText("[data-install-title]", `Download ${asset.name}`);
    setText("[data-install-copy]", "This platform has a current published stable asset. Use the direct download or jump to the release page for the full package list.");
    setText("[data-asset-name]", asset.name);
    setText("[data-asset-copy]", `Stable ${manifest.version ?? "release"} • SHA-256 ${asset.sha256 ?? "not listed"}`);
    setText("[data-download-copy]", `Direct stable asset ready for ${platformLabel.replace(" detected", "")}.`);

    downloadButtons.forEach((button) => {
      button.href = asset.url;
      button.textContent = `Download for ${platformLabel.replace(" detected", "")}`;
    });
  } else {
    setText("[data-install-title]", "Desktop release page is your fallback");
    setText("[data-install-copy]", "There is not a current stable asset published in the manifest for this platform right now, so the site points you to the broader release surface instead.");
    setText("[data-asset-name]", "No platform-specific stable asset published");
    setText("[data-asset-copy]", "The Pages site still stays live, but this platform currently falls back to the GitHub releases page.");
    setText("[data-download-copy]", "No current stable asset for this platform; falling back to the release page.");

    downloadButtons.forEach((button) => {
      button.href = releaseHref;
      button.textContent = "View Desktop Releases";
    });
  }
}

function populateStats(bootstrap, manifest) {
  const questionNode = document.querySelector('[data-stat-target="questions"]');
  const categoryNode = document.querySelector('[data-stat-target="categories"]');
  const formatNode = document.querySelector('[data-stat-target="formats"]');
  const packNode = document.querySelector("[data-pack-name]");

  if (questionNode) {
    animateCount(questionNode, bootstrap?.questions?.length ?? 0);
  }
  if (categoryNode) {
    const categories = new Set((bootstrap?.questions ?? []).map((question) => question.category));
    animateCount(categoryNode, categories.size);
  }
  if (formatNode) {
    animateCount(formatNode, bootstrap?.matchPresets?.length ?? 0);
  }
  if (packNode) {
    packNode.textContent = bootstrap?.studyPacks?.[0]?.name ?? "Public Core Pack";
  }

  setText("[data-release-version]", manifest?.version ?? "Unavailable");
}

window.addEventListener("DOMContentLoaded", async () => {
  setupRevealAnimations();

  const platform = detectPlatform();

  try {
    const [bootstrap, manifest, trial] = await Promise.all([
      loadJson("./data/public-bootstrap.json"),
      loadJson("./stable.json"),
      loadJson("./data/trial-preview.json"),
    ]);

    renderCategoryTrack(bootstrap);
    renderPresetGrid(bootstrap);
    populateStats(bootstrap, manifest);
    syncInstallExperience(platform, manifest);
    renderTrialLabel(trial);
  } catch (error) {
    console.error(error);
    setText("[data-install-title]", "Release information is temporarily unavailable");
    setText("[data-install-copy]", "The site could not load the manifest right now, so use the release page directly until the data refreshes.");
    setText("[data-asset-name]", "Manifest unavailable");
    setText("[data-asset-copy]", "Open the GitHub release page for the latest desktop assets.");
    setText("[data-download-copy]", "Manifest fetch failed; using the release page fallback.");
  }
});
