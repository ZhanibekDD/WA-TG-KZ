import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const brand = await readFile(new URL("../app/qazyna-brand.css", import.meta.url), "utf8");
const teal = await readFile(new URL("../app/product-teal.css", import.meta.url), "utf8");

test("product color layer is imported after geometry and base brand layers", () => {
  const strictIndex = layout.indexOf('import "./whatsapp-strict-2026.css"');
  const brandIndex = layout.indexOf('import "./qazyna-brand.css"');
  const tealIndex = layout.indexOf('import "./product-teal.css"');
  assert.ok(strictIndex >= 0);
  assert.ok(brandIndex > strictIndex);
  assert.ok(tealIndex > brandIndex);
});

test("final palette blends messenger green and sky blue into independent teal", () => {
  assert.match(teal, /--qz-primary:\s*#18b5ad/);
  assert.match(teal, /--qz-primary-strong:\s*#0b8f99/);
  assert.match(teal, /--qz-sky:\s*#229ed9/);
  assert.match(teal, /--qz-green:\s*#25c978/);
  assert.match(teal, /linear-gradient\(135deg, var\(--qz-green\), var\(--qz-sky\)\)/);
  assert.doesNotMatch(teal, /#00a884|#25d366|#008069/i);
});

test("color layers do not own messenger parity geometry", () => {
  for (const css of [brand, teal]) {
    for (const forbidden of ["--wa-row-mobile", "--wa-avatar-mobile", "--wa-chatbar-mobile", "grid-template-columns: var(--wa-rail-desktop)"]) {
      assert.ok(!css.includes(forbidden), `color layer must not redefine geometry: ${forbidden}`);
    }
  }
});