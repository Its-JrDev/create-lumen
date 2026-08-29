import test from "node:test";
import assert from "node:assert/strict";
import { promises as fsp } from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { injectArchitecture, injectConditionals } from "../../src/injector.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, "../../templates");

const AXIOS_RESPONSES = {
  apiClient: "axios",
  stateManagement: "none",
  router: false,
  iconLibrary: "none",
  testing: "none",
  linter: "none",
  formatter: "none",
};

const COMBOS = [
  { architecture: "component-based", language: "ts" },
  { architecture: "component-based", language: "js" },
  { architecture: "feature-based", language: "ts" },
  { architecture: "feature-based", language: "js" },
];

const ROUTES = (architecture, ext) =>
  architecture === "component-based"
    ? [
        `src/config/axios.config.${ext}`,
        `src/services/axios.client.${ext}`,
        `src/services/user.service.${ext}`,
        `src/services/index.${ext}`,
      ]
    : [
        `src/lib/axios/api.config.${ext}`,
        `src/lib/axios/api.client.${ext}`,
        `src/lib/axios/index.${ext}`,
        `src/features/home/services/user.service.${ext}`,
        `src/features/home/services/index.${ext}`,
      ];

async function exists(p) {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

async function scaffold(architecture, language) {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "lumen-api-client-"));
  await injectArchitecture(dir, TEMPLATES_DIR, architecture, language);
  await injectConditionals(dir, TEMPLATES_DIR, AXIOS_RESPONSES, architecture, language);
  return dir;
}

for (const { architecture, language } of COMBOS) {
  test(`axios layer: ${architecture}/${language} ships config/client/user.service in the agreed layout`, async () => {
    const dir = await scaffold(architecture, language);
    const ext = language === "ts" ? "ts" : "js";

    for (const rel of ROUTES(architecture, ext)) {
      assert.ok(await exists(path.join(dir, rel)), `${rel} missing`);
    }

    // Opposite-language twins must never leak into the scaffold.
    const opposite = language === "ts" ? "js" : "ts";
    for (const rel of ROUTES(architecture, opposite)) {
      assert.ok(!(await exists(path.join(dir, rel))), `${rel} leaked into ${language} scaffold`);
    }

    // Old flat axios files are gone.
    const oldFlat =
      architecture === "component-based"
        ? ["src/services/axios.ts", "src/services/axios.jsx"]
        : ["src/lib/axios.ts", "src/lib/axios.jsx"];
    for (const rel of oldFlat) {
      assert.ok(!(await exists(path.join(dir, rel))), `old flat axios file still present: ${rel}`);
    }

    await fsp.rm(dir, { recursive: true, force: true });
  });

  test(`axios layer: ${architecture}/${language} user.service imports @/types + the client`, async () => {
    const dir = await scaffold(architecture, language);
    const languageExt = language === "ts" ? "ts" : "js";
    const serviceRel =
      architecture === "component-based"
        ? `src/services/user.service.${languageExt}`
        : `src/features/home/services/user.service.${languageExt}`;
    const service = await fsp.readFile(path.join(dir, serviceRel), "utf8");

    assert.match(service, /@\/types/, "user.service does not reference @/types");
    if (architecture === "component-based") {
      assert.match(service, /@\/services\/axios\.client/, "comp user.service missing client import");
    } else {
      assert.match(service, /@\/lib\/axios/, "feat user.service missing client import");
    }

    await fsp.rm(dir, { recursive: true, force: true });
  });

  test(`axios layer: ${architecture}/${language} config inlines VITE_API_URL without config/constants`, async () => {
    const dir = await scaffold(architecture, language);
    const languageExt = language === "ts" ? "ts" : "js";
    const configRel =
      architecture === "component-based"
        ? `src/config/axios.config.${languageExt}`
        : `src/lib/axios/api.config.${languageExt}`;
    const config = await fsp.readFile(path.join(dir, configRel), "utf8");

    assert.match(config, /VITE_API_URL/, "config does not reference VITE_API_URL");
    assert.doesNotMatch(config, /config\/constants/, "config still imports config/constants");

    await fsp.rm(dir, { recursive: true, force: true });
  });

  test(`axios layer: ${architecture}/${language} never ships src/config/constants`, async () => {
    const dir = await scaffold(architecture, language);
    for (const name of ["constants.ts", "constants.js"]) {
      assert.ok(
        !(await exists(path.join(dir, "src", "config", name))),
        `src/config/${name} still present`
      );
    }
    await fsp.rm(dir, { recursive: true, force: true });
  });
}