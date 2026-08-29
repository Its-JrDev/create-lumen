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

async function scaffoldFetch(architecture, language) {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "lumen-api-client-fetch-"));
  await injectArchitecture(dir, TEMPLATES_DIR, architecture, language);
  await injectConditionals(dir, TEMPLATES_DIR, { ...AXIOS_RESPONSES, apiClient: "fetch" }, architecture, language);
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

    // The client is named api end to end (client export + barrel re-export).
    const clientRel =
      architecture === "component-based"
        ? `src/services/axios.client.${ext}`
        : `src/lib/axios/api.client.${ext}`;
    const barrelRel =
      architecture === "component-based"
        ? `src/services/index.${ext}`
        : `src/lib/axios/index.${ext}`;
    const client = await fsp.readFile(path.join(dir, clientRel), "utf8");
    assert.match(client, /const api = axios\.create\(/, "axios client is not named api");
    assert.match(client, /export default api;/, "axios client not default-exported as api");
    assert.doesNotMatch(client, /apiClient/, "apiClient leaked into axios client");
    const barrel = await fsp.readFile(path.join(dir, barrelRel), "utf8");
    assert.match(barrel, /export \{ default as api \} from "\.\/(axios\.client|api\.client)";/, "axios barrel does not re-export api");
    assert.doesNotMatch(barrel, /apiClient/, "apiClient leaked into axios barrel");
    const svcIndexRel =
      architecture === "component-based"
        ? `src/services/index.${ext}`
        : `src/features/home/services/index.${ext}`;
    const svcIndex = await fsp.readFile(path.join(dir, svcIndexRel), "utf8");
    assert.match(svcIndex, /export \{ userService \} from "\.\/user\.service";/, "axios services barrel missing userService");

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
      assert.match(service, /import api from "@\/services\/axios\.client";/, "comp user.service missing api import");
    } else {
      assert.match(service, /import \{ api \} from "@\/lib\/axios";/, "feat user.service missing api import");
    }
    assert.doesNotMatch(service, /apiClient/, "apiClient leaked into user.service");

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

  test(`fetch layer: ${architecture}/${language} ships config/client/user.service in the agreed layout`, async () => {
    const dir = await scaffoldFetch(architecture, language);
    const ext = language === "ts" ? "ts" : "js";

    const routes =
      architecture === "component-based"
        ? [
            `src/config/api.config.${ext}`,
            `src/services/api.client.${ext}`,
            `src/services/user.service.${ext}`,
            `src/services/index.${ext}`,
          ]
        : [
            `src/lib/api/api.config.${ext}`,
            `src/lib/api/api.client.${ext}`,
            `src/lib/api/index.${ext}`,
            `src/features/home/services/user.service.${ext}`,
            `src/features/home/services/index.${ext}`,
          ];
    for (const rel of routes) {
      assert.ok(await exists(path.join(dir, rel)), `${rel} missing`);
    }

    // Opposite-language twins must never leak into the scaffold.
    const opposite = language === "ts" ? "js" : "ts";
    for (const rel of routes) {
      const twin = rel.replace(`.${ext}`, `.${opposite}`);
      assert.ok(!(await exists(path.join(dir, twin))), `${twin} leaked into ${language} scaffold`);
    }

    // Old monolithic wrappers are gone.
    const oldMonolithic =
      architecture === "component-based"
        ? ["src/services/api.ts", "src/services/api.jsx"]
        : ["src/lib/api.ts", "src/lib/api.jsx", "src/lib/index.ts", "src/lib/index.js"];
    for (const rel of oldMonolithic) {
      assert.ok(!(await exists(path.join(dir, rel))), `old monolithic fetch file still present: ${rel}`);
    }

    // api.client exposes get/post/put/delete and is named api, not apiClient.
    const clientRel =
      architecture === "component-based"
        ? `src/services/api.client.${ext}`
        : `src/lib/api/api.client.${ext}`;
    const client = await fsp.readFile(path.join(dir, clientRel), "utf8");
    assert.match(client, /export default api;/, "fetch client is not default-exported as api");
    for (const method of ["get", "post", "put", "delete"]) {
      assert.ok(new RegExp(`${method}(?:<[^>]*>)?\\(`).test(client), `fetch client missing ${method}() method`);
    }
    assert.doesNotMatch(client, /apiClient/, "apiClient leaked into fetch client");

    // Barrels re-export api and userService.
    const barrelRel =
      architecture === "component-based"
        ? `src/services/index.${ext}`
        : `src/lib/api/index.${ext}`;
    const barrel = await fsp.readFile(path.join(dir, barrelRel), "utf8");
    assert.match(barrel, /export \{ default as api \} from "\.\/api\.client";/, "fetch barrel does not re-export api");
    assert.doesNotMatch(barrel, /apiClient/, "apiClient leaked into fetch barrel");
    const svcIndexRel =
      architecture === "component-based"
        ? `src/services/index.${ext}`
        : `src/features/home/services/index.${ext}`;
    const svcIndex = await fsp.readFile(path.join(dir, svcIndexRel), "utf8");
    assert.match(svcIndex, /export \{ userService \} from "\.\/user\.service";/, "fetch services barrel missing userService");

    await fsp.rm(dir, { recursive: true, force: true });
  });

  test(`fetch layer: ${architecture}/${language} user.service uses @/types + api methods (no fetch() direct)`, async () => {
    const dir = await scaffoldFetch(architecture, language);
    const languageExt = language === "ts" ? "ts" : "js";
    const serviceRel =
      architecture === "component-based"
        ? `src/services/user.service.${languageExt}`
        : `src/features/home/services/user.service.${languageExt}`;
    const service = await fsp.readFile(path.join(dir, serviceRel), "utf8");

    assert.match(service, /@\/types/, "user.service does not reference @/types");
    if (architecture === "component-based") {
      assert.match(service, /import api from "@\/services\/api\.client";/, "comp user.service missing api import");
    } else {
      assert.match(service, /import \{ api \} from "@\/lib\/api";/, "feat user.service missing api import");
    }
    for (const call of ["api.get", "api.post", "api.put", "api.delete"]) {
      assert.ok(service.includes(call), `user.service missing ${call} call`);
    }
    assert.doesNotMatch(service, /fetch\(/, "user.service calls fetch() directly");

    await fsp.rm(dir, { recursive: true, force: true });
  });

  test(`fetch layer: ${architecture}/${language} config inlines VITE_API_URL without config/constants`, async () => {
    const dir = await scaffoldFetch(architecture, language);
    const languageExt = language === "ts" ? "ts" : "js";
    const configRel =
      architecture === "component-based"
        ? `src/config/api.config.${languageExt}`
        : `src/lib/api/api.config.${languageExt}`;
    const config = await fsp.readFile(path.join(dir, configRel), "utf8");

    assert.match(config, /VITE_API_URL/, "config does not reference VITE_API_URL");
    assert.match(config, /timeout: 10000/, "config missing timeout");
    assert.doesNotMatch(config, /config\/constants/, "config still imports config/constants");

    await fsp.rm(dir, { recursive: true, force: true });
  });

  test(`fetch layer: ${architecture}/${language} never ships src/config/constants`, async () => {
    const dir = await scaffoldFetch(architecture, language);
    for (const name of ["constants.ts", "constants.js"]) {
      assert.ok(
        !(await exists(path.join(dir, "src", "config", name))),
        `src/config/${name} still present`
      );
    }
    await fsp.rm(dir, { recursive: true, force: true });
  });
}