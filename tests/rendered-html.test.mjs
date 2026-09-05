import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("built worker renders the messenger and honest demo state", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /<html[^>]*lang="ru"/);
  assert.match(html, /<title>Qazyna — мессенджер<\/title>/);
  assert.match(html, /<h1[^>]*>Чаты<\/h1>/);
  assert.match(html, /Поиск чатов и сообщений/);
  assert.match(html, /Непрочитанные/);
  assert.match(html, /Не отправляется другим людям/);
  assert.match(html, /Демо-контакт/);
  assert.match(html, /Семья/);
  assert.match(html, /Избранное/);
  assert.match(html, /role="log"/);
  assert.doesNotMatch(html, /Проверенные услуги|Главная лента|в сети|CheckCheck|сквозным шифрованием/);
});
