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

## 📦 Version 1.1.0 (In Revision) — Prettier &amp; Oxfmt integration

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
- `src/readme.js` reflects the chosen formatter in "Built With" + scripts.
- Quick Setup defaults: linter `eslint`, formatter `prettier`, `gitInit: true`.

> Note: the explicit `--quick-setup` / `-y` non-interactive flags described in
>
> the original plan are **not implemented**. The Quick Setup defaults are
>
> currently applied via the cached-config flow. See Future.

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

- `**.env.example` scaffolding** — copy a `.env.example` into generated projects.
- **Non-interactive flags** — `--quick-setup` / `-y` to apply defaults without

  prompting.
- **True headless e2e** — drive `bin/cli.js` through the prompts (current

  harnesses call `src/` directly, so they are integration tests, not CLI e2e).
- Expanded test coverage for additional option combinations.
- Implement Path Aliases

