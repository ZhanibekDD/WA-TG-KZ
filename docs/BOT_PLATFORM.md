# JELI Bot Platform

JELI keeps the simple, familiar messenger UX, while exposing Telegram-level platform power behind optional surfaces.

## Product principle

Do not overload Chats. A person who only wants messaging should never need to understand bots, APIs or Mini Apps.

Platform features live in:
- system manager bot `@JELIBot`;
- Bot Studio (`/bots`);
- Apps / discovery surface later;
- per-chat bot and Mini App actions only when relevant.

## 1. `@JELIBot` — BotFather-class manager

The system manager bot should support both commands and buttons.

Initial commands:
- `/newbot` — create bot;
- `/mybots` — list owned bots;
- `/token` — issue/rotate/revoke bot token;
- `/setname` — display name;
- `/setusername` — public username;
- `/setdescription` — profile description;
- `/setcommands` — slash commands;
- `/setwebhook` — webhook URL;
- `/setminiapp` — main Mini App URL;
- `/permissions` — bot scopes;
- `/analytics` — usage summary;
- `/deletebot` — destructive flow with confirmation.

Better than a command-only BotFather:
1. `/newbot` can open Bot Studio as a Mini App.
2. Creation is a guided wizard with live username validation.
3. The user sees permissions before enabling them.
4. Bot tokens are shown once, can be rotated and have audit history.
5. Test/sandbox mode is available before production activation.

## 2. Bot Studio

Current foundation route: `/bots`.

The first UI foundation includes:
- bot name and username;
- bot type: AI / support / shop / automation / custom;
- local test token;
- commands;
- webhook URL;
- Main Mini App URL;
- permission scopes.

The current token is deliberately local-only and does not authenticate against a network service.

Production Bot Studio should add:
- avatar and profile media;
- username availability check;
- token one-time reveal;
- token rotation/revocation;
- webhook health and last delivery;
- event log;
- test update sender;
- command editor;
- inline keyboards / menus;
- Mini App settings;
- business integration;
- analytics;
- billing / monetization;
- collaborators and roles;
- audit log.

## 3. Bot API v1

Recommended public API shape:

```text
POST /bot/v1/messages.send
POST /bot/v1/messages.edit
POST /bot/v1/messages.delete
POST /bot/v1/media.upload
POST /bot/v1/chats.get
POST /bot/v1/chats.members
POST /bot/v1/commands.set
POST /bot/v1/webhooks.set
POST /bot/v1/webhooks.delete
GET  /bot/v1/me
```

Authentication:

```text
Authorization: Bot <token>
```

Production token rules:
- cryptographically random, at least 256 bits of entropy;
- raw token displayed only at creation/rotation;
- only a verifier/hash stored server-side where practical;
- token prefix identifies environment and key version, not secret material;
- immediate revoke and rotate;
- scoped permissions;
- per-token rate limits;
- audit record for create/rotate/revoke.

## 4. Webhooks and events

Events should be versioned and idempotent.

Core events:
- `message.created`;
- `message.edited`;
- `message.deleted`;
- `callback_query.created`;
- `chat.member_joined`;
- `chat.member_left`;
- `bot.command`;
- `miniapp.data`;
- `payment.pending`;
- `payment.succeeded`;
- `payment.refunded`.

Webhook requirements:
- HTTPS only in production;
- signed requests;
- event id + timestamp;
- replay protection;
- exponential retries;
- dead-letter queue;
- delivery logs in Bot Studio.

## 5. Permission model

Scopes should be explicit, not all-or-nothing.

Suggested scopes:
- `messages:read`;
- `messages:write`;
- `media:read`;
- `media:write`;
- `groups:read`;
- `groups:manage`;
- `members:read`;
- `members:manage`;
- `payments:write`;
- `miniapps:launch`;
- `business:messages`;
- `channels:publish`.

Users/admins must be able to see what a bot can access and revoke it per chat.

## 6. Mini Apps

Mini Apps are the biggest platform multiplier. A Mini App can be a complete service inside JELI while Chats remains simple.

Required capabilities:
- seamless JELI sign-in;
- theme and safe-area API;
- full-screen and compact modes;
- back/main buttons;
- chat context;
- secure init data signed by JELI;
- device storage abstraction;
- file picker;
- location with explicit user permission;
- push/deep-link hooks;
- payments;
- home-screen shortcut later.

Target examples:
- government services;
- bank/payment service;
- delivery and taxi;
- CRM;
- booking;
- marketplace;
- games;
- AI assistants;
- corporate HR / approvals;
- legal/document services.

## 7. AI bots

First-class AI mode should not be a special closed system. Bot owners can connect their own model/provider.

Features:
- system prompt / instructions;
- model/provider adapter;
- knowledge files;
- retrieval;
- tool/function calls;
- conversation memory controls;
- human handoff;
- moderation / policy layer;
- per-user budgets;
- usage analytics;
- streaming responses;
- voice input/output later.

Provider API keys belong to the bot owner and must be stored server-side encrypted; never shipped to clients.

## 8. No-code automation

This can make JELI stronger than a pure BotFather clone.

Visual Flow Builder blocks:
- trigger: new message / command / join / payment / schedule;
- condition;
- send message;
- buttons;
- collect form data;
- HTTP request;
- call AI;
- write to table/CRM;
- payment;
- delay;
- human handoff.

A small business should be able to build a useful bot without writing code.

## 9. Payments and monetization

Platform primitives:
- one-time invoice;
- subscription;
- paid digital content;
- physical-goods checkout;
- creator tips;
- affiliate/referral program;
- refunds;
- bot revenue dashboard.

Payment implementation must follow iOS/Google Play rules for digital goods in the distributed mobile apps. JELI should keep the payment abstraction provider-neutral so Kazakhstan payment rails can be integrated where platform rules allow it.

## 10. Business mode

High-value feature set:
- connect a bot to a business inbox;
- opening hours and auto-replies;
- lead qualification;
- CRM tags;
- assignment to employee;
- AI draft replies;
- order/status lookup;
- template messages;
- analytics;
- human takeover at any time.

## 11. Top platform features to add around bots

Priority A — high impact:
1. Mini Apps + App Directory.
2. AI agents and support bots.
3. Channels + large communities.
4. Topics/forums inside large groups.
5. Business inbox + CRM automations.
6. Scheduled messages, silent messages and reminders.
7. Public usernames, QR/deep links and invite links.
8. Global search across people, groups, channels, bots and apps.
9. Reactions, polls, quizzes and forms.
10. Multi-device sync.

Priority B — platform differentiation:
11. No-code bot Flow Builder.
12. Bot/App marketplace with verification and reviews.
13. Payments, subscriptions and affiliate programs.
14. AI translation and transcript/summary for voice/video.
15. Large cloud files and personal cloud storage.
16. Screen sharing / voice rooms / live streams.
17. Custom emoji/stickers and creator tools.
18. Collaborative Mini Apps inside group chats.
19. Organization workspaces with roles and SSO.
20. Open developer SDKs for Web, Android, iOS and server languages.

## 12. Recommended build order

Do not build 20 disconnected demos. Ship one vertical slice at a time.

### Platform slice 1 — real bot
1. real user account;
2. create bot through `@JELIBot` or Bot Studio;
3. server issues production token;
4. `getMe` equivalent;
5. bot receives a user message;
6. bot sends a reply;
7. webhook delivery + retries;
8. token rotation;
9. permission and audit logs.

### Platform slice 2 — interactive bot
- commands;
- inline/reply buttons;
- callbacks;
- media;
- groups;
- rate limits.

### Platform slice 3 — Mini App
- signed init data;
- launch button;
- full-screen UI;
- chat context;
- storage;
- payments sandbox.

### Platform slice 4 — AI + business
- AI provider adapter;
- knowledge/RAG;
- business inbox;
- human handoff;
- analytics.

## Success metric

A developer should be able to go from "I have a JELI account" to a working echo bot in under 5 minutes, while a non-developer should be able to build a basic support bot without code.
