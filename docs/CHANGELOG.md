# Changelog

All notable changes to `create-lumen` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

> Status: 🚧 In Progress · Target: v1.2.0

### Added

- **CSS framework naming: `main.css` for vanilla, `globals.css` for tailwind/bootstrap + `themes.css` everywhere** (`6f6e46c`) — vanilla stylesheet renamed `index.css` → `main.css`; the other two frameworks keep `globals.css`. All three frameworks ship `themes.css` next to the main stylesheet, with the idiomatic shape of their ecosystem (`:root` CSS variables for vanilla, `@custom-variant dark` + `@theme` for Tailwind v4, `:root[data-bs-theme]` for Bootstrap 5.3+). `src/css.js` writes only into the architecture-specific `styles/` folder; `syncMainCssImport` rewrites the import in `main.{ts,jsx}` to match the framework's filename.
- **`providers/` consolidation (feat split, comp co-located)** (`a952a74`) — feat ships `app/{contexts,themecontext.ts}` + `app/providers/ThemeProvider.tsx` + `app/hooks/useTheme.ts`; comp ships `providers/appcontext.ts` + `providers/AppProvider.tsx` + `hooks/useApp.ts`. Fast Refresh `react-refresh/only-export-components` compliant: contexts and hooks live in separate files from the Provider component. Both providers set `document.documentElement.dataset.theme` on every theme change.
- **Router as a folder with split providers (feat per-area, comp centralized)** (`c7e729a`) — feat ships `app/router/{index,guards,routes}/` with `AuthGuard` + `RoleGuard` and per-area route modules; comp ships `router/{index,guards}/` with `AuthGuard` + `GuestGuard` and a single `index.tsx` as the route source of truth.
- **Drop feat `shared/{api,lib}` placeholders** (`836f877`) — under the api-vs-lib exclusivity rule, generated projects never ship folders the selection doesn't own.
- **Catch-up README + readme.js + leftover folder deletes** (`4975780`) — bundled working-tree changes from commits 1-4 (README trees, error-resolution-matrix react-refresh row, `src/readme.js` selection-aware `styles/` row, `.gitkeep` placeholders for `styles/` + `config/` folders, stale file deletes).
- **Framework-aware component styling** (`08f70e4`) — App shell, Button, layout, and the icon overlays (`lucide`, `huge`) all switch markup with the CSS choice instead of hardcoding Tailwind. Variants live in `templates/css/component-styles/{tailwind,bootstrap}/`.
- **Data-router + `Outlet` parity** (`08f70e4`) — component-based `routes/` migrates to `createBrowserRouter`/`RouterProvider` with `MainLayout` as parent; feature-based gains `shared/layouts/RootLayout` so the app chrome is preserved.
- **Strict folder pruning** (`08f70e4`) — a generic post-injection pass removes `.gitkeep` placeholders from directories an overlay populated with real files.
- **Redux overlay co-location** (`a952a74`) — `StoreProvider` moves from `src/context/StoreProvider` → `src/providers/StoreProvider` to match the providers consolidation rule.
- **CSS globals fix (v1.2.0 regression)** (`08f70e4`) — `src/css.js` now writes the chosen framework's stylesheet to the globals file each architecture actually imports (`shared/styles/globals.css` for feature-based, `styles/globals.css` for component-based).
- **Component-based types parity** (`09da701`) — generated `tsconfig.app.json` is `strict: true`; `useLocalStorage<T>`, zustand `create<CounterState>`, redux `PayloadAction`/`RootState`/`AppDispatch` typed end-to-end.
- **Generated `typecheck` script** (`09da701`) — `tsc -b` independent of `build` (which stays `vite build`).
- **Axios as `api`** (`8ec162c`, `be5a709`, `90fc13e`) — refactored from monolithic `axios.ts` into a split layer (`api.config` + `api.client`) and exported end-to-end as `api` (default export + barrel re-export), not `apiClient`. `user.service` performs real CRUD (`get`/`post`/`put`/`delete`).
- **Fetch layer parity** (`d229f8f`) — fetch client mirrors the axios layout (`api.config` + `api.client`) with `get`/`post`/`put`/`delete`, configured to intercept `VITE_API_URL`.
- **Feature-based `shared/` grouping** (`6e6eda2`) — reusable resources moved under `src/shared/` (`api`, `components`, `hooks`, `layouts`, `lib`, `stores`, `styles`, `types`, `utils`).
- **api-vs-lib rule** (`6e6eda2`, `c36b616`) — fetch client lives in `src/shared/api/`; axios client lives in `src/shared/lib/axios/`. Folders are strictly mutually exclusive.
- **Removed unused barrels** (`6e6eda2`) — non-consumed barrel files deleted; `.gitkeep` placeholders preserve folders that would otherwise disappear.
- **Public feature barrel** (`6e6eda2`) — `features/home/index.ts` re-exports the feature's public surface.

### Changed

- **App wiring** (`a952a74`) — App wraps `<AppProvider>` (comp) or `<ThemeProvider>` (feat); router overlays wrap App with their respective provider.
- **Components consume CSS variables** (`a952a74`) — Button, Home/HomePage, MainLayout, RootLayout, App shells, router placeholders, auth.routes protected page all use `var(--color-*)` instead of hex codes for the `none` framework, so `data-theme` switches actually repaint.
- **Redux overlay import path** (`a952a74`) — Injector's `updateMainWithProvider` now imports `./providers/StoreProvider` instead of `./context/StoreProvider`.

### Removed

- **Vite's stale `src/index.css`** (`6f6e46c`, `4975780`) — `src/css.js` writes only into the architecture-specific `styles/` folder; `injectArchitecture` removes the leftover before copy, and `deleteIfExists` cleans it up after.
- **Comp `src/context/{app-context,AppContext}.{ts,tsx,js,jsx}`** (`836f877`) — six orphan files no cell consumed.
- **Comp `src/config/routes.{ts,js}`** (`836f877`) — dead `ROUTES` constants; nothing imported them.
- **Comp `src/components/layout/`** (`08f70e4`) — duplicate of `src/layouts/`.
- **Old `src/app/router.{ts,tsx}` (feat) + `src/routes/index.{ts,tsx}` (comp)** (`c7e729a`, `4975780`) — replaced by the folder structure.
- **Per-feature `interfaces/` folder** (`6e6eda2`) — types live in `shared/types` (global).
- **`src/config/constants.{ts,js}`** (`90fc13e`) — both API clients inline `VITE_API_URL` directly.

## [1.1.4] — 2026-08-28

### Fixed

- Verified generated scaffolds against a pinned lint/format/test toolchain (`97ef771`).

## [1.1.3] — 2026-08-27

### Fixed

- Update project name resolution to ignore flag arguments (`5b8d81f`).
- Respect quick setup and dynamic banner version (`0981fff`).

## [1.1.2] — 2026-08-27

### Fixed

- Handle `-y` project name fallback (`18896d8`).
- Update non-interactive quick setup command syntax in README (`77c56d1`).
- Make generated TS scaffolds strict-clean (`b1c865a`).

## [1.1.1] — 2026-08-27

### Fixed

- Include `register.js` in npm publish files (`2240ee1`).

## [1.1.0] — 2026-08-27

### Added

- **Dynamic formatter selection** — ESLint → None | Prettier; Oxlint → None | Oxfmt | Prettier.
- **Prettier & Oxfmt config scaffolding** — `templates/conditional/formatter/{prettier,oxfmt}/`.
- **`format` / `format:check` scripts** — appended by `injectFormatter()` to `package.json`.
- **`.env.example` scaffolding** — copied via `copyEnvExample()`; `.gitignore` updated to ignore env files while whitelisting `.env.example`.
- **Non-interactive `-y` flag** — Quick Setup defaults skip the prompt flow.
- **Path aliases (`@/*` → `src/*`)** — generated `tsconfig`/`jsconfig` + Vite config; scaffolder itself gets a root `jsconfig.json`.
- **README project description generation** — `src/readme.js` produces a real description reflecting the architecture and chosen tooling, plus "Built With" and scripts.

## [1.0.0] — 2026-08-26

### Added

- Architecture choice: **feature-based** or **component-based**.
- Language choice: **TypeScript** or **JavaScript**.
- CSS frameworks: **Tailwind**, **Bootstrap**, or **none**.
- Optional state management: **Zustand** or **Redux Toolkit**.
- Optional **React Router**.
- Optional testing: **Vitest** or **Jest**.
- Linting: **ESLint** (default) or **Oxlint**.
- Optional **Axios** data-fetching and icon libraries (**lucide**, **huge**).
- Auto `git init`, generated `README.md` and `LICENSE`.
- **`@/` path alias** configured (`tsconfig`/`jsconfig` + Vite).
- **Choice caching** — selections cached in `~/.lumen-config.json` and offered as defaults on re-runs.
- **Templates**:
  - `templates/architectures/{feature-based,component-based}` (base trees).
  - `templates/conditional/{state,router,icons,axios,fetch,testing,linting}` (overlays).
- **Orchestrator** — `bin/cli.js` → `src/main.js` runs `npm create vite` → base install → inject architecture → conditional overlays → conditional deps → CSS setup → configure aliases/scripts → cleanup → README.
