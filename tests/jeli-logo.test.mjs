import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const logoLock = await readFile(new URL("../app/jeli-logo-lock.css", import.meta.url), "utf8");
const icon = await readFile(new URL("../public/jeli-icon.svg", import.meta.url), "utf8");
const manifest = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));

test("approved JELI vector logo is the final product icon source", () => {
  assert.match(icon, /linearGradient id="bg"/);
  assert.match(icon, /#20dd79/);
  assert.match(icon, /#167df0/);
  assert.match(icon, /<path/);
  assert.match(logoLock, /background:\s*url\('\/jeli-icon\.svg'\)/);
  assert.equal(manifest.icons[0].src, "/jeli-icon.svg");
});

test("logo lock loads after all other product and Stories color layers", () => {
  const product = layout.indexOf('import "./product-teal.css"');
  const stories = layout.indexOf('import "./jeli-stories.css"');
  const lock = layout.indexOf('import "./jeli-logo-lock.css"');
  assert.ok(product >= 0);
  assert.ok(stories > product);
  assert.ok(lock > stories);
});
