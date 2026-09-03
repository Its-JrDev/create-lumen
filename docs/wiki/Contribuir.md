# Contribuir

¡Gracias por querer contribuir a `create-lumen`!

## Flujo sugerido

1. Haz fork o crea una rama de trabajo.
2. Implementa cambios pequeños y enfocados.
3. Ejecuta pruebas antes de abrir PR.
4. Abre un Pull Request con contexto claro.

## Desarrollo local

```bash
npm install
node bin/cli.js
```

## Pruebas

```bash
npm test
```

Pruebas adicionales útiles (según el objetivo del cambio):

```bash
node --import ./register.js tests/smoke/install.mjs
node --import ./register.js tests/e2e/exhaustive.mjs
```

## Buenas prácticas

- Evita cambios no relacionados en el mismo PR.
- Mantén compatibilidad con Node.js >= 18.
- Si agregas una feature, actualiza documentación relevante (`README` y/o wiki).

## Placeholder de políticas del proyecto

> TODO: agregar convención oficial de ramas, formato de commits y criterios de aceptación si el equipo define una guía formal.
