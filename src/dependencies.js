import { execa } from "execa";

export async function installDeps(pkgManager, dev, packages, cwd) {
  let cmd, args;
  switch (pkgManager) {
    case "pnpm":
      cmd = "pnpm";
      args = dev ? ["add", "-D", ...packages] : ["add", ...packages];
      break;
    case "yarn":
      cmd = "yarn";
      args = dev ? ["add", "-D", ...packages] : ["add", ...packages];
      break;
    case "bun":
      cmd = "bun";
      args = dev ? ["add", "-d", ...packages] : ["add", ...packages];
      break;
    default:
      cmd = "npm";
      args = dev
        ? ["install", "-D", ...packages]
        : ["install", ...packages];
  }
  await execa(cmd, args, { stdio: "pipe", cwd });
}

export async function installAllDeps(responses, pkg, cwd) {
  const deps = [];
  const devDeps = [];

  // CSS framework
  if (responses.cssFramework === "tailwind") {
    devDeps.push("tailwindcss", "@tailwindcss/vite");
    deps.push("clsx", "tailwind-merge");
  } else if (responses.cssFramework === "bootstrap") {
    deps.push("bootstrap", "react-bootstrap");
  }

  // State management
  if (responses.stateManagement === "redux") {
    deps.push("@reduxjs/toolkit", "react-redux");
  } else if (responses.stateManagement === "zustand") {
    deps.push("zustand");
  }

  // Router
  if (responses.router) {
    deps.push("react-router-dom");
  }

  // Icons
  if (responses.iconLibrary === "lucide") {
    deps.push("lucide-react");
  } else if (responses.iconLibrary === "huge") {
    deps.push("@hugeicons/react", "@hugeicons/core-free-icons");
  }

  // API Client
  if (responses.apiClient === "axios") {
    deps.push("axios");
  }

  // Testing
  if (responses.testing === "vitest") {
    devDeps.push(
      "vitest",
      "@testing-library/react",
      "@testing-library/jest-dom",
      "jsdom"
    );
  } else if (responses.testing === "jest") {
    devDeps.push(
      "jest",
      "ts-jest",
      "@types/jest",
      "@testing-library/react",
      "@testing-library/jest-dom",
      "jsdom"
    );
  }

  // Linter
  if (responses.linter === "eslint") {
    devDeps.push("eslint", "@eslint/js", "eslint-plugin-react-hooks", "eslint-plugin-react-refresh", "globals");
    if (responses.language === "ts") {
      devDeps.push("typescript-eslint");
    }
  } else if (responses.linter === "oxlint") {
    devDeps.push("oxlint");
  }

  // Always re-install react + react-dom for consistency
  deps.push("react", "react-dom");

  if (deps.length > 0) {
    await installDeps(pkg, false, deps, cwd);
  }
  if (devDeps.length > 0) {
    await installDeps(pkg, true, devDeps, cwd);
  }
}
