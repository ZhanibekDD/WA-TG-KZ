import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/stories/page.tsx", import.meta.url), "utf8");
const dock = await readFile(new URL("../components/jeli-stories-dock.tsx", import.meta.url), "utf8");
const model = await readFile(new URL("../lib/jeli-stories.ts", import.meta.url), "utf8");
const css = await readFile(new URL("../app/jeli-stories.css", import.meta.url), "utf8");
const messengerLock = await readFile(new URL("../app/jeli-messenger-lock.css", import.meta.url), "utf8");

test("Stories follows the Telegram-style interaction contract without fake backend claims", () => {
  for (const text of ["Моя история", "Близкие друзья", "Выбранные контакты", "6", "12", "24", "48", "Архив историй", "Ответить на историю", "Оставить в профиле"]) {
    assert.ok(page.includes(text) || model.includes(text) || dock.includes(text), `missing Stories contract text: ${text}`);
  }
  assert.match(page, /локальн/i);
  assert.doesNotMatch(page, /fetch\(|new WebSocket/);
});

test("Stories rail stays above Chats while viewer is full-screen and dark", () => {
  assert.match(dock, /jeli-stories-dock/);
  assert.match(dock, /readLocalStories/);
  assert.match(dock, /\/stories\?compose=1/);
  assert.match(css, /Telegram-like expandable strip over Chats/);
  assert.match(css, /\.tg-stories-viewer/);
  assert.match(css, /position:fixed;inset:0/);
  assert.match(css, /#0d171d|#070d11/);
  assert.doesNotMatch(css, /\.jeli-stories-header\{/);
  assert.match(model, /jeli:stories:v1/);
});

test("Stories rail never overlays an opened mobile conversation", () => {
  assert.match(messengerLock, /conversation-open-mobile/);
  assert.match(messengerLock, /\.jeli-stories-dock/);
  assert.match(messengerLock, /display:\s*none\s*!important/);
});

test("story privacy and duration types are explicit", () => {
  assert.match(model, /"everyone"\s*\|\s*"contacts"\s*\|\s*"close-friends"\s*\|\s*"selected"/);
  assert.match(model, /6\s*\|\s*12\s*\|\s*24\s*\|\s*48/);
});
