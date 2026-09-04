import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { messengerCopy } from "../lib/messenger-copy.ts";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const manifest = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));

test("messenger-first navigation replaces the feed and service catalog", () => {
  assert.match(page, /useState<View>\("chats"\)/);
  for (const view of ["chats", "updates", "calls", "settings"]) assert.ok(page.includes('id: "' + view + '"'));
  for (const retired of ['"feed"', '"communities"', '"services"']) assert.ok(!page.includes(retired));
  assert.match(page, /conversation-open-mobile/);
  assert.match(styles, /\.conversation-open-mobile \.inbox-panel/);
  assert.match(styles, /@media \(max-width: 899px\)/);
});

test("both locales contain complete nonempty interface copy and explain demo limits", () => {
  assert.deepEqual(Object.keys(messengerCopy.ru).sort(), Object.keys(messengerCopy.kk).sort());
  for (const language of Object.values(messengerCopy)) {
    for (const text of Object.values(language)) assert.ok(typeof text === "string" && text.trim().length > 0);
  }
  assert.equal(messengerCopy.ru.chats, "Чаты");
  assert.equal(messengerCopy.kk.chats, "Чаттар");
  assert.match(messengerCopy.ru.demoHint, /исчезнут после перезагрузки/);
  assert.match(messengerCopy.ru.demoDetails, /Нет регистрации/);
});

test("web manifest describes the messenger without claiming an offline implementation", () => {
  assert.equal(manifest.short_name, "Qazyna");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.match(manifest.name, /мессенджер/);
  assert.equal(manifest.lang, "ru");
  assert.ok(manifest.icons.length > 0);
});

test("demo does not silently request devices, upload attachments, or fake delivery", () => {
  assert.doesNotMatch(page, /getUserMedia|new WebSocket|fetch\(|localStorage|dangerouslySetInnerHTML/);
  assert.match(page, /URL\.createObjectURL/);
  assert.match(page, /URL\.revokeObjectURL/);
  assert.match(page, /MAX_SESSION_ATTACHMENT_BYTES/);
  assert.match(page, /aria-label=\{t\.noDelivery\}/);
});
