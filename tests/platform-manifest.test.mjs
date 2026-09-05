import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const manifest = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));

test("JELI manifest uses the final blended teal palette and icon", () => {
  assert.equal(manifest.name, "JELI — мессенджер и платформа");
  assert.equal(manifest.short_name, "JELI");
  assert.equal(manifest.theme_color, "#18b5ad");
  assert.equal(manifest.background_color, "#f1f8f7");
  assert.equal(manifest.icons[0].src, "/jeli-icon.svg");
  assert.equal(manifest.icons[0].type, "image/svg+xml");
});

test("Stories remain a shortcut while bot creation stays inside BotJeli chat", () => {
  assert.ok(Array.isArray(manifest.shortcuts));
  const stories = manifest.shortcuts.find(shortcut => shortcut.url === "/stories");
  const bots = manifest.shortcuts.find(shortcut => shortcut.url === "/bots");
  assert.ok(stories);
  assert.equal(stories.name, "Stories");
  assert.equal(bots, undefined);
});
