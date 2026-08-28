import { promises as fsp } from "fs";
import path from "path";
import { copyDirRecursive, writeFileRecursive } from "@/utils/fs.js";

export async function injectArchitecture(projectPath, templatesDir, architecture, language) {
  const ext = language === "ts" ? "tsx" : "jsx";
  const srcDir = path.join(templatesDir, "architectures", architecture, "src");

  // Remove Vite's default App files BEFORE copying architecture
  const defaultAppTsx = path.join(projectPath, "src", "App.tsx");
  const defaultAppJsx = path.join(projectPath, "src", "App.jsx");
  try { await fsp.rm(defaultAppTsx, { force: true }); } catch {}
  try { await fsp.rm(defaultAppJsx, { force: true }); } catch {}

  // Copy the architecture tree into the project's src/
  await copyDirRecursive(srcDir, path.join(projectPath, "src"), (name) => {
    // Skip files that don't match the language
    if (language === "ts" && name.endsWith(".jsx")) return false;
    if (language === "js" && name.endsWith(".tsx")) return false;
    // Skip .ts files when JS, skip .js when TS (for non-component files)
    if (language === "ts" && name.endsWith(".js") && !name.endsWith(".config.js")) return false;
    if (language === "js" && name.endsWith(".ts") && !name.endsWith(".config.ts")) return false;
    return true;
  });

  // Copy the architecture's main.tsx/main.jsx to src/main.{ext}
  const mainSrc = path.join(
    templatesDir,
    "architectures",
    architecture,
    `main.${ext}`
  );
  try {
    await fsp.access(mainSrc);
    await fsp.copyFile(mainSrc, path.join(projectPath, "src", `main.${ext}`));
  } catch {
    // main file doesn't exist in template, skip
  }

  // Remove the opposite language's main file (Vite creates main.jsx by default)
  const oppositeExt = language === "ts" ? "jsx" : "tsx";
  const oppositeMain = path.join(projectPath, "src", `main.${oppositeExt}`);
  try { await fsp.rm(oppositeMain, { force: true }); } catch {}
}

export async function injectFormatter(projectPath, templatesDir, responses) {
  if (!responses.formatter || responses.formatter === "none") return;

  // Copy the formatter config file to the project root
  const configFile =
    responses.formatter === "prettier" ? ".prettierrc" : ".oxfmtrc.json";
  const configSrc = path.join(
    templatesDir,
    "conditional",
    "formatter",
    responses.formatter,
    configFile
  );
  try {
    await fsp.access(configSrc);
    await fsp.copyFile(configSrc, path.join(projectPath, configFile));
  } catch {}

  // Append format script(s) to package.json
  const pkgPath = path.join(projectPath, "package.json");
  try {
    const content = await fsp.readFile(pkgPath, "utf8");
    const pkg = JSON.parse(content);
    if (!pkg.scripts) pkg.scripts = {};
    if (responses.formatter === "prettier") {
      pkg.scripts.format = "prettier --write .";
      pkg.scripts["format:check"] = "prettier --check .";
    } else if (responses.formatter === "oxfmt") {
      pkg.scripts.format = "oxfmt .";
      pkg.scripts["format:check"] = "oxfmt --check .";
    }
    await fsp.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  } catch {}

  // Wire eslint-config-prettier only for the eslint + prettier combination
  if (responses.linter === "eslint" && responses.formatter === "prettier") {
    await wireEslintPrettier(projectPath, responses.language);
  }
}

async function wireEslintPrettier(projectPath, language) {
  const ext = language === "ts" ? "ts" : "js";
  const eslintConfigPath = path.join(projectPath, `eslint.config.${ext}`);
  try {
    let content = await fsp.readFile(eslintConfigPath, "utf8");

    // Avoid double-injection on re-runs
    if (content.includes("eslint-config-prettier")) return;

    // Add the import after the last import line
    const lines = content.split("\n");
    let lastImportIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) lastImportIdx = i;
    }
    lines.splice(
      lastImportIdx + 1,
      0,
      'import prettier from "eslint-config-prettier";'
    );

    let result = lines.join("\n");

    // Append prettier as the LAST element of the eslint config.
    // eslint-config-prettier exports a flat-config object (not an iterable),
    // so it must be passed by reference, not spread — passing `...prettier`
    // breaks under ESLint's jiti-based TS config loading.
    // The JS template exports an array (`export default [...]`); the TS
    // template uses a function call (`export default tseslint.config(...)`).
    const pushLast = (_, head, tail) =>
      head.replace(/,\s*$/, "") + ",\n  prettier," + tail;
    if (result.includes("tseslint.config(")) {
      result = result.replace(
        /(export default tseslint\.config\([\s\S]*?)(\n\s*\);)/,
        pushLast
      );
    } else {
      result = result.replace(
        /(export default \[[\s\S]*?)(\n\s*\];)/,
        pushLast
      );
    }

    await fsp.writeFile(eslintConfigPath, result, "utf8");
  } catch {}
}

export async function injectConditionals(projectPath, templatesDir, responses, architecture, language) {
  const ext = language === "ts" ? "tsx" : "jsx";

  // 1. State management
  if (responses.stateManagement === "redux") {
    await injectOverlay(
      projectPath,
      templatesDir,
      `conditional/state/redux/${architecture}`,
      language
    );
    await updateMainWithProvider(projectPath, "redux", architecture, ext);
  } else if (responses.stateManagement === "zustand") {
    await injectOverlay(
      projectPath,
      templatesDir,
      `conditional/state/zustand/${architecture}`,
      language
    );
  }

  // 2. Router (overwrites App.tsx with routed version)
  if (responses.router) {
    await injectOverlay(
      projectPath,
      templatesDir,
      `conditional/router/${architecture}`,
      language
    );
  }

  // 3. Icons (overwrites home page)
  if (responses.iconLibrary && responses.iconLibrary !== "none") {
    await injectOverlay(
      projectPath,
      templatesDir,
      `conditional/icons/${responses.iconLibrary}/${architecture}`,
      language
    );
  }

  // 4. API Client
  if (responses.apiClient === "axios") {
    await injectOverlay(
      projectPath,
      templatesDir,
      `conditional/axios/${architecture}`,
      language
    );
  } else if (responses.apiClient === "fetch") {
    await injectOverlay(
      projectPath,
      templatesDir,
      `conditional/fetch/${architecture}`,
      language
    );
  }

  // 5. Testing
  if (responses.testing === "vitest") {
    await injectTesting(projectPath, templatesDir, "vitest", language, architecture);
  } else if (responses.testing === "jest") {
    await injectTesting(projectPath, templatesDir, "jest", language, architecture);
  }

  // 6. Linter
  if (responses.linter === "eslint") {
    await injectLinter(projectPath, templatesDir, "eslint", language);
  } else if (responses.linter === "oxlint") {
    await injectLinter(projectPath, templatesDir, "oxlint", language);
  }

  // 7. Create feature script (feature-based only)
  if (architecture === "feature-based") {
    await injectCreateFeatureScript(projectPath, templatesDir, language);
  }
}

async function injectOverlay(projectPath, templatesDir, overlayPath, language) {
  const srcDir = path.join(templatesDir, overlayPath, "src");
  try {
    await fsp.access(srcDir);
    await copyDirRecursive(srcDir, path.join(projectPath, "src"), (name) => {
      if (language === "ts" && name.endsWith(".jsx")) return false;
      if (language === "js" && name.endsWith(".tsx")) return false;
      if (language === "ts" && name.endsWith(".js") && !name.endsWith(".config.js")) return false;
      if (language === "js" && name.endsWith(".ts") && !name.endsWith(".config.ts")) return false;
      return true;
    });
  } catch {
    // overlay src dir doesn't exist
  }
}

async function injectTesting(projectPath, templatesDir, framework, language, architecture) {
  const testingDir = path.join(templatesDir, "conditional", "testing", framework);

  // Copy config files to project root
  const configExt = language === "ts" ? "ts" : "js";
  const configSrc = path.join(testingDir, `${framework}.config.${configExt}`);
  try {
    await fsp.access(configSrc);
    await fsp.copyFile(configSrc, path.join(projectPath, `${framework}.config.${configExt}`));
  } catch {}

  // Copy setup file
  const setupSrc = path.join(testingDir, `src/test/setup.${configExt}`);
  try {
    await fsp.access(setupSrc);
    const setupDest = path.join(projectPath, "src", "test", `setup.${configExt}`);
    await writeFileRecursive(setupDest, await fsp.readFile(setupSrc, "utf8"));
  } catch {}

  // Jest keeps its setup at the template root (jest.setup.ts/js), referenced by
  // jest.config as <rootDir>/jest.setup.ts — copy it to the project root.
  if (framework === "jest") {
    const jestSetupSrc = path.join(testingDir, `jest.setup.${configExt}`);
    try {
      await fsp.access(jestSetupSrc);
      await fsp.copyFile(jestSetupSrc, path.join(projectPath, `jest.setup.${configExt}`));
    } catch {}

    // Unified Babel transform config for Jest (env + react + typescript presets).
    const babelSrc = path.join(testingDir, "babel.config.cjs");
    try {
      await fsp.access(babelSrc);
      await fsp.copyFile(babelSrc, path.join(projectPath, "babel.config.cjs"));
    } catch {}
  }

  // Copy test file (architecture-scoped so the App import path resolves)
  const testExt = language === "ts" ? "tsx" : "jsx";
  const testSrc = path.join(testingDir, architecture, `src/__tests__/App.test.${testExt}`);
  try {
    await fsp.access(testSrc);
    const testDest = path.join(projectPath, "src", "__tests__", `App.test.${testExt}`);
    await writeFileRecursive(testDest, await fsp.readFile(testSrc, "utf8"));
  } catch {}

  // Add test script to package.json
  const pkgPath = path.join(projectPath, "package.json");
  try {
    const content = await fsp.readFile(pkgPath, "utf8");
    const pkg = JSON.parse(content);
    if (!pkg.scripts) pkg.scripts = {};
    if (framework === "vitest") {
      pkg.scripts.test = "vitest";
      pkg.scripts["test:run"] = "vitest run";
    } else {
      pkg.scripts.test = "jest";
      pkg.scripts["test:watch"] = "jest --watch";
    }
    await fsp.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  } catch {}
}

async function injectLinter(projectPath, templatesDir, linter, language) {
  const lintingDir = path.join(templatesDir, "conditional", "linting", linter);

  if (linter === "eslint") {
    const configExt = language === "ts" ? "ts" : "js";
    const configSrc = path.join(lintingDir, `eslint.config.${configExt}`);
    try {
      await fsp.access(configSrc);
      await fsp.copyFile(configSrc, path.join(projectPath, `eslint.config.${configExt}`));
    } catch {}
  } else if (linter === "oxlint") {
    const configSrc = path.join(lintingDir, "oxlintrc.json");
    try {
      await fsp.access(configSrc);
      await fsp.copyFile(configSrc, path.join(projectPath, "oxlintrc.json"));
    } catch {}
  }

  // Add lint script to package.json
  const pkgPath = path.join(projectPath, "package.json");
  try {
    const content = await fsp.readFile(pkgPath, "utf8");
    const pkg = JSON.parse(content);
    if (!pkg.scripts) pkg.scripts = {};
    if (linter === "eslint") {
      pkg.scripts.lint = "eslint .";
      pkg.scripts["lint:fix"] = "eslint . --fix";
    } else {
      pkg.scripts.lint = "oxlint .";
    }
    await fsp.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  } catch {}
}

async function injectCreateFeatureScript(projectPath, templatesDir, language) {
  const scriptSrc = path.join(templatesDir, "architectures", "feature-based", "scripts", "create-feature.mjs");
  const scriptDest = path.join(projectPath, "scripts", "create-feature.mjs");

  try {
    await fsp.access(scriptSrc);
    let content = await fsp.readFile(scriptSrc, "utf8");

    // Adapt to JS if needed
    if (language === "js") {
      // Replace .ts extensions with .js in the initialFiles
      content = content
        .replace(/interfaces\/index\.ts/g, "interfaces/index.js")
        .replace(/services\/index\.ts/g, "services/index.js")
        .replace(/store\/index\.ts/g, "store/index.js")
        .replace(/hooks\/index\.ts/g, "hooks/index.js")
        .replace(/pages\/index\.ts/g, "pages/index.js");
    }

    await writeFileRecursive(scriptDest, content);
  } catch {}

  // Add script to package.json
  const pkgPath = path.join(projectPath, "package.json");
  try {
    const content = await fsp.readFile(pkgPath, "utf8");
    const pkg = JSON.parse(content);
    if (!pkg.scripts) pkg.scripts = {};
    pkg.scripts["create:feature"] = "node scripts/create-feature.mjs";
    await fsp.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  } catch {}
}

async function updateMainWithProvider(projectPath, stateType, architecture, ext) {
  const mainPath = path.join(projectPath, "src", `main.${ext}`);
  try {
    let content = await fsp.readFile(mainPath, "utf8");

    if (architecture === "feature-based") {
      if (!content.includes("StoreProvider")) {
        content = content.replace(
          /import App from ['"]@\/app\/App['"]\n?/,
          "import App from '@/app/App'\nimport { StoreProvider } from '@/app/providers/StoreProvider'\n"
        );
        content = content.replace(
          /<App \/>/,
          "<StoreProvider>\n        <App />\n      </StoreProvider>"
        );
      }
    } else {
      if (!content.includes("StoreProvider")) {
        content = content.replace(
          /import App from ['"]\.\/App['"]\n?/,
          "import App from './App'\nimport { StoreProvider } from './context/StoreProvider'\n"
        );
        content = content.replace(
          /<App \/>/,
          "<StoreProvider>\n        <App />\n      </StoreProvider>"
        );
      }
    }

    await fsp.writeFile(mainPath, content, "utf8");
  } catch {}
}
