import { writeFileRecursive } from "@/utils/fs.js";
import path from "path";

function buildBuiltWith(responses) {
  const items = ["[React](https://reactjs.org/) + [Vite](https://vitejs.dev/)"];

  if (responses.language === "ts") {
    items.push("[TypeScript](https://www.typescriptlang.org/)");
  }

  if (responses.cssFramework === "tailwind") {
    items.push("[Tailwind CSS](https://tailwindcss.com/)");
  } else if (responses.cssFramework === "bootstrap") {
    items.push("[Bootstrap](https://getbootstrap.com/)");
  }

  if (responses.router) {
    items.push("[React Router](https://reactrouter.com/)");
  }

  if (responses.stateManagement === "redux") {
    items.push("[Redux Toolkit](https://redux-toolkit.js.org/)");
  } else if (responses.stateManagement === "zustand") {
    items.push("[Zustand](https://zustand-demo.pmnd.rs/)");
  }

  if (responses.iconLibrary === "lucide") {
    items.push("[Lucide Icons](https://lucide.dev/)");
  } else if (responses.iconLibrary === "huge") {
    items.push("[Huge Icons](https://hugeicons.com/)");
  }

  if (responses.apiClient === "axios") {
    items.push("[Axios](https://axios-http.com/)");
  } else if (responses.apiClient === "fetch") {
    items.push("Fetch API");
  }

  if (responses.testing === "vitest") {
    items.push("[Vitest](https://vitest.dev/)");
  } else if (responses.testing === "jest") {
    items.push("[Jest](https://jestjs.io/)");
  }

  if (responses.linter === "eslint") {
    items.push("[ESLint](https://eslint.org/)");
  } else if (responses.linter === "oxlint") {
    items.push("[Oxlint](https://oxc.rs/)");
  }

  if (responses.formatter === "prettier") {
    items.push("[Prettier](https://prettier.io/)");
  } else if (responses.formatter === "oxfmt") {
    items.push("[Oxfmt](https://oxc.rs/)");
  }

  return items.map((item) => `- ${item}`).join("\n");
}

function buildScripts(responses) {
  const rows = [
    "| `npm run dev` | Start development server |",
    "| `npm run build` | Build for production |",
    "| `npm run preview` | Preview production build |",
  ];

  if (responses.testing !== "none") {
    rows.push("| `npm run test` | Run tests |");
  }

  if (responses.linter === "eslint") {
    rows.push("| `npm run lint` | Run ESLint |");
    rows.push("| `npm run lint:fix` | Run ESLint with auto-fix |");
  } else if (responses.linter === "oxlint") {
    rows.push("| `npm run lint` | Run Oxlint |");
  }

  if (responses.formatter === "prettier" || responses.formatter === "oxfmt") {
    rows.push("| `npm run format` | Format code |");
    rows.push("| `npm run format:check` | Verify code is formatted |");
  }

  if (responses.language === "ts") {
    rows.push("| `npm run typecheck` | Type-check the project (tsc -b) |");
  }

  return rows.join("\n");
}

function buildProjectStructure(architecture) {
  if (architecture === "feature-based") {
    return `src/
├── app/          # App shell and global providers
├── features/     # Feature modules (pages, hooks, api, types)
│   └── home/     # Example feature (components, services, types, store)
└── shared/       # Reusable, business-agnostic resources
    ├── api/      # HTTP client (fetch) — not an external dependency
    ├── components/ # Shared UI components
    ├── hooks/    # Shared custom hooks
    ├── layouts/  # High-level layout wrappers
    ├── lib/      # Third-party library init (axios client)
    ├── stores/   # Global state stores
    ├── styles/   # Global styles
    ├── types/    # Global type definitions
    └── utils/    # Pure utility functions`;
  }

  return `src/
├── components/   # Reusable UI components (common, form)
├── config/       # Route definitions
├── context/      # React context providers
├── hooks/        # Shared custom hooks
├── layouts/      # Page layout wrappers
├── pages/        # Page-level components
├── routes/       # Route definitions
├── services/     # API service layer
├── store/        # State store
├── styles/       # Global styles
├── types/        # TypeScript type definitions
└── utils/        # Utility functions`;
}

function buildLicense() {
  const year = new Date().getFullYear();
  return `MIT License

Copyright (c) ${year}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

function buildDescription(projectName, responses) {
  const tools = [];
  if (responses.linter === "eslint") tools.push("ESLint");
  else if (responses.linter === "oxlint") tools.push("Oxlint");
  if (responses.formatter === "prettier") tools.push("Prettier");
  else if (responses.formatter === "oxfmt") tools.push("Oxfmt");

  let suffix = "";
  if (tools.length > 0) {
    suffix = `\n\nThis project is set up with ${tools.join(" + ")} for code quality.`;
  }
  return `# ${projectName}\n\nA React + Vite application built with ${responses.architecture}.${suffix}`;
}

function buildReadme(projectName, responses) {
  const builtWith = buildBuiltWith(responses);
  const scripts = buildScripts(responses);
  const structure = buildProjectStructure(responses.architecture);

  return `${buildDescription(projectName, responses)}

## Built With

${builtWith}

## Getting Started

\`\`\`sh
npm install
npm run dev
\`\`\`

## Scripts

| Script | Description |
|--------|-------------|
${scripts}

## Project Structure

<!-- TODO: Update this to match your actual structure -->

\`\`\`
${structure}
\`\`\`

## Authors

- **Your Name** - [@your_twitter](https://twitter.com/your_twitter) - your@email.com

See also the list of [contributors](https://github.com/your_username/${projectName}/graphs/contributors) who participated in this project.

## License

Distributed under the MIT License. See \`LICENSE\` for more information.
`;
}

export async function generateReadme(projectPath, projectName, responses) {
  const readmeContent = buildReadme(projectName, responses);
  const licenseContent = buildLicense();

  await writeFileRecursive(path.join(projectPath, "README.md"), readmeContent);
  await writeFileRecursive(path.join(projectPath, "LICENSE"), licenseContent);
}
