# Testing `create-lumen`

This folder documents how the **CLI scaffolder itself** is tested. It does *not*
test generated apps — these tests validate the generator that produces them.

Tests live under `tests/` and are split into three tiers:

| Tier  | Location            | Runner                                  | What it covers                                                              |
| ----- | ------------------- | --------------------------------------- | --------------------------------------------------------------------------- |
| Unit  | `tests/unit/`       | `node:test` (via `npm test`)            | Isolated functions: `injectFormatter`, `wireEslintPrettier`, `getPkgManager` |
| Smoke | `tests/smoke/`      | `node:test` + a manual script           | Quick, representative scaffold generation (offline) and a real-install check |
| E2E   | `tests/e2e/`        | manual `node`                           | Exhaustive option-matrix generation across all valid choice combos           |

## Running

```bash
npm test                        # unit (tests/unit/) + offline smoke (tests/smoke/generate.test.mjs)
node tests/smoke/install.mjs    # real-install smoke (Quick Setup default; needs network)
node tests/e2e/exhaustive.mjs   # full option matrix (~11,664 combos, offline); LIMIT=n for a subset
```

`npm test` intentionally runs only the fast, offline `node:test` files
(`*.test.mjs`). The two harness scripts (`install.mjs`, `exhaustive.mjs`)
generate full scaffolds and are run manually.

## Tier details

### Unit (`tests/unit/`)
Fast, no filesystem scaffolding. Asserts that individual generator functions
produce the right config, scripts, and ESLint wiring. See
`tests/unit/injector.test.mjs` and `tests/unit/pkg-manager.test.mjs`.

### Smoke (`tests/smoke/`)
- `generate.test.mjs` — offline `node:test` smoke. Builds a cached Vite base
  once, then generates the Quick Setup scaffold for TS and JS and asserts it is
  coherent (scripts, `@/*` alias, `...prettier` last, `README`/`LICENSE`).
- `install.mjs` — manual real-install smoke. Runs the **full** pipeline including
  `npm create vite` + `npm install` for the Quick Setup default; the only guard
  against install-time breakage.

### E2E (`tests/e2e/`)
`exhaustive.mjs` enumerates every valid combination of the choice dimensions
(respecting the `linter → formatter` dependency) and asserts the generated
filesystem for each. Uses a cached Vite base (`tests/.cache/`, git-ignored) so it
stays offline and fast.

> All harnesses call the `src/` generation pipeline **directly**; none spawn
> `bin/cli.js` through the interactive prompts. They are integration tests, not
> true end-to-end runs of the CLI. See [harness.md](./harness.md) for full scope,
> limitations, and what they caught.
