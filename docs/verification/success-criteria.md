# Success criteria

"Verification passed" is a binary, quantitative outcome. A `verify` gate only
passes when the following hold for **every** generated scaffold in scope.

## Matrix scope

- **Stratified default** (`verify:offline` default): the 9 `DEFAULT_CELLS` in
  `tests/e2e/matrix.mjs`, chosen to touch every option dimension — both
  architectures, both languages, all 3 CSS frameworks, all 3 testing setups,
  all 3 state-management strategies, both icon libraries, both API clients,
  all 3 linters, all 3 formatters (incl. `none`).
- **Full matrix** (`FULL=1`): every cell of the Cartesian product
  (architecture × language × cssFramework × testing × router ×
  stateManagement × iconLibrary × apiClient × linter × formatter) that the
  generator accepts. Total ≈ 11,664 combos.
- **Installed** (`verify:installed`): 4 sampled cells that stress the build &
  runtime surface, or the full stratified set with `FULL=1`. TS cells in this
  gate additionally run `tsc -b` (criterion 8).

## Hard gates (non-negotiable for a passing run)

| # | Criterion | Quantitative form |
|---|-----------|-------------------|
| 1 | No lint findings, any rule set | `eslint . --max-warnings=0` exit 0 **and** oxlint `diagnostics.length === 0` under `--format=json` |
| 2 | Canonical formatting on init | `prettier --check .` exit 0 (prettier cell) and `oxfmt --check .` exit 0 (oxfmt cell) on a **freshly generated, just-formatted** project |
| 3 | Formatter cross-compatibility | Parity file set (source/config code) passes the *other* formatter's `--check` when that toolchain's canonical rc is staged |
| 4 | Format idempotence | `npm run format` twice → identical tree hash; `format:check` still exit 0 |
| 5 | Deterministic output | Generating the same cell twice yields byte-identical trees |
| 6 | Config wired correctly | Per-cell audit: chosen rc files exist, script names match the README table, vite `@` alias present (non-tailwind), `main.*` chosen language only |
| 7 | Real-world dependency closure | For eslint+TS cells: `jiti` declared; every script-referenced tool binary exists post-install |
| 8 | Type correctness (TS cells, installed gate) | `tsc -b` exit 0 over the scaffold's tsconfig graph — strict mode, zero errors, no deprecation warnings |
| 9 | Runtime correctness | `vitest run` / `jest --ci` exit 0 on the scaffold's own test; `npm run build` produces a bundle |

## Interpretive rules

- A warning anywhere is a failure (criteria 1 and 4 leave no tolerance). The
  templates ship with explicit `globals` scoping, a `react-refresh` friendly
  context layout, and architecture-scoped tests — anything that trips a
  warning tier is a defect to fix in templates, not to suppress.
- A gate that is structurally inapplicable to a cell (e.g. `oxfmt --check` in
  a cells without an oxfmt rc) is skipped by design, never "fixed" by silently
  doctoring cell rules.
- Cross-tool probe covers **code files only**. Markdown/HTML/JSON are
  single-tool formats by design (oxfmt does not emit canonical package.json /
  README formatting); byte-determinism within a toolchain is what criterion 5
  holds for those.

## Release bar

Before publishing a new `create-lumen` version the maintainer runs:

```bash
npm run verify            # must be green (offline, stratified)
npm run verify:matrix     # must be green (full offline matrix)
npm run verify:installed  # must be green (real install + build + tests)
npm test                  # unit + smoke suites must be green
```

A PR that touches `templates/`, `src/injector.js`, `src/css.js`,
`src/configure.js`, `src/dependencies.js`, or `src/format.js` must keep all of
the above green with no tolerance for a skipped cell.