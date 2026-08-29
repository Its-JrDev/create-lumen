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

## 📦 Version 1.1.x (Released) — Prettier &amp; Oxfmt integration

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

## 📦 Version 1.2.0 (Released) — API client layer + feature-based `shared/` housekeeping

Rework of the data-fetching layer and the feature-based architecture layout so
the generated scaffolds ship a clear, dependency-honest structure and a named
`api` client.

### What shipped

- **Axios as `api`** — the axios client is refactored from a monolithic
  `axios.ts` into a split layer (`api.config` + `api.client`) and is exported
  end-to-end as `api` (client default export + barrel re-export), not `apiClient`.
  `user.service` performs real CRUD (`get`/`post`/`put`/`delete`).
- **Fetch layer parity** — the fetch client mirrors the axios layout
  (`api.config` + `api.client`) with `get`/`post`/`put`/`delete`, configured to
  intercept `VITE_API_URL`. `user.service` calls the named `api` methods and
  never calls `fetch()` directly.
- **Dropped `config/constants`** — both clients inline `VITE_API_URL`; the
  unused `src/config/constants.*` file is no longer shipped.
- **Feature-based `shared/` grouping** — reusable resources moved under
  `src/shared/` (`api`, `components`, `hooks`, `layouts`, `lib`, `stores`,
  `styles`, `types`, `utils`); the feature tree keeps only `app/`, `features/`
  and `shared/` at the top level.
- **api-vs-lib rule** — the **fetch** client lives in `src/shared/api/` (not an
  external dependency) while the **axios** client lives in `src/shared/lib/axios/`
  (third-party lib init). Subfolders lean on a barrel for the named `api`
  export.
- **Removed unused barrels** — non-consumed barrel files (comp
  `layouts/hooks/utils/services` indexes, feat `home/services` index) are
  deleted while the real files (`MainLayout`, `useLocalStorage`, `cn`) are kept;
  `.gitkeep` placeholders preserve folders that would otherwise disappear.
- **Public feature barrel** — `features/home/index.ts` re-exports the feature's
  public surface; `App` and the router import `@/features/home`.
- **Removed `interfaces/`** — the per-feature `interfaces` folder is dropped;
  types live in `shared/types` (global) with a per-feature `types/` placeholder.
- Generated projects ship a `typecheck` script (`tsc -b`), independent of
  `build` (which stays `vite build`).

### Verification

`npm test` (46 unit + smoke), `verify:offline` (9 stratified cells) and the
4-variant `tsc`/build surface. Full offline matrix and real-install gates are
run before release (see `docs/verification/`).

---

## 🔮 Future / Ideas (unscheduled)

Proposals only — **no work has started** on these:

- **True headless e2e** — drive `bin/cli.js` through the prompts (current

  harnesses call `src/` directly, so they are integration tests, not CLI e2e).
- **Generated API resource services** — today `user.service` (per API client) is
  a hand-written example; add a generator that scaffolds a full CRUD service
  (`get`, `getById`, `create`, `update`, `delete`, …) for an API resource,
  wiring it to the shared `api` client with types from `shared/types`.
- Expanded test coverage for additional option combinations.

