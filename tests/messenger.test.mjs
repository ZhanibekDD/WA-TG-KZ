import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState, localize, MAX_MESSAGE_LENGTH, messengerReducer as reduce, selectThreads } from "../lib/messenger.ts";

const outgoing = (body = "Привет", extra = {}) => ({ id: "new-message", body, mine: true, at: "2026-09-04T12:00:00+05:00", ...extra });
const send = (state, chatId = "aigerim", message = outgoing()) => reduce(state, { type: "send", chatId, message });
const ids = list => list.map(chat => chat.id);

test("fixtures are independent between sessions", () => {
  const first = createDemoState();
  const second = createDemoState();
  first.messages.aigerim.push(outgoing());
  first.threads[0].pinned = false;
  assert.equal(second.messages.aigerim.length, 5);
  assert.equal(second.threads[0].pinned, true);
});

test("send trims text, changes only the target thread, and leaves previous state intact", () => {
  const before = createDemoState();
  const after = send(before, "aigerim", outgoing("  Сәлем!  "));
  assert.equal(after.messages.aigerim.at(-1).body, "Сәлем!");
  assert.equal(after.messages.aigerim.length, before.messages.aigerim.length + 1);
  assert.equal(before.messages.aigerim.length, 5);
  assert.equal(after.messages.daniyar, before.messages.daniyar);
  assert.ok(after.threads.find(t => t.id === "aigerim").order > 9);
});

test("send rejects empty, oversized, forged incoming and duplicate messages", () => {
  const before = createDemoState();
  for (const message of [outgoing(" \n "), outgoing("x".repeat(MAX_MESSAGE_LENGTH + 1)), outgoing("x", { mine: false }), outgoing("x", { id: "a1" })]) {
    assert.equal(send(before, "aigerim", message), before);
  }
  const sent = send(before);
  assert.equal(send(sent), sent);
  assert.equal(send(before, "does-not-exist"), before);
});

test("channels remain read-only, including followed channels", () => {
  const state = createDemoState();
  assert.equal(send(state, "jeli"), state);
  assert.equal(send(state, "qazaqtech"), state);
});

test("attachment-only messages are accepted as session metadata", () => {
  const attachment = { name: "example.txt", size: 30, url: "blob:test", kind: "file" };
  const after = send(createDemoState(), "aigerim", outgoing("", { attachment }));
  assert.equal(after.messages.aigerim.at(-1).attachment, attachment);
  assert.equal(after.messages.aigerim.at(-1).body, "");
});

test("replies remain within their thread and do not point to missing messages", () => {
  const state = createDemoState();
  assert.equal(send(state, "aigerim", outgoing("Ответ", { replyTo: "a1" })).messages.aigerim.at(-1).replyTo, "a1");
  assert.equal(send(state, "aigerim", outgoing("Ответ", { replyTo: "d1" })).messages.aigerim.at(-1).replyTo, undefined);
});

test("starred messages stay in their original chat instead of being copied to Message Yourself", () => {
  const before = createDemoState();
  const selfCount = before.messages.saved.length;
  let after = reduce(before, { type: "star", chatId: "aigerim", messageId: "a1" });
  assert.equal(after.messages.aigerim.find(m => m.id === "a1").starred, true);
  assert.equal(after.messages.saved.length, selfCount);
  after = reduce(after, { type: "star", chatId: "aigerim", messageId: "a1" });
  assert.equal(after.messages.aigerim.find(m => m.id === "a1").starred, false);
  assert.equal(localize(after.threads.find(t => t.id === "saved").name, "ru"), "Вы");
});

test("only own messages can be edited or removed", () => {
  const state = createDemoState();
  let next = reduce(state, { type: "edit", chatId: "aigerim", messageId: "a1", body: "Wrong author" });
  assert.deepEqual(next.messages.aigerim, state.messages.aigerim);
  next = reduce(state, { type: "remove", chatId: "aigerim", messageId: "a1" });
  assert.deepEqual(next.messages.aigerim, state.messages.aigerim);
  next = reduce(state, { type: "edit", chatId: "aigerim", messageId: "a2", body: "  Исправлено  " });
  assert.equal(next.messages.aigerim.find(m => m.id === "a2").body, "Исправлено");
  assert.equal(next.messages.aigerim.find(m => m.id === "a2").edited, true);
  next = reduce(next, { type: "remove", chatId: "aigerim", messageId: "a2" });
  assert.ok(!next.messages.aigerim.some(m => m.id === "a2"));
  assert.equal(next.messages.daniyar, state.messages.daniyar);
});

test("invalid edits leave text unchanged", () => {
  const state = createDemoState();
  for (const body of [" ", "x".repeat(MAX_MESSAGE_LENGTH + 1)]) {
    assert.equal(reduce(state, { type: "edit", chatId: "aigerim", messageId: "a2", body }), state);
  }
});

test("opening a chat clears its unread count and updates the unread filter", () => {
  const state = createDemoState();
  assert.ok(ids(selectThreads(state, "unread", "", false, "ru")).includes("aigerim"));
  const next = reduce(state, { type: "read", chatId: "aigerim" });
  assert.ok(!ids(selectThreads(next, "unread", "", false, "ru")).includes("aigerim"));
  assert.equal(next.threads.find(t => t.id === "family").unread, 3);
});

test("archive, pinned ordering, mute and restoration are reversible", () => {
  let state = createDemoState();
  state = reduce(state, { type: "pin", chatId: "botjeli" });
  assert.equal(ids(selectThreads(state, "all", "", false, "ru"))[0], "aigerim");
  state = reduce(state, { type: "pin", chatId: "aigerim" });
  assert.equal(ids(selectThreads(state, "all", "", false, "ru"))[0], "saved");
  state = reduce(state, { type: "mute", chatId: "daniyar" });
  assert.equal(state.threads.find(t => t.id === "daniyar").muted, true);
  state = reduce(state, { type: "archive", chatId: "daniyar" });
  assert.ok(!ids(selectThreads(state, "all", "", false, "ru")).includes("daniyar"));
  assert.ok(ids(selectThreads(state, "all", "", true, "ru")).includes("daniyar"));
  state = send(state, "daniyar");
  assert.equal(state.threads.find(t => t.id === "daniyar").archived, false);
});

test("Favorites are a real chat list independent from pinning and starred messages", () => {
  let state = createDemoState();
  assert.deepEqual(ids(selectThreads(state, "favorites", "", false, "ru")), ["aigerim", "family"]);
  state = reduce(state, { type: "favorite", chatId: "daniyar" });
  assert.ok(ids(selectThreads(state, "favorites", "", false, "ru")).includes("daniyar"));
  state = reduce(state, { type: "favorite", chatId: "aigerim" });
  assert.ok(!ids(selectThreads(state, "favorites", "", false, "ru")).includes("aigerim"));
  const beforeChannel = state.threads.find(t => t.id === "jeli");
  state = reduce(state, { type: "favorite", chatId: "jeli" });
  assert.equal(state.threads.find(t => t.id === "jeli").favorite, beforeChannel.favorite);
});

test("search matches localised names and message bodies without mixing channels into Chats", () => {
  const state = createDemoState();
  assert.deepEqual(ids(selectThreads(state, "all", "  ОТБАСЫ ", false, "kk")), ["family"]);
  assert.deepEqual(ids(selectThreads(state, "all", "19:00", false, "ru")), ["aigerim"]);
  assert.deepEqual(selectThreads(state, "all", "Планы на выходные", false, "ru"), []);
  assert.deepEqual(ids(selectThreads(state, "groups", "", false, "ru")), ["family", "team"]);
  assert.deepEqual(ids(selectThreads(state, "channels", "", false, "ru")), ["jeli"]);
  assert.ok(!ids(selectThreads(state, "all", "", false, "ru")).includes("jeli"));
  assert.equal(localize(state.threads.find(t => t.id === "family").name, "ru"), "Семья");
});

test("following changes Updates membership without leaking channels into Chats", () => {
  const before = createDemoState();
  assert.ok(!ids(selectThreads(before, "all", "", false, "ru")).includes("jeli"));
  const after = reduce(before, { type: "follow", chatId: "qazaqtech" });
  assert.ok(ids(selectThreads(after, "channels", "", false, "ru")).includes("qazaqtech"));
  assert.ok(!ids(selectThreads(after, "all", "", false, "ru")).includes("qazaqtech"));
  const restored = reduce(after, { type: "follow", chatId: "qazaqtech" });
  assert.deepEqual(selectThreads(restored, "channels", "", false, "ru"), selectThreads(before, "channels", "", false, "ru"));
});

test("created groups have their own conversation and duplicate IDs do not overwrite data", () => {
  const before = createDemoState();
  const thread = { id: "new-group", name: "Друзья", initials: "", color: "#638eae", kind: "group", members: ["aigerim", "daniyar"], unread: 0, pinned: false, favorite: false, muted: false, archived: false, order: 10 };
  let after = reduce(before, { type: "create", thread });
  assert.deepEqual(after.messages["new-group"], []);
  after = send(after, "new-group");
  assert.equal(after.messages["new-group"].length, 1);
  assert.equal(after.messages.aigerim, before.messages.aigerim);
  assert.equal(reduce(after, { type: "create", thread }), after);
});
