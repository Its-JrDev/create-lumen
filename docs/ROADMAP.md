# Future Implementations & Roadmap

This document outlines the development plan and structural changes for the upcoming CLI tool versions.

---

## 📦 Version 1.2.0: Prettier & Oxfmt Integration

This update introduces dynamic code formatter support (`Prettier` and `Oxfmt`) based on the linter chosen by the user. This improves performance and overall developer experience.

### Dynamic Prompt Flow

The CLI will adapt its questions dynamically depending on the user's previous choices:

1. **Linter Selection:**
   ```text
   ? Which linter do you want to use?
    ❯ ESLint
      Oxlint
      None
   ```

2. **Formatter Selection (Conditional):**
   * **If ESLint is chosen:**
     ```text
     ? Which formatter do you want to use?
      ❯ None
        Prettier
     ```
   * **If Oxlint is chosen:**
     ```text
     ? Which formatter do you want to use?
      ❯ None
        Oxfmt (Recommended)    ← native Ox ecosystem, 30x faster
        Prettier
     ```

---

### Dependency Matrix

| Linter | Formatter | `devDependencies` to Install |
| :--- | :--- | :--- |
| **ESLint** | Prettier | `prettier`, `eslint-config-prettier` |
| **Oxlint** | Oxfmt | `oxfmt` |
| **Oxlint** | Prettier | `prettier` |
| **None** | — | None |

---

### Default Configuration Files

#### Oxfmt Configuration (`.oxfmtrc.json`)
```json
{
  "\$schema": "./node_modules/oxfmt/configuration_schema.json",
  "printWidth": 80,
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all"
}
```

#### Prettier Configuration (`.prettierrc`)
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

### Files to Modify / Create

| File | Change Type | Description |
| :--- | :--- | :--- |
| `src/prompts.js` | Modify | Dynamic formatter select + format configs + response mapping. |
| `src/dependencies.js` | Modify | Installation logic for `prettier`, `eslint-config-prettier`, and `oxfmt`. |
| `src/injector.js` | Modify | Create `injectFormatter()` function — copies config templates and appends scripts to `package.json`. |
| `src/readme.js` | Modify | Update "Built With" section and append specific commands/scripts for each formatter. |
| `templates/conditional/formatter/prettier/.prettierrc` | **New** | Base Prettier configuration template file. |
| `templates/conditional/formatter/oxfmt/.oxfmtrc.json` | **New** | Base Oxfmt configuration template file. |
| `package.json` | Modify | Update version bump from `1.1.0` ➡️ `1.2.0`. |
| `bin/cli.js` | Modify | Update CLI banner/version from `v1.1.0` ➡️ `v1.2.0`. |

---

### ⚡ Quick Setup Defaults

When running the fast track command flags (e.g., `--quick-setup` or `-y`), the CLI applies these default configurations automatically without prompting the user:

* **Linter:** `eslint`
* **Formatter:** `prettier`
* **Git Repository:** `true` (Git initialization enabled by default)
