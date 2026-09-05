# WhatsApp stable baseline — 2026-09-02

This document freezes the visual reference used by Qazyna parity work.

## Product reference

- Android reference: WhatsApp Messenger stable listing updated 2026-09-02.
- Android version shown by the official WhatsApp download page at the time of this baseline: 2.26.32.84.
- Desktop reference: current WhatsApp Web / Desktop layout on the same parity cycle.
- Qazyna keeps its own name, identity and owned assets; the target is UI/UX parity, not pretending to be the official WhatsApp client.

## High-salience geometry

The final CSS ownership layer is `app/whatsapp-strict-2026.css`.

Mobile baseline:
- app bar: 56 px
- search field: 44 px
- filter chip: 32 px minimum height
- chat row: 72 px
- main chat avatar: 52 px
- bottom navigation: 68 px before safe-area inset
- chat header: 56 px
- composer input / mic-send button: 48 px

Desktop baseline:
- left navigation rail: 64 px
- chat list: 400 px
- chat header: 60 px
- row density: 72 px

## Visual ownership rule

`whatsapp-strict-2026.css` is imported last and owns the values above. Earlier parity layers may define structure and secondary surfaces, but must not override these measurements.

## Acceptance

The layout should be reviewed at:
- 360 × 800
- 390 × 844
- 412 × 915
- 1366 × 768
- 1440 × 900
- 1920 × 1080

A release must not be described as pixel-identical until screenshot comparison has been performed against approved reference captures. Until then, the correct claim is strict WhatsApp parity baseline.
