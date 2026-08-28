# Verification

`create-lumen` proves its scaffolds are flawless by construction. Every
generated project — regardless of the option matrix cell — must satisfy a
fixed set of gates before release. This directory documents the strategy, the
quantitative success criteria, and the known failure signatures with their
canonical remedies.

## How to run

```bash
npm run verify           # vendor toolchain + offline harness (no network needed)
npm run verify:full      # same + real-install harness (needs network)
npm run verify:matrix    # FULL offline matrix (~11.6k cells; slow)
```

| Script | What it does |
|--------|--------------|
| `verify:vendor` | One-time setup. Installs the **pinned** lint/format toolchain into `tests/.cache/vendor` (gitignored, hash-freshness gated by `tests/verify/install-vendor.mjs`) and seeds cached `create-vite` bases into `tests/.cache/base-{js,ts}/app`. Network required; subsequent ghost runs are offline. |
| `verify:offline` | `tests/verify/verify-offline.mjs`. Scaffolds from the cached bases into tmp dirs and symlinks the vendored `node_modules` (no install, no network). Runs the **stratified default cells** by default, or the **full matrix** with `FULL=1`. Runs every lint/format gate, the cross-tool probe, the config audit, and (in stratified mode) a byte-determinism re-generation check. |
| `verify:installed` | `tests/verify/verify-installed.mjs`. Scaffolds 4 sampled cells and performs a **real `npm install`** (mirroring `src/main.js`, including `installAllDeps`), then runs `npm run lint` + strict zero-warning gate, format idempotence (`npm run format` twice + `format:check`), `vitest run`/`jest --ci`, and `npm run build` (real `tsc -b` + `vite build`). `FULL=1` widens the sample. Failed projects are **retained** in `/tmp/lumen-inst-*` for inspection. |

The pinned toolchain lives in `tests/verify/vendor-package.json` (+ its
lockfile); `tests/verify/install-vendor.mjs` records a content hash so the
vendor install self-invalidates when pins change. The rejected-`npm test`
harnesses (`tests/smoke/install.mjs`, `tests/e2e/exhaustive.mjs`) are the
companion depth-10k checks: `exhaustive` exercises structural correctness of
the whole option matrix.

## What the checks prove

| Gate | Tool / config | Proves |
|------|---------------|--------|
| Native lint, zero findings | `eslint . --max-warnings=0` (with the generated `eslint.config.*`) and `oxlint .` (JSON formatter, because oxlint emits nothing under a pipe) | The scaffold's rule files actually load and pass under the exact versions users install. |
| Native format check | `prettier --check .` / `oxfmt --check .` (each with the project's own rc) | Canonical output — the generator's final format pass is a no-op on a fresh scaffold. |
| Cross-tool probe | Each formatter's canonical rc staged over the *other* toolchain's output (code files only) | Prettier and oxfmt are configuration-aligned: switching formatter on the same matrix cell must not reshape user code. |
| Format idempotence | `npm run format` twice → byte-identical tree, then `format:check` | Formatting is stable; running it repeatedly cannot dirty a working tree. |
| Format determinism | Generate the same cell twice → byte-identical tree (README/LICENSE baked by the generator, no timestamps) | Output is reproducible across runs. |
| Dep resolution | Real `npm install` then assert every declared tool bin exists | The scaffold installs and wires everything its scripts rely on (e.g. `jiti` for ESLint 10 TS configs). |
| Real tests + build | `vitest run` / `jest --ci`, `npm run build` (`tsc -b` for TS) | The generated app type-checks, tests pass, and it produces a production bundle — the offline harness cannot prove this. |

## Pitfalls codified in the harnesses

- ESLint ≥ 10 loads `eslint.config.ts` through **jiti** — the generated
  eslint+TS projects must declare `jiti` as a devDependency.
- `eslint-config-prettier` exports a **flat-config object**, not an iterable —
  spread it (`...prettier`) and the jiti-loaded TS config explodes at load
  time; append it **by reference** as the final element instead.
- **oxlint** (1.x) prints `Found 0 warnings and 0 errors` only on a TTY; under
  a pipe it emits nothing. The harness forces `--format=json` and asserts an
  empty `diagnostics` array.
- Running the harness from Node inside a deleted tmp cwd makes `rsync` /
  `execSync` children die with `getcwd` failures — every generator step and
  the harness itself must `process.chdir(REPO)` defensively.
- `tests/verify/*.mjs` run through `node --import ./register.js` (the `@/`
  alias hook) and **not** `npm test`, so they never get swept into the unit
  runner.