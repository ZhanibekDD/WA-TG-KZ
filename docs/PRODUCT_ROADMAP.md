# JELI Product Roadmap

## Product rule

JELI combines familiar messenger interaction patterns rather than inventing a new navigation system:
- Chats and conversation UX stay WhatsApp-like in density and placement;
- Stories use Telegram-like compact presence above Chats and a dark full-screen viewer;
- bot creation and management happen inside **BotJeli**, like BotFather, not in a standalone dashboard;
- JELI keeps its own name, logo and teal green×blue identity.

## Stage 0 — interaction baseline

Done in current prototype:
- mobile and desktop Chats;
- search, archive, All / Unread / Favorites / Groups;
- 1:1 and group conversation surfaces;
- reply/edit/delete/star/context menu;
- Message Yourself;
- Channels separated from personal Chats;
- New Chat hierarchy;
- Calls/Communities/Updates shells;
- compact Stories rail above Chats;
- dark full-screen Stories viewer;
- JELI branding and round logo;
- BotJeli system conversation.

## Stage 1 — real messenger vertical slice

Goal: two real accounts can exchange persistent messages.

1. phone registration / verification;
2. user identity and sessions;
3. contacts / username lookup;
4. server-side conversations and messages;
5. realtime transport;
6. idempotent sending;
7. reconnect/offline queue;
8. sent / delivered / read states;
9. message reactions;
10. push notifications.

Acceptance: two devices exchange messages and reactions, survive reconnect/reload and show honest delivery state.

## Stage 2 — media and voice

- image/video/file upload;
- thumbnails and download lifecycle;
- voice-note recording/playback;
- video messages later;
- media permissions and storage quotas.

## Stage 3 — calls

Order:
1. WebRTC audio 1:1;
2. WebRTC video 1:1;
3. STUN/TURN and reconnect behavior;
4. incoming/outgoing/ringing/missed states;
5. group audio calls;
6. group video calls;
7. screen sharing;
8. device selection and network-quality UI.

Do not display a call as connected until real signaling/media paths exist.

## Stage 4 — Stories

Current prototype already validates UX. Production slice:
1. account-backed media upload;
2. story publishing;
3. 6 / 12 / 24 / 48 hour expiry;
4. privacy enforcement: Everyone / Contacts / Close Friends / Selected;
5. viewer list;
6. reactions;
7. replies delivered to chat;
8. archive;
9. profile-pinned stories;
10. moderation/reporting.

## Stage 5 — BotJeli / Bot API

Primary bot management UX remains inside the **BotJeli chat**.

Current local prototype:
- `/newbot`;
- guided name → username flow;
- username retry without losing bot name;
- local `jeli_demo_...` token;
- `/mybots`;
- `/help`.

Production slice:
1. real owner account;
2. server-issued bot token;
3. `getMe` equivalent;
4. bot receives message via signed webhook;
5. bot sends reply;
6. callbacks/buttons;
7. token rotate/revoke;
8. permission scopes;
9. rate limits;
10. audit logs.

Advanced configuration may open as a Mini App from BotJeli, but not replace the chat-first UX.

## Stage 6 — groups, channels, communities

- large groups;
- roles/admin permissions;
- topics/forums;
- polls/quizzes;
- channel publishing;
- comments/discussion groups;
- community containers;
- moderation and anti-spam.

## Stage 7 — Mini Apps

- signed init data;
- JELI theme/safe-area API;
- full-screen and compact modes;
- chat context;
- storage;
- payments sandbox;
- deep links;
- app directory/verification later.

## Stage 8 — AI and business

- AI bots;
- knowledge/RAG;
- translation;
- voice transcription;
- chat summaries;
- business inbox;
- CRM tags and assignments;
- auto-replies;
- human handoff;
- no-code Flow Builder;
- payments/subscriptions.

## Non-negotiable security boundary

Until actually implemented and reviewed, JELI must not claim:
- real E2EE;
- real device delivery;
- production bot tokens;
- production Stories privacy enforcement;
- real calls;
- real payment processing.

## North-star acceptance

A new user should understand basic JELI messaging without learning a new UI. A Telegram/WhatsApp user should immediately know how to open a chat, send a message, view a Story and interact with BotJeli.
