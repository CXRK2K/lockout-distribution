import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

async function mustContain(filePath, required, description) {
  const content = await readFile(filePath, "utf8");
  if (!required.every((value) => content.includes(value))) {
    throw new Error(`Validation failed for ${description} (${filePath}).`);
  }
}

await mustContain(
  path.join(root, "docs", "mobile-client", "index.html"),
  ['href="./styles.css"', 'src="./app.js"', 'href="../lockout-icon.svg"'],
  "mobile client relative asset paths",
);

await mustContain(
  path.join(root, "docs", "404.html"),
  ["window.location.replace", "repoRoot"],
  "SPA fallback redirect logic",
);

console.log("Static distribution validation passed.");
