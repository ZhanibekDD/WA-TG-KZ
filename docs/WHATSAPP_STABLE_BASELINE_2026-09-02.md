# WhatsApp stable parity baseline — 2026-09-02

## Reference

The visual target is the stable WhatsApp Android experience current on 2026-09-02 plus current WhatsApp Web/Desktop. Qazyna keeps its own product name and identity while matching the information architecture, geometry and interaction placement of the reference.

The baseline intentionally excludes limited beta/A-B experiments until they become stable broadly shipped behavior.

## Strict geometry ownership

The final override layer is `app/whatsapp-strict-2026.css`. It is imported last and owns the high-salience geometry that should not drift casually:

- mobile app bar: 56 px
- mobile search: 44 px
- mobile filter chip: 32 px
- mobile chat row: 72 px
- mobile avatar: 52 px
- mobile bottom navigation: 68 px plus safe area
- mobile chat header: 56 px
- mobile composer / mic-send control: 48 px
- desktop navigation rail: 64 px
- desktop chat list: 400 px
- desktop chat header: 60 px

Message bubbles use compact WhatsApp-like tails, dense 14.25 px mobile message text, and separate incoming/outgoing geometry.

## Current screenshot gate

GitHub Actions performs a real Chromium visual capture after the normal build/type/lint/test gate. The job starts the production server and creates these PNGs:

1. `01-chats-390x844.png`
2. `02-chat-390x844.png`
3. `03-new-chat-390x844.png`
4. `04-updates-390x844.png`
5. `05-calls-390x844.png`
6. `06-chats-412x915.png`
7. `07-chat-412x915.png`
8. `08-desktop-1440x900.png`

Run #39 completed both `verify` and `visual-capture` successfully on HEAD `d8377b06023f14a55739d605138d2c899cc3440f`.

The uploaded artifact is `whatsapp-parity-screenshots`, artifact id `9975174669`, digest:

`sha256:28235ead99a2283ce11224a796c00261acd4add637358d8561aa40cd03a1fd4b`

The artifact expires after 14 days; approved long-term baselines should later be stored in a durable regression fixture process.

## Visual corrections made from real captures

The screenshot-review loop corrected visible prototype drift that source-level tests did not catch:

- oversized message typography and bubble padding;
- oversized bubble tails;
- prototype-only `Демо-контакт` subtitle in one-to-one chat headers;
- `Пример переписки` day divider, replaced by `Сегодня / Бүгін`;
- generic Select contact search placeholder, visually replaced with `Поиск по имени или номеру` / Kazakh equivalent;
- bold inherited placeholder styling in Select contact.

This is why screenshot capture is now part of the gate instead of relying only on source-level assertions.

## Acceptance rule

Do not describe a revision as pixel-perfect merely because the CSS values and tests pass. Pixel-perfect acceptance requires comparison of the actual captured PNGs against approved WhatsApp reference screens at the same viewport.

Until that comparison is signed off, call the state **strict WhatsApp parity baseline** rather than confirmed 1:1 pixel-perfect.
