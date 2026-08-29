# Roadmap

`create-lumen` is a CLI scaffolder for React + Vite projects with a
multi-framework trajectory: `v1.x` matures React/Vite, `v2.0.0`
brings Next.js, `v3.0.0` brings SvelteKit + a framework-agnostic
generation engine. Released versions are documented in
[`docs/CHANGELOG.md`](./CHANGELOG.md); this file tracks work in
progress, ideas under consideration, and the long-term vision.

This document follows the de facto community-standard structure: a
Current Milestone with checkable items, a Next Milestone placeholder,
a Future Explorations (Icebox) section, a Versioning Philosophy that
explains what justifies a major bump, and a Long-term Vision that
maps out the multi-framework trajectory.

---

## 🧭 Versioning Philosophy

This project follows [Semantic Versioning](https://semver.org/). The
guiding test for whether a change is breaking:

> **Can a user of the previous major version upgrade and keep using
> their existing configuration, CLI flags, and generated project
> without modifying anything?**

- **Yes** → `1.x` bump (current behavior preserved, additive only).
- **No** → `2.x+` bump (breaking change to config schema, CLI surface,
  template contract, or generator engine).

### What fits in `1.x` (additive, non-breaking)

- New optional prompts (a new linter, formatter, icon library,
  state-management option, CSS framework).
- New architectures (alongside the existing ones).
- New templates / overlays for an already-supported framework.
- New providers, hooks, contexts (the `providers/` consolidation
  pattern is stable; new providers are additive).
- New CSS framework support alongside the existing three.
- New API client (fetch, axios, …) as long as the existing two keep
  working unchanged.
- Generator-internal refactors that don't change the CLI surface,
  prompt flow, or file layout contract.

### What would force `2.0.0` or `3.0.0` (breaking)

- **Config schema break** — e.g. moving from a flat config
  (`{ framework: "react", css: "tailwind", architecture: "feature" }`)
  to a nested model
  (`{ framework: { name, variant }, styling: { engine }, … }`) because
  the flat form is no longer expressive enough.
- **CLI surface break** — removing `bin/cli.js create` flags without
  keeping a compatibility layer.
- **Template contract break** — e.g. deleting the
  `templates/architectures/` base trees in favor of
  framework-specific trees, or renaming `shared/` so generated
  projects need migration.
- **Generator engine break** — moving from "all options cross-product"
  to "framework → capabilities → compatible options → template
  composition" because the cross-product no longer covers a new
  framework's concepts (filesystem routing, server/client boundaries,
  adapters).

### Tag note

`v1.2.0` has not been tagged yet — `git tag -l` shows `v1.1.4` as the
latest. Status in `CHANGELOG.md` is `[Unreleased]`; status in the
current milestone below is 🚧 In Progress.

---

## 🎯 Current Milestone: v1.2.0

> **Status:** 🚧 In Progress · **Target:** v1.2.0

The next release consolidates the API layer, providers, router layout,
and CSS framework naming. Landed in this branch:

- [x] Drop feat `shared/{api,lib}` placeholders (`836f877`)
- [x] Router as a folder with split providers — feat per-area, comp centralized (`c7e729a`)
- [x] `providers/` consolidation + App wiring + CSS variables in components (`a952a74`)
- [x] CSS framework naming: `main.css` for vanilla, `globals.css` for tailwind/bootstrap + `themes.css` (`6f6e46c`)
- [x] Split ROADMAP / CHANGELOG (`docs/CHANGELOG.md` in Keep a Changelog 1.1.0 format)

Pending (work-in-progress commits referenced in `[Unreleased]`):

- [x] Framework-aware component styling + data-router parity (`08f70e4`)
- [x] Catch-up README + readme.js + leftover folder deletes (`4975780`)
- [x] Component-based types parity + generated typecheck script (`09da701`)
- [x] Axios as `api` (`8ec162c`, `be5a709`, `90fc13e`)
- [x] Fetch layer parity (`d229f8f`)
- [x] Feature-based `shared/` grouping + api-vs-lib rule (`6e6eda2`, `c36b616`)
- [x] Public feature barrel + removed unused barrels (`6e6eda2`)

## ⏩ Next Milestone: v1.3.0

> **Status:** ⚠️ Planned · **Target:** TBD

Items land here as v1.2.0 ships. None planned yet.

## 🔮 Future Explorations (Icebox)

> Items under consideration. No committed dates.

- [ ] **True headless e2e** — drive `bin/cli.js` through the prompts
  (current harnesses call `src/` directly, so they are integration
  tests, not CLI e2e).
- [ ] **Generated API resource services** — today `user.service` (per
  API client) is a hand-written example; add a generator that
  scaffolds a full CRUD service (`get`, `getById`, `create`,
  `update`, `delete`, …) for an API resource, wiring it to the
  shared `api` client with types from `shared/types`.
- [ ] **Expanded test coverage** — additional option combinations not
  yet covered by the offline matrix.
- [ ] **Next.js template bundle** — investigate which current options
  port cleanly (TypeScript/JavaScript, Tailwind, state, testing,
  linter) and which Next.js concepts are framework-specific
  (filesystem routing, server/client components, `next/font`, image
  optimization, API routes). Likely target: **v2.0.0** (breaking
  change to the config model — see Long-term Vision).
- [ ] **Svelte / SvelteKit template bundle** — SvelteKit's
  filesystem-based routing, `load` functions, server/client
  boundaries, and adapter model do not map onto the current
  cross-product option matrix. Likely target: **v3.0.0** (breaking
  change to the generator engine — see Long-term Vision).
- [ ] **Capabilities-based template composition** — replace the
  current "all options cross-product" matrix with a
  framework → capabilities → compatible options → template
  composition model. Required for v3.0.0; could land as an internal
  refactor under v1.x first.

---

## 🌅 Long-term Vision: Multi-Framework Era

The roadmap past v1.x has three horizons. Each horizon adds a
framework or engine capability; the major bump is reserved for the
moments the contract has to change, not for the framework itself.

### `v1.x` — React/Vite scaffolder (mature)

The scaffolder is a feature-complete React + Vite generator with a
rich option matrix (~11,600 cells). New minor versions add
capabilities without breaking existing configs. Examples of v1.x
work already in motion or planned:

- `v1.3.0` — first post-CSS-naming stable release.
- `v1.4.0` — additional React/Vite templates, providers, test
  runners.
- `v1.5.0` — expanded offline matrix coverage.

### `v2.0.0` — Next.js support (BREAKING)

Adds Next.js as a supported framework alongside React/Vite.

**Breaking**: the flat config
`{ framework: "react", css: "tailwind", architecture: "feature" }`
becomes a nested model
`{ framework: { name: "react" | "next", variant?: "app-router" | "pages-router" }, styling: { engine: "tailwind" }, architecture: { type: "feature" } }`,
because Next.js's App Router vs Pages Router distinction and its
framework-specific concepts (filesystem routing, `next/font`,
`next/image`, route handlers) cannot be expressed by the flat schema
without losing meaning.

### `v3.0.0` — SvelteKit + multi-framework engine (BREAKING)

Adds Svelte (SvelteKit) as a third supported framework and reframes
the generator around a framework-agnostic core.

**Breaking**: the current cross-product option matrix
(framework × language × architecture × CSS × state × API × router ×
testing × linter × formatter × icons ≈ 11,600 cells) becomes a
**framework → capabilities → compatible options → template
composition** model, because SvelteKit has framework-native concepts
that the cross-product cannot encode cleanly (filesystem routing,
`load` functions, server/client boundaries, adapter model, form
actions). Adapters themselves (Node, Vercel, Cloudflare, static)
become first-class options at this level.

### Why not `2.0.0 = Next.js` and `3.0.0 = SvelteKit` standalone?

A framework can land in a `1.x` bump if it doesn't break the contract
(it just adds a new value to an existing option). The major bump is
reserved for the structural shift the new framework forces — not for
the framework itself. If a future framework can be integrated without
breaking the schema, it should land in `1.x` to honor SemVer.
