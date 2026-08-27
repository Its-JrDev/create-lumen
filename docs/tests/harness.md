# Test Harness

The CLI repo ships its tests under `tests/`, split into `unit/`, `smoke/`, and
`e2e/`. The `unit/` and `smoke/generate.test.mjs` run under `npm test` (built-in
`node:test` runner). The two harness scripts — `tests/smoke/install.mjs` and
`tests/e2e/exhaustive.mjs` — are plain ESM Node scripts (no test framework) that
drive the real generator pipeline against generated scaffolds, so they run
directly with `node` and are intentionally kept out of `npm test`.

## Why these exist

The CLI itself has no app-level test suite — `npm test` runs the unit tests under
`tests/unit/` and the offline smoke under `tests/smoke/`. These harnesses instead
validate the **generated output** across the option matrix: every combination of
choices produces the expected files, `package.json` scripts, config wiring, and
alias setup.

## Smoke tests (`tests/smoke/`)

### `tests/smoke/install.mjs` — real-install smoke (1 config)

Drives the **full** generation pipeline (including `npm create vite` and
`npm install`) for the **Quick Setup default** (`eslint` + `prettier`, TS,
Tailwind, feature-based, Router, Vitest). It is the only harness that performs a
real dependency install, so it is the sole guard against install-time breakage
(malformed `package.json`, deps that fail to resolve). Requires network access
and a package manager. ~1–2 min.

```bash
node tests/smoke/install.mjs
```

### `tests/smoke/generate.test.mjs` — offline smoke (runs under `npm test`)

A `node:test` smoke that generates the Quick Setup scaffold for **ts and js**
using a cached Vite base (no installs) and asserts the scaffold is coherent:
`package.json` scripts (`dev`/`build`/`preview`/`lint`/`format`/`test`, …),
`src/main` + `src/App`, the `@/*` alias, `eslint.config.*` with `...prettier`
last, and `README.md` + `LICENSE`.

## Exhaustive harness (`tests/e2e/`)

### `tests/e2e/exhaustive.mjs` — full option matrix (~11,664 configs)

Enumerates every valid combination of the choice dimensions — architecture,
language, css framework, testing, router, state management, icons, API client,
linter, and formatter — respecting the `linter → formatter` dependency
(`none → [none]`, `eslint → [none, prettier]`, `oxlint → [none, oxfmt, prettier]`),
and generates + checks each scaffold.

To stay fast and offline, it builds a real Vite base **once per language**
(cached in `tests/.cache/`, created via `npm create vite`), then for each combo
copies the base and runs the injection pipeline **without re-installing
dependencies**. It asserts the generated filesystem:

- formatter / linter / testing config files
- `package.json` scripts (`lint`, `lint:fix`, `format`, `format:check`, `test`, …)
- `eslint-config-prettier` wiring for `eslint` + `prettier` (both the JS array
  form and the TS `tseslint.config(...)` form)
- `@/*` path alias in `tsconfig.json` / `jsconfig.json`
- architecture layout (`src/app` vs `src/components`), `StoreProvider` injection
  for Redux, router files, and generated `README.md` / `LICENSE`

```bash
node tests/e2e/exhaustive.mjs            # full matrix (~13 min)
LIMIT=200 node tests/e2e/exhaustive.mjs  # quick subset
```

## Scope / limitations

- All harnesses call the `src/` generation pipeline **directly**; none of them
  spawns `bin/cli.js` through the interactive `@clack/prompts` layer. They are
  integration tests of the generator, not true end-to-end runs of the CLI itself
  (a headless e2e would require driving the interactive prompts, which is not
  currently supported).
- `tests/smoke/install.mjs` performs a real install; `generate.test.mjs` and
  `exhaustive.mjs` skip installation — they verify structure and `package.json`
  scripting only, so they do not prove a later `npm install` resolves.
- `linter: "none"` assertions are lenient: the Vite base template ships its own
  eslint config + `lint` script, which the generator leaves in place.
- Generated scaffolds are written under the OS temp dir and removed after each
  run. The cached Vite bases live in `tests/.cache/` (git-ignored).

## What it caught

The exhaustive harness originally failed all 3,888 jest configs: the jest
template stores its setup as `jest.setup.ts` at the template root (and
`jest.config` references `<rootDir>/jest.setup.ts`), but the injector only
copied `src/test/setup.*`. Fixed in `src/injector.js` (`injectTesting`), along
with the `setupFilesAfterSetup` → `setupFilesAfterEnv` typo in
`jest.config.{ts,js}`.
