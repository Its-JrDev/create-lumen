import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Node-runtime files: Vite/Vitest/Jest/ESLint configs and CLI scripts.
    extends: [...tseslint.configs.recommended],
    files: [
      "**/*.config.{ts,mts}",
      "eslint.config.ts",
      "scripts/**/*.{ts,mts}",
      "jest.setup.ts",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.node,
    },
  },
  {
    // Test files also see Jest globals (Vitest suites import explicitly).
    extends: [...tseslint.configs.recommended],
    files: ["**/*.test.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: { ...globals.browser, ...globals.jest },
    },
  }
);