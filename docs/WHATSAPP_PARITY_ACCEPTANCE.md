# WhatsApp parity acceptance

Reference date: 2026-09-05.

The product name, logo and owned assets remain Qazyna. The target is interaction and layout parity with the current WhatsApp experience, not impersonation of the WhatsApp brand.

## Reference screens

Visual acceptance must cover these screens before adding original UI experiments:

1. Chats list
2. One-to-one chat
3. Group chat
4. Updates / Status
5. Communities
6. Calls
7. Settings
8. New chat / contact picker

## Required viewport matrix

Mobile:
- 360 x 800
- 390 x 844
- 412 x 915

Desktop:
- 1366 x 768
- 1440 x 900
- 1920 x 1080

## Visual acceptance rules

- App bars, navigation, search/filter controls and composer must occupy the same visual zones as the reference.
- Chat-row height, avatar diameter, bubble radius, message spacing and primary icon sizes must remain within 4 px of the approved baseline at the target viewport.
- No alternate blue/custom theme while parity mode is active.
- No duplicate section titles that do not exist in the reference.
- Dynamic content may differ, but hierarchy and density must remain comparable.
- Every visual change after baseline approval must be checked against screenshots at 390 x 844 and 1440 x 900.
- A change fails acceptance if it makes the UI feel like a generic messenger instead of the approved WhatsApp-parity baseline.

## Functional parity order

Visual resemblance alone is not the product goal. Implement functionality in this order:

1. Phone-number registration and device session
2. Real two-account messaging with persistence
3. Delivery/read states and reconnect queue
4. Contacts and new-chat flow
5. Groups and membership controls
6. Image/video/document transfer
7. Voice notes
8. Push notifications
9. Status / Updates
10. Voice/video calls
11. Multi-device sync
12. End-to-end encryption after the message protocol and key lifecycle are explicitly designed and reviewed

Do not show a feature as working until its backend/device path exists.

## Release gate

A visual-parity release is acceptable only when:
- all target screens are reviewed at mobile and desktop sizes;
- no blocker layout regressions remain;
- messaging controls are not fake-success interactions;
- the baseline screenshots are stored for regression comparison;
- future CI can compare screenshots and flag large visual drift.
