# create-lumen

Scaffold a React + Vite project with your choice of **feature-based** or **component-based** architecture.

```bash
npm create lumen
```

## What it does

Creates a production-ready React + Vite project with:

- **Architecture choice** — feature-based (domain-driven) or component-based (grouped by type)
- **TypeScript or JavaScript**
- **CSS framework** — Tailwind CSS, Bootstrap, or vanilla CSS
- **State management** — Zustand, Redux Toolkit, or none
- **React Router** — client-side routing (optional)
- **Testing** — Vitest or Jest (optional)
- **Linter** — ESLint (default) or Oxlint
- **Icon library** — Lucide React, Huge Icons, or none
- **Axios** — pre-configured HTTP client (optional)
- **README + LICENSE** — auto-generated (MIT)
- **Git init** — auto-initialize a git repo
- **Path alias** — `@/` imports configured out of the box

Your choices are cached and used as defaults next time.

## Quick start

### From npm (recommended)

```bash
npm create lumen my-app
cd my-app
npm run dev
```

### From this repo

```bash
git clone https://github.com/your_username/create-lumen.git
cd create-lumen
npm install
npm link
npx create-lumen my-app
cd my-app
npm run dev
```

### Quick setup defaults

TypeScript · Tailwind CSS · Feature-based · Router · ESLint · Vitest

## Architecture

### Feature-based

Organized by domain. Each feature is self-contained:

```
src/
├── app/              # App root
├── features/
│   └── home/
│       ├── pages/
│       ├── components/
│       └── services/
├── layouts/
├── pages/
├── routes/
├── store/
├── hooks/
└── utils/
```

Scaffold new features instantly:

```bash
npm run create:feature auth
```

### Component-based

Organized by type. Components grouped by their role:

```
src/
├── components/
│   ├── common/       # Shared, reusable
│   ├── form/         # Form elements
│   └── layout/       # Layout primitives
├── pages/
├── layouts/
├── routes/
├── store/
├── hooks/
└── utils/
```

## Path alias

All projects use the `@/` path alias:

```tsx
import { Button } from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";
```

## Requirements

- Node.js >= 18

## License

MIT
