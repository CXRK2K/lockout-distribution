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

// SECURITY: the bootstrap JSON is served world-readable. Answer fields are the
// quiz answer key and must never reach this artifact (they are stripped by
// lockout-core's publicBootstrapBuilder and re-attached inside the app from
// its embedded bank). Fail the deploy if any leak through.
const bootstrapPath = path.join(root, "docs", "data", "public-bootstrap.json");
const bootstrap = JSON.parse(await readFile(bootstrapPath, "utf8"));
const forbiddenFields = ["answer", "acceptedAnswers", "bonusAnswer", "bonusAcceptedAnswers"];
const leakyQuestions = (bootstrap.questions ?? []).filter((question) =>
  forbiddenFields.some((field) => field in question),
);
if (leakyQuestions.length > 0) {
  throw new Error(
    `Validation failed: ${leakyQuestions.length} question(s) in public-bootstrap.json carry answer fields (${leakyQuestions
      .slice(0, 5)
      .map((question) => question.id)
      .join(", ")}...). Refusing to deploy the answer key.`,
  );
}

console.log("Static distribution validation passed.");
