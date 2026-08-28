export const axes = {
  architecture: ["feature-based", "component-based"],
  language: ["ts", "js"],
  cssFramework: ["tailwind", "bootstrap", "none"],
  testing: ["vitest", "jest", "none"],
  router: [true, false],
  stateManagement: ["none", "redux", "zustand"],
  iconLibrary: ["none", "lucide", "huge"],
  apiClient: ["none", "axios", "fetch"],
  linter: ["none", "eslint", "oxlint"],
};

export const formatterFor = (linter) =>
  linter === "none"
    ? ["none"]
    : linter === "eslint"
    ? ["none", "prettier"]
    : ["none", "oxfmt", "prettier"];

// Cartesian product over the 9 axes, then expand formatter per linter.
export function* matrix() {
  const keys = Object.keys(axes);
  function* rec(i, acc) {
    if (i === keys.length) {
      for (const formatter of formatterFor(acc.linter)) {
        yield { ...acc, formatter };
      }
      return;
    }
    const k = keys[i];
    for (const v of axes[k]) {
      yield* rec(i + 1, { ...acc, [k]: v });
    }
  }
  yield* rec(0, {});
}

// Curated sample that touches every template surface: both architectures,
// both languages, all three CSS frameworks, all three testing setups, every
// state mgmt strategy, every icon/api client, every linter, every formatter.
export const DEFAULT_CELLS = [
  { architecture: "feature-based", language: "ts", cssFramework: "tailwind", testing: "vitest", router: true, stateManagement: "none", iconLibrary: "none", apiClient: "none", linter: "eslint", formatter: "prettier" },
  { architecture: "feature-based", language: "ts", cssFramework: "tailwind", testing: "vitest", router: true, stateManagement: "none", iconLibrary: "none", apiClient: "none", linter: "oxlint", formatter: "oxfmt" },
  { architecture: "feature-based", language: "js", cssFramework: "none", testing: "vitest", router: true, stateManagement: "zustand", iconLibrary: "lucide", apiClient: "axios", linter: "eslint", formatter: "prettier" },
  { architecture: "component-based", language: "js", cssFramework: "bootstrap", testing: "jest", router: true, stateManagement: "redux", iconLibrary: "huge", apiClient: "fetch", linter: "eslint", formatter: "prettier" },
  { architecture: "feature-based", language: "ts", cssFramework: "tailwind", testing: "none", router: false, stateManagement: "redux", iconLibrary: "none", apiClient: "none", linter: "oxlint", formatter: "prettier" },
  { architecture: "feature-based", language: "ts", cssFramework: "none", testing: "none", router: false, stateManagement: "none", iconLibrary: "none", apiClient: "none", linter: "eslint", formatter: "none" },
  { architecture: "component-based", language: "js", cssFramework: "none", testing: "none", router: false, stateManagement: "none", iconLibrary: "none", apiClient: "none", linter: "oxlint", formatter: "oxfmt" },
  { architecture: "feature-based", language: "ts", cssFramework: "bootstrap", testing: "jest", router: true, stateManagement: "none", iconLibrary: "huge", apiClient: "fetch", linter: "oxlint", formatter: "none" },
  { architecture: "component-based", language: "ts", cssFramework: "tailwind", testing: "vitest", router: true, stateManagement: "redux", iconLibrary: "lucide", apiClient: "axios", linter: "eslint", formatter: "none" },
];

// A dedicated subgroup: the "feature parity" cells — same cell under both
// formatter toolchains, which is what the cross-tool probe validates.
export const PARITY_CELLS = (base) =>
  ["prettier", "oxfmt"].map((formatter) => ({ ...base, formatter }));