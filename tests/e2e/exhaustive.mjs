import { runViteCreate } from "../../src/scaffold.js";
import { injectArchitecture, injectConditionals, injectFormatter } from "../../src/injector.js";
import { copyEnvExample } from "../../src/env.js";
import { setupCssFramework } from "../../src/css.js";
import { configureProject } from "../../src/configure.js";
import { cleanupBoilerplate } from "../../src/cleanup.js";
import { generateReadme } from "../../src/readme.js";
import { getPkgManager } from "../../src/utils/pkg-manager.js";
import { promises as fsp } from "fs";
import path from "path";
import os from "os";
import assert from "assert";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..", "..");
const TEMPLATES_DIR = path.join(REPO, "templates");
const CACHE = path.join(__dirname, "..", ".cache");
const pkg = getPkgManager();

// ---- Choice dimensions -------------------------------------------------
const axes = {
  architecture: ["feature-based", "component-based"],
  language: ["ts", "js"],
  cssFramework: ["tailwind", "bootstrap", "none"],
  testing: ["vitest", "jest", "none"],
  router: [true, false],
  stateManagement: ["none", "redux", "zustand"],
  iconLibrary: ["none", "lucide", "huge"],
  apiClient: ["none", "axios", "fetch"],
  linter: ["none", "eslint", "oxlint"],
};
const formatterFor = (linter) =>
  linter === "none"
    ? ["none"]
    : linter === "eslint"
    ? ["none", "prettier"]
    : ["none", "oxfmt", "prettier"];

// Cartesian product over the 9 axes, then expand formatter per linter.
function* matrix() {
  const keys = Object.keys(axes);
  function* rec(i, acc) {
    if (i === keys.length) {
      for (const formatter of formatterFor(acc.linter)) {
        yield { ...acc, formatter };
      }
      return;
    }
    const k = keys[i];
    for (const v of axes[k]) {
      yield* rec(i + 1, { ...acc, [k]: v });
    }
  }
  yield* rec(0, {});
}

async function exists(p) {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

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

async function check(responses, projectPath) {
  const { language, architecture, cssFramework, testing, router, stateManagement, linter, formatter } = responses;
  const ext = language === "ts" ? "tsx" : "jsx";
  const extConfig = language === "ts" ? "ts" : "js";
  const pkgJson = JSON.parse(await fsp.readFile(path.join(projectPath, "package.json"), "utf8"));
  const scripts = pkgJson.scripts || {};

  // Architecture
  if (architecture === "feature-based") {
    assert.ok(await exists(path.join(projectPath, "src/app")), "feature-based: src/app missing");
  } else {
    assert.ok(await exists(path.join(projectPath, "src/components")), "component-based: src/components missing");
  }

  // Main entry present, opposite removed
  assert.ok(await exists(path.join(projectPath, `src/main.${ext}`)), `main.${ext} missing`);
  assert.ok(!(await exists(path.join(projectPath, `src/main.${language === "ts" ? "jsx" : "tsx"}`))), "opposite main not removed");

  // CSS framework
  if (cssFramework === "tailwind") {
    const vite = await fsp.readFile(path.join(projectPath, `vite.config.${extConfig}`), "utf8");
    assert.ok(vite.includes("@tailwindcss/vite"), "tailwind: vite plugin missing");
  } else if (cssFramework === "bootstrap") {
    const main = await fsp.readFile(path.join(projectPath, `src/main.${ext}`), "utf8");
    assert.ok(main.includes("bootstrap/dist/css/bootstrap.min.css"), "bootstrap: import missing in main");
  }

  // Testing
  if (testing === "vitest") {
    assert.ok(await exists(path.join(projectPath, `vitest.config.${extConfig}`)), "vitest: config missing");
    assert.ok(await exists(path.join(projectPath, "src/test/setup." + extConfig)), "vitest: setup missing");
    assert.ok(await exists(path.join(projectPath, `src/__tests__/App.test.${ext}`)), "vitest: test missing");
    assert.strictEqual(scripts.test, "vitest", "vitest: test script");
    assert.strictEqual(scripts["test:run"], "vitest run", "vitest: test:run script");
  } else if (testing === "jest") {
    assert.ok(await exists(path.join(projectPath, `jest.config.${extConfig}`)), "jest: config missing");
    assert.ok(await exists(path.join(projectPath, `jest.setup.${extConfig}`)), "jest: setup missing");
    assert.ok(await exists(path.join(projectPath, `src/__tests__/App.test.${ext}`)), "jest: test missing");
    assert.strictEqual(scripts.test, "jest", "jest: test script");
    assert.strictEqual(scripts["test:watch"], "jest --watch", "jest: test:watch script");
  } else {
    assert.ok(!(await exists(path.join(projectPath, `vitest.config.${extConfig}`))), "none testing: stray vitest config");
    assert.ok(!(await exists(path.join(projectPath, `jest.config.${extConfig}`))), "none testing: stray jest config");
    assert.ok(!scripts.test, "none testing: stray test script");
  }

  // State management
  const main = await fsp.readFile(path.join(projectPath, `src/main.${ext}`), "utf8");
  if (stateManagement === "redux") {
    assert.ok(main.includes("StoreProvider"), "redux: StoreProvider not wired into main");
    const providerPath =
      architecture === "feature-based"
        ? path.join(projectPath, `src/app/providers/StoreProvider.${ext}`)
        : path.join(projectPath, `src/context/StoreProvider.${ext}`);
    assert.ok(await exists(providerPath), "redux: StoreProvider file missing");
  } else {
    assert.ok(!main.includes("StoreProvider"), `non-redux: StoreProvider should be absent (${stateManagement})`);
  }

  // Router
  if (router) {
    if (architecture === "feature-based") {
      assert.ok(await exists(path.join(projectPath, `src/app/router.${ext}`)), "router: src/app/router missing");
    } else {
      assert.ok(await exists(path.join(projectPath, `src/routes/index.${ext}`)), "router: src/routes/index missing");
    }
  }

  // Linter
  if (linter === "eslint") {
    assert.ok(await exists(path.join(projectPath, `eslint.config.${extConfig}`)), "eslint: config missing");
    assert.strictEqual(scripts.lint, "eslint .", "eslint: lint script");
    assert.strictEqual(scripts["lint:fix"], "eslint . --fix", "eslint: lint:fix script");
  } else if (linter === "oxlint") {
    assert.ok(await exists(path.join(projectPath, "oxlintrc.json")), "oxlint: config missing");
    assert.strictEqual(scripts.lint, "oxlint .", "oxlint: lint script");
  } else {
    // linter "none": the Vite base template may already ship an eslint config
    // and a `lint` script, which the generator leaves in place — so we don't
    // assert their absence here.
  }

  // Formatter
  if (formatter === "prettier") {
    assert.ok(await exists(path.join(projectPath, ".prettierrc")), ".prettierrc missing");
    assert.strictEqual(scripts.format, "prettier --write .", "format script");
    assert.strictEqual(scripts["format:check"], "prettier --check .", "format:check script");
    if (linter === "eslint") {
      const cfg = await fsp.readFile(path.join(projectPath, `eslint.config.${extConfig}`), "utf8");
      assert.ok(cfg.includes('import prettier from "eslint-config-prettier";'), "eslint+prettier: import missing");
      assert.ok(/\.\.\.prettier,\s*\n\s*[)\]];/.test(cfg), "eslint+prettier: ...prettier not last");
    }
  } else if (formatter === "oxfmt") {
    assert.ok(await exists(path.join(projectPath, ".oxfmtrc.json")), ".oxfmtrc.json missing");
    assert.strictEqual(scripts.format, "oxfmt .", "format script");
  } else {
    assert.ok(!(await exists(path.join(projectPath, ".prettierrc"))), "none formatter: stray .prettierrc");
    assert.ok(!(await exists(path.join(projectPath, ".oxfmtrc.json"))), "none formatter: stray .oxfmtrc.json");
    assert.ok(!scripts.format, "none formatter: stray format script");
  }

  // @/ alias
  if (language === "ts") {
    assert.ok(await exists(path.join(projectPath, "tsconfig.json")), "ts: tsconfig.json missing");
    assert.ok(await exists(path.join(projectPath, "tsconfig.app.json")), "ts: tsconfig.app.json missing");
    const app = await fsp.readFile(path.join(projectPath, "tsconfig.app.json"), "utf8");
    assert.ok(app.includes('"@/*"'), "ts: @/* path missing");
  } else {
    assert.ok(await exists(path.join(projectPath, "jsconfig.json")), "js: jsconfig.json missing");
    const js = await fsp.readFile(path.join(projectPath, "jsconfig.json"), "utf8");
    assert.ok(js.includes('"@/*"'), "js: @/* path missing");
  }

  // vite config gets the @ alias for non-tailwind setups
  if (cssFramework !== "tailwind") {
    const vite = await fsp.readFile(path.join(projectPath, `vite.config.${extConfig}`), "utf8");
    assert.ok(vite.includes('find: "@"'), "vite: @ alias missing");
  }

  // README
  if (responses.readme) {
    assert.ok(await exists(path.join(projectPath, "README.md")), "readme: README.md missing");
    assert.ok(await exists(path.join(projectPath, "LICENSE")), "readme: LICENSE missing");
  }

  // .env.example always scaffolded + env files ignored in git
  assert.ok(await exists(path.join(projectPath, ".env.example")), ".env.example missing");
  const gitignore = await fsp.readFile(path.join(projectPath, ".gitignore"), "utf8");
  assert.ok(gitignore.includes("!.env.example"), ".gitignore: .env.example not whitelisted");
  assert.ok(gitignore.includes(".env"), ".gitignore: env files not ignored");
}

async function main() {
  const bases = {};
  for (const lang of axes.language) bases[lang] = await ensureBase(lang);

  const limit = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;
  const failures = [];
  let total = 0;

  for (const responses of matrix()) {
    if (total >= limit) break;
    total++;
    const projectPath = path.join(os.tmpdir(), `lumen-exh-${total}`);
    try {
      await generate(responses, bases[responses.language], projectPath);
      await check(responses, projectPath);
    } catch (e) {
      failures.push({ n: total, responses, error: e.message });
    } finally {
      await fsp.rm(projectPath, { recursive: true, force: true });
    }
    if (total % 500 === 0) console.log(`  ...${total} generated`);
  }

  console.log(`\nGenerated and checked ${total} configs.`);
  if (failures.length) {
    console.log(`FAILURES: ${failures.length}`);
    for (const f of failures.slice(0, 50)) {
      console.log(`\n#${f.n} ${JSON.stringify(f.responses)}`);
      console.log(`   ${f.error}`);
    }
    process.exit(1);
  }
  console.log("All configs passed.");
}

main().catch((e) => {
  console.error("\nHARNESS ERROR:", e.message || e);
  process.exit(1);
});
