import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const strict = await readFile(new URL("../app/whatsapp-strict-2026.css", import.meta.url), "utf8");

test("strict WhatsApp baseline is imported after earlier parity layers", () => {
  const parity = layout.indexOf('import "./whatsapp-parity.css"');
  const lock = layout.indexOf('import "./whatsapp-lock.css"');
  const desktop = layout.indexOf('import "./whatsapp-desktop-lock.css"');
  const final = layout.indexOf('import "./whatsapp-strict-2026.css"');
  assert.ok(parity >= 0 && lock > parity && desktop > lock && final > desktop);
});

test("stable high-salience geometry stays locked", () => {
  for (const declaration of [
    "--wa-appbar-mobile: 56px",
    "--wa-search-mobile: 44px",
    "--wa-filter-mobile: 32px",
    "--wa-row-mobile: 72px",
    "--wa-avatar-mobile: 52px",
    "--wa-bottom-nav-mobile: 68px",
    "--wa-chatbar-mobile: 56px",
    "--wa-composer-mobile: 48px",
    "--wa-rail-desktop: 64px",
    "--wa-list-desktop: 400px",
    "--wa-chatbar-desktop: 60px",
  ]) assert.ok(strict.includes(declaration), declaration);
});

test("strict layer keeps WhatsApp bubble tails and separate mobile/desktop rules", () => {
  assert.match(strict, /\.message-bubble::before/);
  assert.match(strict, /\.outgoing \.message-bubble::before/);
  assert.match(strict, /@media \(min-width: 900px\)/);
  assert.match(strict, /@media \(max-width: 899px\)/);
  assert.match(strict, /grid-template-columns: var\(--wa-rail-desktop\) var\(--wa-list-desktop\)/);
});
