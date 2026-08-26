import { writeFileRecursive } from "./utils/fs.js";
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

  if (responses.axios) {
    items.push("[Axios](https://axios-http.com/)");
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

  return rows.join("\n");
}

function buildProjectStructure(architecture) {
  if (architecture === "feature-based") {
    return `src/
├── app/          # App shell and providers
├── components/   # Shared UI components
├── config/       # Constants and configuration
├── features/     # Feature modules (pages, hooks, api)
├── hooks/        # Shared custom hooks
├── stores/       # Global state stores
├── types/        # TypeScript type definitions
└── utils/        # Utility functions`;
  }

  return `src/
├── components/   # Reusable UI components (common, form, layout)
├── config/       # Constants and route definitions
├── context/      # React context providers
├── hooks/        # Shared custom hooks
├── layouts/      # Page layout wrappers
├── pages/        # Page-level components
├── routes/       # Route definitions
├── services/     # API service layer
├── store/        # State store
├── styles/       # Global styles
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

function buildReadme(projectName, responses) {
  const builtWith = buildBuiltWith(responses);
  const scripts = buildScripts(responses);
  const structure = buildProjectStructure(responses.architecture);

  return `# ${projectName}

<!-- TODO: Add a short description of your project -->

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
