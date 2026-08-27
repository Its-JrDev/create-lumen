import test from "node:test";
import assert from "node:assert/strict";
import { getPkgManager } from "../../src/utils/pkg-manager.js";

function withUserAgent(value, fn) {
  const prev = process.env.npm_config_user_agent;
  if (value === undefined) delete process.env.npm_config_user_agent;
  else process.env.npm_config_user_agent = value;
  try {
    return fn();
  } finally {
    if (prev === undefined) delete process.env.npm_config_user_agent;
    else process.env.npm_config_user_agent = prev;
  }
}

test("detects yarn from the user agent", () => {
  assert.equal(
    withUserAgent("yarn/1.22.22 npm/? node/v20", () => getPkgManager()),
    "yarn"
  );
});

test("detects pnpm from the user agent-provided agent string", () => {
  assert.equal(
    withUserAgent("pnpm/9.0.0 npm/? node/v20", () => getPkgManager()),
    "pnpm"
  );
});

test("detects bun from the user agent", () => {
  assert.equal(
    withUserAgent("bun/1.1.0", () => getPkgManager()),
    "bun"
  );
});

test("falls back to npm for npm or unknown agents", () => {
  assert.equal(
    withUserAgent("npm/10.0.0 node/v20", () => getPkgManager()),
    "npm"
  );
  assert.equal(withUserAgent(undefined, () => getPkgManager()), "npm");
});
