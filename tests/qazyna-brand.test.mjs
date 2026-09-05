import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const brand = await readFile(new URL("../app/qazyna-brand.css", import.meta.url), "utf8");

test("Qazyna brand layer is imported after the WhatsApp geometry baseline", () => {
  const strictIndex = layout.indexOf('import "./whatsapp-strict-2026.css"');
  const brandIndex = layout.indexOf('import "./qazyna-brand.css"');
  assert.ok(strictIndex >= 0);
  assert.ok(brandIndex > strictIndex);
});

test("Qazyna uses a distinct indigo identity instead of WhatsApp green", () => {
  assert.match(brand, /--qz-primary:\s*#5b5bd6/);
  assert.match(brand, /--qz-primary-strong:\s*#4747b8/);
  assert.match(brand, /--wa-green:\s*var\(--qz-primary\)/);
  assert.match(brand, /--wa-outgoing:\s*var\(--qz-primary-soft-2\)/);
  assert.doesNotMatch(brand, /#00a884|#25d366|#008069/i);
});

test("brand layer changes color without owning parity geometry", () => {
  for (const forbidden of ["--wa-row-mobile", "--wa-avatar-mobile", "--wa-chatbar-mobile", "grid-template-columns: var(--wa-rail-desktop)"]) {
    assert.ok(!brand.includes(forbidden), `brand layer must not redefine geometry: ${forbidden}`);
  }
});
