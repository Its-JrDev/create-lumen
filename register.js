import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src");

if (!globalThis.__lumenAliasRegistered) {
  globalThis.__lumenAliasRegistered = true;
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier.startsWith("@/")) {
        const resolvedPath = path.resolve(SRC_DIR, specifier.slice(2));
        return nextResolve(pathToFileURL(resolvedPath).href, context);
      }
      return nextResolve(specifier, context);
    },
  });
}
