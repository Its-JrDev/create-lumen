# Error resolution matrix

Each entry records a **real failure mode** observed while building the
verification harnesses, its root cause, and the canonical fix. When a new
version of ESLint/Prettier/oxlint/oxfmt/Vite/react-router/lucide/hugeicons
shifts behavior, consult this table first — most breakages follow a known
signature.

## Lint / format toolchain

| Signature | Cause | Fix |
|-----------|-------|-----|
| `Spread syntax requires ...iterable[Symbol.iterator] to be a function` loading `eslint.config.ts:8` | `...prettier` spread of `eslint-config-prettier` under ESLint's **jiti** TS loader; the package exports a flat-config object, not an iterable | Append `prettier,` **by reference** (no spread) as the final element (`src/injector.js` `wireEslintPrettier`); assertions updated to `prettier,\s*\n\s*[)\]];` |
| `The 'jiti' library is required for loading TypeScript configuration files` | ESLint ≥ 10 loads `eslint.config.ts` via jiti, not included transitively | Add `jiti` to devDeps when `linter === "eslint" && language === "ts"` (`src/dependencies.js`) + pin in vendor toolchain |
| oxlint run returns **empty output** and exit 0 under pipes | oxlint 1.x suppresses its human report on non-TTY stdout | Harness uses `oxfmt`'s sibling: `oxlint . --format=json` and asserts `json.diagnostics.length === 0` |
| `No config found, using defaults` from `oxfmt --check` in a Prettier project | Project has no `.oxfmtrc.json` (project tracks Prettier) — oxfmt correctly falls back to defaults, which differ | Never a defect; cross-tool probing must stage the other toolchain's canonical rc before `--check` |
| `[error] No loader specified for extension ".probe"` | Probe rc staged under a nonstandard filename (`.prettierrc.probe`) — both tools bail on unknown extensions | Stage the rc under its **canonical name** and restore/remove afterward |
| React errors like `'React' is defined but never used` / `react-refresh/only-export-components` for `export const AppContext` | Vite's modern transform enabled (no `import React` needed); React Fast Refresh forbids non-component exports alongside components | Remove unused `React` imports; **split contexts** into `app-context.{js,ts}` and leave only components in `AppContext.{jsx,tsx}` |
| `react-hooks/set-state-in-effect` (react-hooks v7) in `AppContext.tsx` | Syncing `setTheme` from an effect is flagged by the new React guidance | Initialize with a lazy `useState(() => localStorage.getItem(...) ?? "light")`; effects only persist |
| Unused import only caught at runtime (e.g. `useEffect` in `AppContext.tsx`) | ESLint/oxlint can miss specifiers that a paired tool (tsc `noUnusedLocals`) catches | TS templates must exercise every imported binding; installed harness's `tsc -b` gate is the backstop |

## Dependency wiring

| Signature | Cause | Fix |
|-----------|-------|-----|
| `Test environment jest-environment-jsdom cannot be found` | `testEnvironment: "jsdom"` requires a package Jest stopped bundling in v28 | Add `jest-environment-jsdom` to jest devDeps (`src/dependencies.js`) |
| `ReferenceError: TextEncoder is not defined` booting `react-router` inside jest | jest's jsdom runner lacks Node's `TextEncoder`/`TextDecoder` globals for module-scope use in modern libraries | Polyfill globals in `jest.setup.{js,ts}` from `node:util` |
| `[UNRESOLVED_IMPORT]` for `@tailwindcss/vite` / missing tool bins after `npm install` | Harness scaffolded without running `installAllDeps` (the thing that writes conditional deps into `package.json`) | `verify:installed` calls `installAllDeps` exactly where `src/main.js` does |
| A declared devDependency has no `.bin/<n>` (e.g. `typescript`) | Test asserted the package name as the bin name | Bin-name map: `typescript → tsc`, others match package names |

## Template content drift

| Signature | Cause | Fix |
|-----------|-------|-----|
| `Unable to resolve '@import "tailwindcss"' from src/styles` / build fails when CSS = `none` | Feature-based `main.*` imports `./styles/globals.css`, but framework CSS was written only to `src/index.css` | `css.js` writes the framework content to **both** `index.css` and `styles/globals.css` (when present) |
| `Missing export` / "Element type is invalid … got: undefined" for `Sun`, `Moon`, `Github` imports | `@hugeicons/react@1.1.10` removed per-icon named exports (now single `HugeiconsIcon`); icons live in `@hugeicons/core-free-icons` | Import `HugeiconsIcon` from `@hugeicons/react` and `Sun01Icon`/`Moon01Icon`/`Github01Icon` from `@hugeicons/core-free-icons`; render `<HugeiconsIcon icon={...Icon} />` |
| `Github is undefined` from `lucide-react` on render | lucide 1.x **removed brand icons** (`Github`) | Swap to a neutral existing icon (`GitBranch`) in the lucide templates |
| Theme/context typing invoked at module scope in tests | Barrel files re-export the provider + store mix (react-refresh, hoisting) | Keep barrels component-only; contextual state behind `*.ts` context files |

## Harness infrastructure

| Signature | Cause | Fix |
|-----------|-------|-----|
| `getcwd(): cannot access parent directories` from `rsync`/`execSync` children | Harness cwd slid into a tmp project dir that was subsequently `rm -rf`'d | `process.chdir(REPO)` at the start and end of every scaffold step (same guard `exhaustive.mjs` uses) |
| Determinism diff false-positives | Tree compare includes `node_modules`/`dist`/timestamps (e.g. `package-lock` churn, build artifacts) | Normalize: skip `node_modules`, `dist`, `.git`; only generator-written files participate |
| `npm test` sweeps slow/e2e harnesses | Node's default runner picks up unguarded test files | Keep `verify:*` and exhaustive files out of the `test` glob (matched targets only, or run them via `node`) |