# Roadmap

`create-lumen` is a CLI scaffolder for React + Vite projects. Released
versions are documented in [`docs/CHANGELOG.md`](./CHANGELOG.md); this
file tracks ideas being considered for future work.

This document follows the de facto community-standard structure: a
Current Milestone with checkable items, a Next Milestone placeholder,
and a Future Explorations (Icebox) section for ideas without committed
dates.

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

- [ ] **True headless e2e** — drive `bin/cli.js` through the prompts (current harnesses call `src/` directly, so they are integration tests, not CLI e2e).
- [ ] **Generated API resource services** — today `user.service` (per API client) is a hand-written example; add a generator that scaffolds a full CRUD service (`get`, `getById`, `create`, `update`, `delete`, …) for an API resource, wiring it to the shared `api` client with types from `shared/types`.
- [ ] **Expanded test coverage** — additional option combinations not yet covered by the offline matrix.
