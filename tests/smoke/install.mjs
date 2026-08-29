import { runViteCreate, runBaseInstall } from "../../src/scaffold.js";
import { injectArchitecture, injectConditionals, injectFormatter } from "../../src/injector.js";
import { installAllDeps } from "../../src/dependencies.js";
import { setupCssFramework } from "../../src/css.js";
import { configureProject } from "../../src/configure.js";
import { cleanupBoilerplate } from "../../src/cleanup.js";
import { generateReadme } from "../../src/readme.js";
import { getPkgManager } from "../../src/utils/pkg-manager.js";
import { promises as fsp } from "fs";
import path from "path";
import os from "os";
import assert from "assert";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..", "..");
const TEMPLATES_DIR = path.join(REPO, "templates");
const pkg = getPkgManager();

// The Quick Setup default — the only config this smoke exercises with real
// `npm create vite` + installs. Exhaustive offline coverage of every combo
// (including the other formatter/linter pairings) lives in tests/e2e/exhaustive.mjs.
const responses = {
  projectName: "app",
  architecture: "feature-based",
  language: "ts",
  cssFramework: "tailwind",
  testing: "vitest",
  router: true,
  stateManagement: "none",
  iconLibrary: "none",
  apiClient: "none",
  linter: "eslint",
  formatter: "prettier",
  gitInit: true,
  readme: true,
};

async function exists(p) {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

async function generate(responses, projectPath) {
  // runViteCreate creates a folder named `projectName` inside dirname(projectPath),
  // so projectPath must be dirname + projectName.
  const parent = path.dirname(projectPath);
  await fsp.rm(parent, { recursive: true, force: true });
  await fsp.mkdir(parent, { recursive: true });

  await runViteCreate(projectPath, responses.projectName, pkg, responses.language);
  await runBaseInstall(projectPath, pkg);
  await injectArchitecture(projectPath, TEMPLATES_DIR, responses.architecture, responses.language, responses.cssFramework);
  await injectConditionals(projectPath, TEMPLATES_DIR, responses, responses.architecture, responses.language);
  await injectFormatter(projectPath, TEMPLATES_DIR, responses);
  await installAllDeps(responses, pkg, projectPath);
  await setupCssFramework({
    projectPath,
    templatesDir: TEMPLATES_DIR,
    language: responses.language,
    cssFramework: responses.cssFramework,
    architecture: responses.architecture,
    ext: responses.language === "ts" ? "tsx" : "jsx",
    pkg,
  });
  await configureProject(projectPath, responses.language, responses.cssFramework);
  await cleanupBoilerplate(projectPath);
  if (responses.readme) await generateReadme(projectPath, responses.projectName, responses);
  process.chdir(REPO);

  return projectPath;
}

async function check(name, responses, projectPath) {
  const pkgJson = JSON.parse(await fsp.readFile(path.join(projectPath, "package.json"), "utf8"));
  const scripts = pkgJson.scripts || {};
  const devDeps = pkgJson.devDependencies || {};

  if (responses.formatter === "prettier") {
    assert.ok(await exists(path.join(projectPath, ".prettierrc")), `${name}: .prettierrc missing`);
    assert.strictEqual(scripts.format, "prettier --write .", `${name}: format script`);
    assert.strictEqual(scripts["format:check"], "prettier --check .", `${name}: format:check script`);
    assert.ok(devDeps.prettier, `${name}: prettier not in devDeps`);
  } else if (responses.formatter === "oxfmt") {
    assert.ok(await exists(path.join(projectPath, ".oxfmtrc.json")), `${name}: .oxfmtrc.json missing`);
    assert.strictEqual(scripts.format, "oxfmt .", `${name}: format script`);
    assert.ok(devDeps.oxfmt, `${name}: oxfmt not in devDeps`);
  } else {
    assert.ok(!(await exists(path.join(projectPath, ".prettierrc"))), `${name}: unexpected .prettierrc`);
    assert.ok(!(await exists(path.join(projectPath, ".oxfmtrc.json"))), `${name}: unexpected .oxfmtrc.json`);
    assert.ok(!scripts.format, `${name}: unexpected format script`);
  }

  if (responses.linter === "eslint" && responses.formatter === "prettier") {
    const eslintCfg = path.join(projectPath, "eslint.config.ts");
    assert.ok(await exists(eslintCfg), `${name}: eslint.config.ts missing`);
    const content = await fsp.readFile(eslintCfg, "utf8");
    assert.ok(content.includes('import prettier from "eslint-config-prettier";'), `${name}: prettier import missing`);
    assert.ok(/\.\.\.prettier,\s*\n\s*[)\]];/.test(content), `${name}: ...prettier not last in eslint config`);
    assert.ok(devDeps["eslint-config-prettier"], `${name}: eslint-config-prettier not in devDeps`);
  } else if (responses.linter === "oxlint" && responses.formatter === "prettier") {
    assert.ok(!(await exists(path.join(projectPath, "eslint.config.ts"))), `${name}: eslint.config.ts should not exist for oxlint`);
    assert.ok(!devDeps["eslint-config-prettier"], `${name}: eslint-config-prettier must NOT be installed for oxlint`);
  }

  console.log(`  PASS  ${name}`);
}

async function main() {
  console.log(`Package manager: ${pkg}\n`);
  console.log(`Generating Quick Setup default (eslint + prettier):`);
  const projectPath = path.join(os.tmpdir(), "lumen-test-install", responses.projectName);
  const out = await generate(responses, projectPath);
  await check("quick-setup", responses, out);
  console.log("\nReal-install smoke passed (1 config generated + installed).");
}

main().catch((e) => {
  console.error("\nFAILED:", e.message || e);
  process.exit(1);
});
