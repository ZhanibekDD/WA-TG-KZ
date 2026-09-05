import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const parity = await readFile(new URL("../app/whatsapp-parity.css", import.meta.url), "utf8");
const lock = await readFile(new URL("../app/whatsapp-lock.css", import.meta.url), "utf8");

test("mobile chats preserve the current WhatsApp information zones", () => {
  for (const view of ["chats", "updates", "communities", "calls"]) {
    assert.ok(page.includes(`id: "${view}"`));
  }
  assert.match(page, /\["all", "unread", "groups"\]/);
  assert.match(page, /Camera/);
  assert.match(page, /MessageSquarePlus/);
  assert.match(parity, /grid-template-columns: repeat\(4/);
  assert.match(parity, /\.new-chat-fab/);
  assert.match(parity, /\.composer-form \.camera-button/);
});

test("parity lock prevents known visual regressions", () => {
  assert.match(lock, /\.title-row\.normal-title\s*\{\s*display: none;/s);
  assert.match(lock, /\.setting-section \+ \.setting-section\s*\{\s*display: none;/s);
  assert.match(lock, /\.chat-list-search\.mobile-search-collapsed\s*\{\s*display: flex;/s);
  assert.match(lock, /inbox-header:has\(\.chats-main-title\)/);
  assert.match(lock, /messenger-shell\[data-accent="blue"\]/);
});

test("visual parity still does not claim unavailable network features", () => {
  assert.doesNotMatch(page, /new WebSocket|navigator\.mediaDevices|getUserMedia|localStorage/);
  assert.match(page, /aria-label=\{t\.noDelivery\}/);
});
