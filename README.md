# create-lumen

A scaffolder that generates production-ready React + Vite projects (feature-based or component-based).

Note: this repository is the CLI scaffolder itself, not a generated app. Generated projects live in the target folder you create.

## Quick usage

From npm (recommended):

```bash
npm create lumen my-app
cd my-app
npm run dev
```

Non-interactive Quick Setup (TypeScript + Tailwind + Feature-based + Router + ESLint + Prettier + Vitest), no prompts:

```bash
npm create lumen my-app -- -y
# or
npm create lumen -- -y my-app
```

The CLI ignores flag arguments when resolving the project name, so `-y` can appear before or after the app name without being mistaken for the folder name.

Run the scaffolder locally (development / testing the generator):

```bash
node bin/cli.js           # run interactively
npm install
npm link                 # install globally for testing
create-lumen my-app      # after npm link
```

## Features

- Architecture choice: feature-based or component-based
- TypeScript or JavaScript output
- CSS frameworks: Tailwind, Bootstrap, or none
- Optional state management: Zustand or Redux Toolkit
- Optional router (React Router)
- Optional testing: Vitest or Jest
- Linting: ESLint (default) or Oxlint
- Code formatter: Prettier or Oxfmt (chosen after the linter; `eslint-config-prettier` is auto-wired for the ESLint + Prettier combo)
- Optional Axios setup and icon libraries
- Auto `git init`, generated `README` (with a project description reflecting the chosen tooling) and `LICENSE`
- `.env.example` scaffolded, and the generated `.gitignore` excludes env files (`.env`, `.env.*`) while keeping `.env.example`
- `@/` path alias configured (`tsconfig`/`jsconfig` + Vite)

Your selected options are cached and offered as defaults on subsequent runs.

## Developing the scaffolder

- Entry point: `bin/cli.js` → `src/main.js` (ESM-only)
- Templates: `templates/` (architectures + conditional overlays)
- Injector copies architecture, then overlays conditionals based on choices
- Config cache: `~/.lumen-config.json` stores previous choices
- This tool uses Node >= 18 and `execa` for subprocesses

Run locally (interactive):

```bash
node bin/cli.js
```

Install globally for testing:

```bash
npm link
create-lumen my-app
```

## Testing the scaffolder

The CLI repo has no app-level test suite, but `npm test` runs the unit tests under `tests/unit/` plus the offline smoke tests under `tests/smoke/`, and two harnesses in `tests/e2e/` and `tests/smoke/` drive the real generator against generated scaffolds. See `docs/tests/README.md` (and `harness.md`) for details, scope, and what they verify.

```bash
npm test                                    # unit (tests/unit/) + offline smoke (tests/smoke/generate.test.mjs)
node --import ./register.js tests/smoke/install.mjs  # real-install smoke (Quick Setup default; needs network)
node --import ./register.js tests/e2e/exhaustive.mjs # full option matrix (~11,664 combos, local-only; ~13 min). Use LIMIT=n.
```

## Project structure (generated app examples)

Feature-based (example):

```
src/
├── app               # App shell and global providers
│   ├── App.tsx
│   ├── providers
│   │   └── ThemeProvider.tsx
│   └── router.tsx
├── features           # Feature modules (business logic owned per feature)
│   └── home
│       ├── components
│       ├── hooks
│       ├── index.ts    # public feature barrel
│       ├── layouts
│       ├── pages
│       ├── services
│       ├── store
│       └── types
└── shared             # Reusable, business-agnostic resources
    ├── api            # HTTP client (fetch) — not an external dependency
    ├── components
    │   └── ui
    ├── hooks
    ├── layouts
    ├── lib            # Third-party library init (e.g. axios client)
    ├── stores
    ├── styles
    │   └── globals.css
    ├── types
    └── utils
```

Component-based (example):

```
src/
├── App.tsx
├── components
│   ├── common
│   ├── form
│   └── layout
├── config
│   ├── constants.ts
│   └── routes.ts
├── context
├── hooks
├── index.css
├── layouts
├── main.tsx
├── pages
├── routes
├── services
├── store
├── styles
├── test
└── utils
```

## Roadmap

See `docs/ROADMAP.md` for planned features and upcoming releases.

## Requirements

- Node.js >= 18

## Acknowledgements

This project is based on [create-vrtw](https://github.com/Avijit07x/create-vrtw) by [@Avijit07x](https://github.com/Avijit07x). Thank you for the original work that inspired this scaffolder.

## License

MIT
