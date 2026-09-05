import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/bots/page.tsx", import.meta.url), "utf8");
const docs = await readFile(new URL("../docs/BOT_PLATFORM.md", import.meta.url), "utf8");

test("JELI Bot Studio exposes the BotFather-class foundation", () => {
  for (const text of ["Создайте чат-бота", "API token", "Webhook", "Mini App", "Разрешения", "@JELIBot", "JELI Bot Platform"]) {
    assert.ok(page.includes(text));
  }
  assert.match(page, /jeli_demo_/);
  assert.match(page, /crypto\.randomUUID/);
  assert.doesNotMatch(page, /@QazynaBot|qz_demo_/);
});

test("Bot Studio does not pretend local tokens are production credentials", () => {
  assert.match(page, /локальный тестовый/i);
  assert.match(page, /не работает в сети/i);
  assert.match(page, /Боевые токены будут выпускаться только сервером/i);
  assert.doesNotMatch(page, /fetch\(|new WebSocket|localStorage/);
});

test("bot platform roadmap includes production security and vertical slices", () => {
  for (const text of ["token rotation", "signed requests", "replay protection", "Mini Apps", "AI bots", "No-code automation", "Platform slice 1 — real bot"]) {
    assert.ok(docs.includes(text));
  }
});
