# Roadmap &amp; Changelog

This document records what has shipped in each `create-lumen` release and the

ideas being considered for future versions. Released sections describe the actual

behavior of the published CLI; the Future section is proposal-only and not yet

scheduled.

---

## 📦 Version 1.0.0 (Released) — Initial release

The baseline scaffolder. Generates a production-ready React + Vite project and

lets the user pick an architecture and a set of optional features through an

interactive prompt flow.

### Features

- Architecture choice: **feature-based** or **component-based**
- Language: **TypeScript** or **JavaScript**
- CSS frameworks: **Tailwind**, **Bootstrap**, or **none**
- Optional state management: **Zustand** or **Redux Toolkit**
- Optional **React Router**
- Optional testing: **Vitest** or **Jest**
- Linting: **ESLint** (default) or **Oxlint**
- Optional **Axios** data-fetching setup and icon libraries (**lucide**, **huge**)
- Auto `git init`, generated `README.md` and `LICENSE`
- `@/` path alias configured (`tsconfig`/`jsconfig` + Vite)

### How it works

- `bin/cli.js` → `src/main.js` orchestrates: `npm create vite` → base install →

  inject architecture → apply conditional overlays → install conditional deps →

  CSS setup → configure aliases/scripts → cleanup → README.
- Templates: `templates/architectures/{feature-based,component-based}` (base trees)

  and `templates/conditional/{state,router,icons,axios,fetch,testing,linting}`

  (overlays selected by choices).
- `@/` alias is wired into `vite.config` for non-Tailwind setups; Tailwind uses

  its own `vite.config` template.
- Choices are cached in `~/.lumen-config.json` and offered as defaults on

  re-runs.

---

## 📦 Version 1.1.0 (Released) — Prettier &amp; Oxfmt integration

Dynamic code formatter support based on the chosen linter. This improves

consistency and developer experience by scaffolding the formatter config and

`format` scripts automatically.

### Dynamic prompt flow

1. **Linter selection:** ESLint / Oxlint / None.
2. **Formatter selection (conditional on the linter):**
  - ESLint → None | Prettier
  - Oxlint → None | Oxfmt (recommended) | Prettier

### What shipped

- `templates/conditional/formatter/prettier/.prettierrc` and

  `templates/conditional/formatter/oxfmt/.oxfmtrc.json`.
- `injectFormatter()` in `src/injector.js` copies the config and appends

  `format` / `format:check` (`prettier --write .` / `prettier --check .`) or

  `format` (`oxfmt .`) scripts to `package.json`.
- `eslint-config-prettier` wired as the **last** element of `eslint.config` for

  the ESLint + Prettier combo — handling both the JS array form and the TS

  `tseslint.config(...)` form.
- `src/dependencies.js` installs `prettier`, `eslint-config-prettier`, or `oxfmt`

  per the matrix below.
- `src/readme.js` generates the `README.md` with a real project description
  (reflecting the architecture and the chosen tooling — e.g. "This project is
  set up with ESLint + Prettier for code quality.") plus "Built With" + scripts.
- `.env.example` scaffolding — a `.env.example` is copied into every generated
  project (`src/env.js::copyEnvExample`), and the generated `.gitignore` is
  updated to ignore env files (`.env`, `.env.*`) while whitelisting
  `.env.example`.
- **Non-interactive flags** — `bin/cli.js` accepts `-y` to apply the Quick
  Setup defaults without prompting. `main()` receives `{ quickSetup,
  projectName }`; `getUserInputs(projectName, { quickSetup })` returns the
  defaults directly, skipping the prompt and config-cache reuse flow.
- **Path aliases** — the generated `tsconfig`/`jsconfig` and Vite config get
  the `@/*` → `src/*` alias (via `src/aliases.js`). The scaffolder itself also
  gains a root `jsconfig.json` mapping `@/*` to `src/*` for its own internal
  imports.
- Quick Setup defaults: linter `eslint`, formatter `prettier`, `gitInit: true`.

### Dependency matrix


| Linter | Formatter | `devDependencies` to Install         |
| :------ | :--------- | :------------------------------------ |
| ESLint | Prettier  | `prettier`, `eslint-config-prettier` |
| Oxlint | Oxfmt     | `oxfmt`                              |
| Oxlint | Prettier  | `prettier`                           |
| None   | —         | None                                 |


### Default configuration files

#### Oxfmt (`.oxfmtrc.json`)

```json
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "printWidth": 80,
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all"
}
```

#### Prettier (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

---

## 🔮 Future / Ideas (unscheduled)

Proposals only — **no work has started** on these:

- **True headless e2e** — drive `bin/cli.js` through the prompts (current

  harnesses call `src/` directly, so they are integration tests, not CLI e2e).
- **Separate `typecheck` script in generated projects** — add an explicit
  `typecheck` (`tsc -b`) script to generated TS projects, kept independent of
  the `build` script (`build` stays as `vite build`). Scaffolds already
  type-check clean under `strict` mode (gated by `verify:installed`);
  this item only wires a user-facing script + README row.
- Expanded test coverage for additional option combinations.

