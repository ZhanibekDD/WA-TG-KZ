import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const manifest = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));

test("manifest uses the final blended teal palette", () => {
  assert.equal(manifest.theme_color, "#18b5ad");
  assert.equal(manifest.background_color, "#f1f8f7");
});

test("Bot Studio is discoverable as a platform app shortcut", () => {
  assert.ok(Array.isArray(manifest.shortcuts));
  const bots = manifest.shortcuts.find(shortcut => shortcut.url === "/bots");
  assert.ok(bots);
  assert.equal(bots.name, "Bot Studio");
});