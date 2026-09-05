import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createDemoState, messengerReducer as reduce } from "../lib/messenger.ts";

const message = (id, body) => ({ id, body, mine: true, at: "2026-09-05T20:00:00+05:00" });
const send = (state, id, body) => reduce(state, { type: "send", chatId: "botjeli", message: message(id, body) });

test("BotJeli is a normal system chat in the messenger list", () => {
  const state = createDemoState();
  const bot = state.threads.find(thread => thread.id === "botjeli");
  assert.ok(bot);
  assert.equal(bot.name, "BotJeli");
  assert.equal(bot.kind, "direct");
  assert.ok(state.messages.botjeli[0].body.ru.includes("/newbot"));
  assert.ok(state.messages.botjeli[0].body.ru.includes("/mybots"));
});

test("/newbot creates a bot entirely inside the BotJeli conversation", () => {
  let state = createDemoState();
  state = send(state, "bj-u1", "/newbot");
  assert.equal(state.messages.botjeli.at(-1).botFlow, "ask-name");

  state = send(state, "bj-u2", "ZakonExpert Assistant");
  assert.equal(state.messages.botjeli.at(-1).botFlow, "ask-username");

  state = send(state, "bj-u3", "bad-name");
  assert.equal(state.messages.botjeli.at(-1).botFlow, "ask-username");

  state = send(state, "bj-u4", "zakonexpert_bot");
  const created = state.messages.botjeli.at(-1);
  assert.equal(created.botFlow, "created");
  assert.deepEqual(created.botMeta, { name: "ZakonExpert Assistant", username: "zakonexpert_bot" });
  assert.match(created.body.ru, /jeli_demo_/);
  assert.match(created.body.ru, /@zakonexpert_bot/);

  state = send(state, "bj-u5", "/mybots");
  assert.match(state.messages.botjeli.at(-1).body.ru, /ZakonExpert Assistant/);
  assert.match(state.messages.botjeli.at(-1).body.ru, /@zakonexpert_bot/);
});

test("BotJeli local token flow does not claim a production network API", () => {
  let state = createDemoState();
  state = send(state, "bj-a", "/newbot");
  state = send(state, "bj-b", "Demo Bot");
  state = send(state, "bj-c", "demohelper_bot");
  const body = state.messages.botjeli.at(-1).body.ru;
  assert.match(body, /локальном режиме/i);
  assert.match(body, /демонстрация этой вкладки/i);
});

test("legacy /bots surface only deep-links into BotJeli instead of rendering a dashboard", async () => {
  const botsPage = await readFile(new URL("../app/bots/page.tsx", import.meta.url), "utf8");
  const bridge = await readFile(new URL("../components/jeli-deep-link-bridge.tsx", import.meta.url), "utf8");
  assert.match(botsPage, /redirect\("\/\?botjeli=1"\)/);
  assert.doesNotMatch(botsPage, /Bot Studio|Username|Webhook|Mini App/);
  assert.match(bridge, /button\[aria-label=\"BotJeli\"\]/);
  assert.match(bridge, /button\.click\(\)/);
});

test("BotJeli exposes BotFather-style commands inside the normal chat composer", async () => {
  const bar = await readFile(new URL("../components/botjeli-command-bar.tsx", import.meta.url), "utf8");
  for (const text of ["Создать бота", "Мои боты", "Помощь", "/newbot", "/mybots", "/help"]) assert.ok(bar.includes(text));
  assert.match(bar, /form\.requestSubmit\(\)/);
  assert.doesNotMatch(bar, /Webhook|Mini App|API token/);
});
