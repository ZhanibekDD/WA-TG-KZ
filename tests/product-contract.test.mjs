import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const manifest = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));

test("ships the four core product surfaces", () => {
  for (const view of ["feed", "chats", "communities", "services"]) {
    assert.match(page, new RegExp(`\\"${view}\\"`));
  }
});

test("keeps Kazakh and Russian interface copy", () => {
  assert.match(page, /Басты бет/);
  assert.match(page, /Главная/);
  assert.match(page, /Қазақстанда жасалған/);
});

test("publishes an installable standalone PWA manifest", () => {
  assert.equal(manifest.short_name, "Qazyna");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.ok(manifest.icons.length > 0);
});
