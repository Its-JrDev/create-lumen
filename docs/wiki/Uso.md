# Uso

## Comando base

```bash
npm create lumen <nombre-del-proyecto>
```

Ejemplo:

```bash
npm create lumen mi-app
```

## Qué hace el CLI

Durante la generación, el comando permite elegir opciones de proyecto (arquitectura, lenguaje y otras integraciones opcionales).

Luego crea la estructura inicial del proyecto en la carpeta indicada.

## Ejecutar la app generada

```bash
cd mi-app
npm run dev
```

## Consejos

- Usa nombres de carpeta simples (sin espacios) para evitar problemas en scripts.
- Si automatizas el scaffolding en CI o scripts internos, valida primero con una generación local.
- Si necesitas un flujo 100% no interactivo, usa `-y` como punto de partida y ajusta según las capacidades actuales del CLI.

## Placeholder para uso avanzado

> TODO: añadir ejemplos avanzados confirmados por el equipo (flags soportados, combinaciones recomendadas, presets internos).
