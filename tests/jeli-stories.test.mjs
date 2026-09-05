import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/stories/page.tsx", import.meta.url), "utf8");
const dock = await readFile(new URL("../components/jeli-stories-dock.tsx", import.meta.url), "utf8");
const model = await readFile(new URL("../lib/jeli-stories.ts", import.meta.url), "utf8");
const css = await readFile(new URL("../app/jeli-stories.css", import.meta.url), "utf8");

test("Stories follows the Telegram-style interaction contract without fake backend claims", () => {
  for (const text of ["Моя история", "Близкие друзья", "Выбранные контакты", "6", "12", "24", "48", "Архив историй", "Ответить на историю", "Оставить в профиле"]) {
    assert.ok(page.includes(text) || model.includes(text));
  }
  assert.match(page, /локальн/i);
  assert.doesNotMatch(page, /fetch\(|new WebSocket/);
});

test("Stories are mounted above chats and use shared local model", () => {
  assert.match(dock, /jeli-stories-dock/);
  assert.match(dock, /readLocalStories/);
  assert.match(dock, /\/stories\?compose=1/);
  assert.match(css, /Telegram-style rail/);
  assert.match(model, /jeli:stories:v1/);
});

test("story privacy and duration types are explicit", () => {
  assert.match(model, /"everyone"\s*\|\s*"contacts"\s*\|\s*"close-friends"\s*\|\s*"selected"/);
  assert.match(model, /6\s*\|\s*12\s*\|\s*24\s*\|\s*48/);
});
