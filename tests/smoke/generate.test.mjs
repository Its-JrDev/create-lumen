import { test } from "node:test";
import assert from "node:assert";
import { promises as fsp } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

import { runViteCreate } from "../../src/scaffold.js";
import { injectArchitecture, injectConditionals, injectFormatter } from "../../src/injector.js";
import { copyEnvExample } from "../../src/env.js";
import { setupCssFramework } from "../../src/css.js";
import { configureProject } from "../../src/configure.js";
import { cleanupBoilerplate } from "../../src/cleanup.js";
import { generateReadme } from "../../src/readme.js";
import { getPkgManager } from "../../src/utils/pkg-manager.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..", "..");
const TEMPLATES_DIR = path.join(REPO, "templates");
const CACHE = path.join(__dirname, "..", ".cache");
const pkg = getPkgManager();

async function exists(p) {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

// Build a real Vite base once per language (cached offline) — no installs.
async function ensureBase(language) {
  const baseApp = path.join(CACHE, `base-${language}`, "app");
  if (await exists(baseApp)) return baseApp;
  const parent = path.join(CACHE, `base-${language}`);
  await fsp.rm(parent, { recursive: true, force: true });
  await fsp.mkdir(parent, { recursive: true });
  await runViteCreate(baseApp, "app", pkg, language);
  return baseApp;
}

async function generate(responses, baseApp, projectPath) {
  await fsp.rm(projectPath, { recursive: true, force: true });
  await fsp.mkdir(projectPath, { recursive: true });
  execSync(`rsync -a --delete "${baseApp}/" "${projectPath}/"`);

  await injectArchitecture(projectPath, TEMPLATES_DIR, responses.architecture, responses.language);
  await injectConditionals(projectPath, TEMPLATES_DIR, responses, responses.architecture, responses.language);
  await injectFormatter(projectPath, TEMPLATES_DIR, responses);
  await setupCssFramework({
    projectPath,
    templatesDir: TEMPLATES_DIR,
    language: responses.language,
    cssFramework: responses.cssFramework,
    ext: responses.language === "ts" ? "tsx" : "jsx",
    pkg,
  });
  await configureProject(projectPath, responses.language, responses.cssFramework);
  await cleanupBoilerplate(projectPath);
  await copyEnvExample(projectPath, TEMPLATES_DIR);
  if (responses.readme) await generateReadme(projectPath, "app", responses);
  process.chdir(REPO);
  return projectPath;
}

function quickSetup(language) {
  return {
    projectName: "app",
    architecture: "feature-based",
    language,
    cssFramework: "tailwind",
    testing: "vitest",
    router: true,
    stateManagement: "none",
    iconLibrary: "none",
    apiClient: "none",
    linter: "eslint",
    formatter: "prettier",
    gitInit: false,
    readme: true,
  };
}

async function check(responses, projectPath) {
  const { language } = responses;
  const ext = language === "ts" ? "tsx" : "jsx";
  const extConfig = language === "ts" ? "ts" : "js";
  const pkgJson = JSON.parse(await fsp.readFile(path.join(projectPath, "package.json"), "utf8"));
  const scripts = pkgJson.scripts || {};

  const expect = ["dev", "build", "preview", "lint", "lint:fix", "format", "format:check", "test", "test:run"];
  if (language === "ts") expect.push("typecheck");
  for (const s of expect) {
    assert.ok(scripts[s], `missing script: ${s}`);
  }

  if (language === "ts") {
    assert.strictEqual(scripts.typecheck, "tsc -b", "typecheck script");
  }

  assert.ok(await exists(path.join(projectPath, `src/main.${ext}`)), `main.${ext} missing`);
  // The home page App lives at src/App, src/app/App, or src/components/App
  // depending on architecture/router choice.
  const appCandidates = [
    path.join(projectPath, `src/App.${ext}`),
    path.join(projectPath, `src/app/App.${ext}`),
    path.join(projectPath, `src/components/App.${ext}`),
  ];
  assert.ok(appCandidates.some((p) => exists(p)), `App.${ext} missing (checked src/App, src/app/App, src/components/App)`);

  if (language === "ts") {
    assert.ok(await exists(path.join(projectPath, "tsconfig.json")), "tsconfig.json missing");
    assert.ok(await exists(path.join(projectPath, "tsconfig.app.json")), "tsconfig.app.json missing");
    const app = await fsp.readFile(path.join(projectPath, "tsconfig.app.json"), "utf8");
    assert.ok(app.includes('"@/*"'), "@/* alias missing in tsconfig.app.json");
  } else {
    assert.ok(await exists(path.join(projectPath, "jsconfig.json")), "jsconfig.json missing");
    const js = await fsp.readFile(path.join(projectPath, "jsconfig.json"), "utf8");
    assert.ok(js.includes('"@/*"'), "@/* alias missing in jsconfig.json");
  }

  const eslintCfg = path.join(projectPath, `eslint.config.${extConfig}`);
  assert.ok(await exists(eslintCfg), `eslint.config.${extConfig} missing`);
  const cfg = await fsp.readFile(eslintCfg, "utf8");
  assert.ok(cfg.includes('import prettier from "eslint-config-prettier";'), "...prettier import missing");
  assert.ok(/prettier,\s*\n\s*[)\]];/.test(cfg), "...prettier not last in eslint config");

  assert.ok(await exists(path.join(projectPath, ".prettierrc")), ".prettierrc missing");
  assert.ok(await exists(path.join(projectPath, ".env.example")), ".env.example missing");
  const gitignore = await fsp.readFile(path.join(projectPath, ".gitignore"), "utf8");
  assert.ok(gitignore.includes("!.env.example"), ".gitignore: .env.example not whitelisted");
  assert.ok(gitignore.includes(".env"), ".gitignore: env files not ignored");
  assert.ok(await exists(path.join(projectPath, "README.md")), "README.md missing");
  const readme = await fsp.readFile(path.join(projectPath, "README.md"), "utf8");
  assert.ok(readme.includes("ESLint + Prettier"), "README: description missing 'ESLint + Prettier'");
  assert.ok(await exists(path.join(projectPath, "LICENSE")), "LICENSE missing");
}

for (const language of ["ts", "js"]) {
  test(`offline smoke: Quick Setup scaffold (${language}) is coherent`, async () => {
    const baseApp = await ensureBase(language);
    const projectPath = path.join(os.tmpdir(), `lumen-smoke-${language}`);
    const out = await generate(quickSetup(language), baseApp, projectPath);
    await check(quickSetup(language), out);
    await fsp.rm(projectPath, { recursive: true, force: true });
  });
}
