import { promises as fsp } from "fs";
import path from "path";
import { readFileContent } from "./utils/fs.js";

export async function configureProject(projectPath, language, cssFramework) {
  const ext = language === "ts" ? "ts" : "js";

  // Set up tsconfig/jsconfig with @/* paths
  if (language === "ts") {
    await configureTsconfig(projectPath);
  } else {
    await configureJsconfig(projectPath);
  }

  // Add tsconfigPaths: true to vite.config for non-tailwind setups
  if (cssFramework !== "tailwind") {
    await addTsconfigPathsToViteConfig(projectPath, ext);
  }

  // Add scripts to package.json
  await configurePackageJson(projectPath);
}

async function configureTsconfig(projectPath) {
  // Create/update tsconfig.app.json with paths
  const tsconfigAppPath = path.join(projectPath, "tsconfig.app.json");
  try {
    const content = await readFileContent(tsconfigAppPath);
    const config = JSON.parse(content);

    if (!config.compilerOptions) config.compilerOptions = {};
    config.compilerOptions.baseUrl = ".";
    config.compilerOptions.paths = {
      "@/*": ["./src/*"],
    };

    await fsp.writeFile(
      tsconfigAppPath,
      JSON.stringify(config, null, 2) + "\n",
      "utf8"
    );
  } catch {
    // Create tsconfig.app.json if it doesn't exist
    const config = {
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"],
        },
      },
      include: ["src"],
    };
    await fsp.writeFile(
      tsconfigAppPath,
      JSON.stringify(config, null, 2) + "\n",
      "utf8"
    );
  }

  // Create/update root tsconfig.json with references
  const rootTsconfigPath = path.join(projectPath, "tsconfig.json");
  const rootTsconfig = {
    files: [],
    references: [{ path: "./tsconfig.app.json" }],
  };
  await fsp.writeFile(
    rootTsconfigPath,
    JSON.stringify(rootTsconfig, null, 2) + "\n",
    "utf8"
  );
}

async function configureJsconfig(projectPath) {
  const jsconfigPath = path.join(projectPath, "jsconfig.json");
  const config = {
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "@/*": ["./src/*"],
      },
    },
    include: ["src"],
  };
  await fsp.writeFile(jsconfigPath, JSON.stringify(config, null, 2) + "\n", "utf8");
}

async function addTsconfigPathsToViteConfig(projectPath, ext) {
  const viteConfigPath = path.join(projectPath, `vite.config.${ext}`);
  try {
    let content = await readFileContent(viteConfigPath);

    if (content.includes("tsconfigPaths")) return;

    const lines = content.split("\n");

    // Find where imports end (last import line index)
    let lastImportIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) lastImportIdx = i;
    }

    // Insert path/fileURLToPath imports after last import
    const newImports = [
      'import path from "path";',
      'import { fileURLToPath } from "url";',
      "const __dirname = path.dirname(fileURLToPath(import.meta.url));",
    ];
    lines.splice(lastImportIdx + 1, 0, ...newImports);

    let result = lines.join("\n");

    if (result.includes("resolve:")) {
      result = result.replace(
        /resolve:\s*\{/,
        'resolve: {\n    tsconfigPaths: true,\n    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],'
      );
    } else {
      result = result.replace(
        /defineConfig\(\{/,
        'defineConfig({\n  resolve: {\n    tsconfigPaths: true,\n    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],\n  },'
      );
    }

    await fsp.writeFile(viteConfigPath, result, "utf8");
  } catch {
    // file doesn't exist, skip
  }
}

async function configurePackageJson(projectPath) {
  const pkgPath = path.join(projectPath, "package.json");
  try {
    const content = await readFileContent(pkgPath);
    const pkg = JSON.parse(content);

    if (!pkg.scripts) pkg.scripts = {};

    pkg.scripts.dev = "vite";
    pkg.scripts.build = "vite build";
    pkg.scripts.preview = "vite preview";

    await fsp.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  } catch {
    // file doesn't exist, skip
  }
}
