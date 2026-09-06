import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const reactions = await readFile(new URL("../components/jeli-message-reactions.tsx", import.meta.url), "utf8");
const calls = await readFile(new URL("../components/jeli-call-overlay.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/jeli-interactions.css", import.meta.url), "utf8");

test("JELI mounts reactions and calls inside the messenger shell", () => {
  assert.match(layout, /JeliMessageReactions/);
  assert.match(layout, /JeliCallOverlay/);
  assert.match(layout, /jeli-interactions\.css/);
});

test("message reactions support familiar quick emoji interactions", () => {
  for (const emoji of ["👍", "❤️", "😂", "😮", "😢", "🔥"]) assert.ok(reactions.includes(emoji));
  assert.match(reactions, /message-bubble/);
  assert.match(reactions, /pointerdown/);
  assert.match(reactions, /dblclick/);
  assert.match(css, /\.jeli-reaction-picker/);
  assert.match(css, /\.jeli-reaction-pill/);
  assert.doesNotMatch(reactions, /localStorage|fetch\(|WebSocket/);
});

test("call UI is triggered from normal chat call controls and supports group mode", () => {
  assert.match(calls, /Видеозвонок/);
  assert.match(calls, /Аудиозвонок/);
  assert.match(calls, /Групповой звонок/);
  assert.match(calls, /Новый групповой звонок/);
  assert.match(calls, /document\.addEventListener\("click"/);
  assert.match(css, /\.jeli-call-overlay/);
  assert.match(css, /\.jeli-call-participants\.group/);
});

test("call preview does not request devices or pretend WebRTC is connected", () => {
  assert.doesNotMatch(calls, /getUserMedia|RTCPeerConnection|WebSocket|fetch\(/);
  assert.match(calls, /WEBRTC OFF/);
  assert.match(calls, /Микрофон и камера не запрашиваются/);
});
