import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const manifest = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));

test("Qazyna manifest uses the independent brand palette", () => {
  assert.equal(manifest.theme_color, "#5b5bd6");
  assert.equal(manifest.background_color, "#f4f4f8");
});

test("Bot Studio is discoverable as a Qazyna app shortcut", () => {
  assert.ok(Array.isArray(manifest.shortcuts));
  const bots = manifest.shortcuts.find(shortcut => shortcut.url === "/bots");
  assert.ok(bots);
  assert.equal(bots.name, "Bot Studio");
});
