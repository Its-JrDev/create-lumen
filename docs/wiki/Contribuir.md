# Contributing / Contribuir

## English

Thanks for contributing to `create-lumen`.

### Suggested flow

1. Create a branch.
2. Keep changes focused.
3. Run tests before opening a PR.
4. Open a PR with clear context.

### Local development

```bash
npm install
node bin/cli.js
```

### Tests

```bash
npm test
```

Optional extra checks:

```bash
node --import ./register.js tests/smoke/install.mjs
node --import ./register.js tests/e2e/exhaustive.mjs
```

> TODO: add official branch, commit, and review policy if the team defines one.

---

## Español

Gracias por contribuir a `create-lumen`.

### Flujo sugerido

1. Crea una rama.
2. Mantén cambios enfocados.
3. Ejecuta pruebas antes de abrir PR.
4. Abre un PR con contexto claro.

### Desarrollo local

```bash
npm install
node bin/cli.js
```

### Pruebas

```bash
npm test
```

Verificaciones adicionales opcionales:

```bash
node --import ./register.js tests/smoke/install.mjs
node --import ./register.js tests/e2e/exhaustive.mjs
```

> TODO: agregar política oficial de ramas, commits y revisión si el equipo la define.
