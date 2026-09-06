import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/jeli-chat-wallpaper.css", import.meta.url), "utf8");
const wallpaper = await readFile(new URL("../public/jeli-chat-wallpaper.svg", import.meta.url), "utf8");

test("JELI loads its chat wallpaper as the final visual layer", () => {
  const wallpaperImport = layout.indexOf('import "./jeli-chat-wallpaper.css"');
  const interactionImport = layout.indexOf('import "./jeli-interactions.css"');
  assert.ok(wallpaperImport > interactionImport);
});

test("wallpaper is applied only to the conversation background", () => {
  assert.match(css, /\.chat-wallpaper/);
  assert.match(css, /url\('\/jeli-chat-wallpaper\.svg'\)/);
  assert.match(css, /background-repeat:\s*repeat-x/);
  assert.doesNotMatch(css, /\.inbox-panel[^\n]*background-image/);
});

test("wallpaper contains a dense JELI messaging pattern", () => {
  for (const marker of ["pattern", "#72d4cc", "#79cbee", "stroke-dasharray", "linearGradient"]) {
    assert.ok(wallpaper.includes(marker));
  }
  assert.match(wallpaper, /viewBox="0 0 720 1280"/);
});
