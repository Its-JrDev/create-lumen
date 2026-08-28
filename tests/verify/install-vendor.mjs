import { promises as fsp } from "fs";
import { readFileSync } from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { runViteCreate } from "../../src/scaffold.js";
import { getPkgManager } from "../../src/utils/pkg-manager.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..", "..");
const SPEC = path.join(__dirname, "vendor-package.json");
const LOCK = path.join(__dirname, "vendor-package-lock.json");
const VENDOR = path.join(REPO, "tests", ".cache", "vendor");
const MARKER = path.join(VENDOR, ".installed");
const pkg = getPkgManager();

async function ensureBase(language) {
  const dir = path.join(REPO, "tests", ".cache", `base-${language}`);
  const app = path.join(dir, "app");
  if (await exists(app)) return app;
  await fsp.rm(dir, { recursive: true, force: true });
  await fsp.mkdir(dir, { recursive: true });
  console.log(`Seeding cached create-vite base (${language})...`);
  await runViteCreate(app, "app", pkg, language);
  return app;
}

async function exists(p) {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

function simpleHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

function isFresh() {
  try {
    const state = JSON.parse(readFileSync(MARKER, "utf8"));
    const spec = readFileSync(SPEC, "utf8");
    const lock = readFileSync(LOCK, "utf8");
    return (
      state.specHash === simpleHash(spec) &&
      state.lockHash === simpleHash(lock)
    );
  } catch {
    return false;
  }
}

async function main() {
  if (isFresh()) {
    console.log("vendor toolchain already installed and in sync.");
    return;
  }

  await fsp.rm(VENDOR, { recursive: true, force: true });
  await fsp.mkdir(VENDOR, { recursive: true });
  await fsp.copyFile(SPEC, path.join(VENDOR, "package.json"));
  await fsp.copyFile(LOCK, path.join(VENDOR, "package-lock.json"));

  console.log("Installing vendored verification toolchain (one-time, pinned)...");
  execSync("npm ci --no-fund --no-audit", { stdio: "inherit", cwd: VENDOR });

  const spec = await fsp.readFile(SPEC, "utf8");
  const lock = await fsp.readFile(LOCK, "utf8");
  await fsp.writeFile(
    MARKER,
    JSON.stringify({ specHash: simpleHash(spec), lockHash: simpleHash(lock) }),
    "utf8"
  );
  console.log("vendor toolchain installed.");

  // The offline/installed harnesses scaffold from cached create-vite bases
  // (no network needed at verify time).
  for (const lang of ["ts", "js"]) {
    await ensureBase(lang);
  }
  console.log("cached Vite bases ready.");
}

main().catch((e) => {
  console.error("vendor install failed:", e.message);
  process.exit(1);
});