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

## 🚧 Version 1.2.x (Unreleased) — API layer + feature-based `shared/` + framework-aware styling + data-router parity + providers + themes

Entries are listed newest first (blog order). Each entry links the commit
that landed it; for older work the commit SHA in `git log` is the canonical
reference.

---

### 2026-08-29 — Catch-up README + readme.js + leftover file deletes (chore)

`4975780` · `chore: catch-up README + error-resolution-matrix + readme.js + folder deletes from commits 1-4`

Working-tree changes from commits `836f877` / `c7e729a` / `a952a74` /
`6f6e46c` that did not get staged together with their commit (the
per-commit `git add` excluded them to keep each commit narrow).
Grouped into a single follow-up to keep the history readable.

- README.md feat tree shows `app/{contexts,providers,hooks}`; router/
  replaced `router.tsx` with the per-area layout. comp tree shows
  `providers/{appcontext,AppProvider}` + `hooks/useApp` + `themes.css`;
  `src/index.css` removed.
- `docs/verification/error-resolution-matrix.md` react-refresh row
  rewritten to reference the actual split (feat
  `contexts/providers/hooks`; comp `providers/appcontext/AppProvider`
  + `hooks/useApp`).
- `src/readme.js` `styles/` row is now selection-aware (`main.css
  (reset) + themes.css (CSS variables)` for `none`; `globals.css
  (framework directives) + themes.css` otherwise).
- Added the three `.gitkeep` placeholders that the architecture copy
  needs to keep `styles/` + `config/` folders alive until
  `setupCssFramework` populates them
  (`templates/architectures/component-based/src/{config,styles}/.gitkeep`
  + `templates/architectures/feature-based/src/shared/styles/.gitkeep`).
- Deleted stale files whose replacements live in different paths:
  old per-area router files, comp redux `StoreProvider` in
  `context/`, and Vite-default `index.css` per framework.

---

### 2026-08-29 — CSS framework naming: `main.css` for vanilla, `globals.css` for tailwind/bootstrap + `themes.css` everywhere

`6f6e46c` · `feat(v1.2.x): CSS framework naming — main.css for vanilla, globals.css for tailwind/bootstrap + themes.css`

- The vanilla stylesheet renames `index.css` → `main.css`; the other two
  frameworks keep `globals.css` (their idiomatic name — it carries the
  framework directive, not a hand-written global stylesheet).
- Every framework now ships a `themes.css` next to the main stylesheet,
  with the idiomatic shape of its ecosystem:
  - **`none`** (vanilla): `:root { --color-bg, --color-fg, --color-muted,
    --color-primary, --color-border }` + `:root[data-theme="dark"] { … }`.
  - **`tailwind` v4**: `@custom-variant dark (&:where([data-theme="dark"],
    [data-theme="dark"] *))` + `@theme { --color-primary }`. Tailwind
    recognizes the `data-theme` attribute on `<html>`.
  - **`bootstrap` 5.3+**: `:root[data-bs-theme="light|dark"] { --bs-primary,
    --bs-body-bg, --bs-body-color }`. Bootstrap reads its own `data-bs-theme`.
- `src/css.js` writes **only** into the architecture-specific `styles/`
  folder (`shared/styles/` for feat, `styles/` for comp); never into
  `src/index.css`. A new `syncMainCssImport` step rewrites the import in
  `main.{ts,jsx}` to the framework-correct filename (so `none` projects
  import `main.css`, the others import `globals.css`).
- Vite's stale `src/index.css` is removed (`src/injector.js` removes it
  before the architecture copy; `src/css.js` `deleteIfExists` cleans it up
  as a second net). `App.css` cleanup was already in place.

_Tests:_ exhaustive + verify-offline both assert `themes.css` presence,
correct main stylesheet by framework (`main.css` for `none`,
`globals.css` otherwise), `var(--color-)` consumption in vanilla CSS, and
absence of `src/index.css`. 9/9 default cells PASS.

---

### 2026-08-29 — `providers/` consolidation (feat split, comp co-located)

`a952a74` · `feat(v1.2.x): providers consolidation + App wiring + CSS variables in components`

- **feature-based** (split across directories):
  - `app/contexts/themecontext.{ts,js}`: pure `createContext` +
    `ThemeContextValue` interface (no JSX, no component export).
  - `app/providers/ThemeProvider.{tsx,jsx}`: the Provider component,
    imports `ThemeContext` from `../contexts/themecontext`. **Only export.**
  - `app/hooks/useTheme.{ts,js}`: hook that reads the context. Throws if
    used outside a `<ThemeProvider>`.
  - App wraps with `<ThemeProvider>` (previously orphan).
- **component-based** (split across files inside `providers/`):
  - `providers/appcontext.{ts,js}`: `createContext` + `AppContextValue`.
  - `providers/AppProvider.{tsx,jsx}`: Provider component, **only export**,
    imports `AppContext` from `./appcontext`.
  - `hooks/useApp.{ts,js}`: hook that reads `AppContext`.
  - `providers/.gitkeep` placeholder; `pruneRedundantGitkeeps` removes it
    when redux overlay populates `providers/StoreProvider`.
  - App wraps with `<AppProvider>`.
- Fast Refresh rule `react-refresh/only-export-components`: contexts and
  hooks must live in separate files from the Provider. Feat splits at
  directory level (`contexts/` + `providers/`); comp splits at file level
  inside `providers/`.
- Redux overlay: `StoreProvider.{tsx,jsx}` moves from
  `context/StoreProvider` → `providers/StoreProvider`. Injector
  `updateMainWithProvider` patched to import from `./providers/StoreProvider`.
- App wiring in both router overlays: feat
  `<App>` wraps `<ThemeProvider><AppRouter/></ThemeProvider>`; comp
  `<App>` wraps `<AppProvider><AppRoutes/></AppProvider>`.
- All presentational components (Button, Home/HomePage, MainLayout,
  RootLayout, App shells, router placeholders, auth.routes protected page)
  consume `var(--color-*)` instead of hex codes, so the theme wiring
  actually repaints when `data-theme` switches.

_Tests:_ exhaustive + verify-offline arch-aware provider asserts
(feat needs `app/contexts/themecontext.{ts,js}` + `app/providers/ThemeProvider.{tsx,jsx}` +
`app/hooks/useTheme.{ts,js}`; comp needs `providers/appcontext.{ts,js}` +
`providers/AppProvider.{tsx,jsx}` + `hooks/useApp.{ts,js}` and asserts
absence of legacy `src/context/`). `AppProvider`/`ThemeProvider` both
set `document.documentElement.dataset.theme` on each theme change.

---

### 2026-08-29 — Router as a folder, with split providers (feat per-area, comp centralized)

`c7e729a` · `feat(v1.2.x): router as folder with split providers (feat per-area, comp centralized)`

- **feature-based** (per-area): `src/app/router/{index,guards,routes}/`
  - `index.tsx` (`createBrowserRouter` + `RouterProvider`).
  - `guards/`: `AuthGuard` (redirects to `/login` when not authenticated) +
    `RoleGuard` (RBAC example, redirects to `/login` when role mismatch).
  - `routes/`: `home.routes` (index → `HomePage`) + `auth.routes` (path
    `'admin'` wrapping `AuthGuard > RoleGuard > inline protected page`).
  - App wraps `<AppRouter>`. Old `src/app/router.{ts,tsx}` deleted.
- **component-based** (centralized): `src/router/{index,guards}/`
  - `index.tsx` is the single source of truth for every route:
    `/` (HomePage, public, no guard), `/login` (`GuestGuard`), `/admin`
    (`AuthGuard`).
  - `guards/`: `AuthGuard` (same as feat) + `GuestGuard` (bounces
    authenticated users away from guest-only pages — does **not** block
    public routes, which carry no guard at all).
  - No `routes/` directory; the route table is the only place route
    definitions live (per the "centralized router" principle).
  - App wraps `<AppRoutes>`. Old `src/routes/index.{ts,tsx}` deleted.

_Tests:_ exhaustive + verify-offline arch-aware router asserts
(feat needs `RoleGuard` + `routes/{home,auth}.routes`; comp needs
`GuestGuard` and asserts `src/router/routes/` is absent).

---

### 2026-08-29 — Drop dead provider orphans + feat `shared/` cleanup

`836f877` · `feat(v1.2.x): drop dead provider orphans + feat shared/ cleanup`

- Drop dead `src/context/{app-context,AppContext}.{ts,tsx,js,jsx}` in
  comp (six files no cell consumed; `AppContext.tsx` was a Provider
  component living in a `context/` folder).
- Drop unused `src/config/routes.{ts,js}` (dead `ROUTES` constants;
  nothing imported them).
- Drop `templates/architectures/feature-based/src/shared/api/.gitkeep` +
  `shared/lib/.gitkeep` — under the api-vs-lib exclusivity rule (none →
  neither, fetch → only `api`, axios → only `lib/axios`), the folders
  shouldn't ship when neither client is chosen. They only existed as
  placeholders to survive the architecture copy.
- Drop `templates/architectures/{feature-based,component-based}/src/{shared/,}styles/globals.css` — these were Vite's defaults that
  leaked framework-specific content (`@import "tailwindcss";` for feat)
  before `setupCssFramework` rewrote them. They are reintroduced under
  the right names in the next entry.

---

### 2026-08-29 — Framework-aware styling + data-router parity (baseline)

`08f70e4` · `feat(v1.2.x): framework-aware styling + data-router parity across architectures`

- **Framework-aware component styling** — the shared look (App shell, home
  page, Button, layout) is expressed per framework: **Tailwind** classes,
  **Bootstrap** utilities, or **inline styles** for `none`. Base components
  and the icon overlays (`lucide`, `huge`) all switch markup with the CSS
  choice instead of hardcoding Tailwind. Variants live in
  `templates/css/component-styles/{tailwind,bootstrap}/` plus
  `tailwind/`/`bootstrap` subfolders of the icon overlays; the root version
  of each component is the inline (`none`) default.
- **CSS globals fix (v1.2.0 regression)** — `src/css.js` now writes the
  chosen framework's stylesheet to the globals file each architecture
  actually imports (`shared/styles/globals.css` for feature-based,
  `styles/globals.css` for component-based). The `shared/` move left the
  path pointing at the old location, so Bootstrap/none never reached the
  feature-based stylesheet.
- **Data-router + `Outlet` parity** — component-based `routes/` migrates
  from `BrowserRouter`/`Routes` to `createBrowserRouter`/`RouterProvider`,
  with `MainLayout` as the parent route rendering `<Outlet />`.
  Feature-based gains `shared/layouts/RootLayout` (an `Outlet`-rendering
  shell) so the app chrome is preserved under the data router instead of
  being dropped.
- **Strict folder pruning** — generated `src/` never ships folders the
  selection doesn't own: a generic post-injection pass removes `.gitkeep`
  placeholders from directories an overlay populated with real files
  (e.g. comp `services/.gitkeep`).
- **Comp housekeeping** — removed the unused `src/components/layout`
  placeholder (duplicated `src/layouts/`); `components/form` is kept.

---

### Earlier v1.2.0 — API layer + feature-based `shared/` housekeeping

`8ec162c`, `be5a709`, `90fc13e`, `d229f8f`, `6e6eda2`, `09da701` (see
`git log -- v1.2.0`).

- **Axios as `api`** — refactored from a monolithic `axios.ts` into a
  split layer (`api.config` + `api.client`) and exported end-to-end as
  `api` (client default export + barrel re-export), not `apiClient`.
  `user.service` performs real CRUD (`get`/`post`/`put`/`delete`).
- **Fetch layer parity** — fetch client mirrors the axios layout
  (`api.config` + `api.client`) with `get`/`post`/`put`/`delete`,
  configured to intercept `VITE_API_URL`. `user.service` calls the named
  `api` methods and never calls `fetch()` directly.
- **Dropped `config/constants`** — both clients inline `VITE_API_URL`;
  the unused `src/config/constants.*` file is no longer shipped.
- **Feature-based `shared/` grouping** — reusable resources moved under
  `src/shared/` (`api`, `components`, `hooks`, `layouts`, `lib`, `stores`,
  `styles`, `types`, `utils`); the feature tree keeps only `app/`,
  `features/` and `shared/` at the top level.
- **api-vs-lib rule** — **fetch** lives in `src/shared/api/` (not an
  external dependency), **axios** in `src/shared/lib/axios/` (third-party
  lib init). Folders are strictly mutually exclusive.
- **Removed unused barrels** — non-consumed barrels deleted; `.gitkeep`
  placeholders preserve folders that would otherwise disappear.
- **Public feature barrel** — `features/home/index.ts` re-exports the
  feature's public surface.
- **Removed `interfaces/`** — per-feature `interfaces` folder dropped;
  types live in `shared/types` (global).
- **Generated `typecheck` script** (`tsc -b`), independent of `build`
  (which stays `vite build`).
- **Component-based types parity** — tsconfig strict + `vite/client`
  types; `useLocalStorage<T>`, redux `PayloadAction`/`RootState`/
  `AppDispatch`, etc.

---

### Verification

`npm test` (46 unit + smoke), `verify:offline` (9 stratified cells) and
the real-install gates (`verify:installed`: lint, format/idempotence,
vitest/jest, `tsc -b`, `vite build`) stay green. `exhaustive` adds
markup parity asserts for all framework × architecture combos, plus
arch-aware router/provider/CSS assertions for the v1.2.x entries above.

The full offline matrix is run before release (see
`docs/verification/`).

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

