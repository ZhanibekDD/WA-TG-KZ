# JELI Bot Platform

JELI keeps bot creation and bot management inside the messenger. The primary user experience is the system chat **BotJeli**, following the successful BotFather pattern: commands, conversational steps and inline controls inside a normal chat.

## Product rule

Do not create a separate user-facing admin dashboard for routine bot creation.

The normal path is:
1. open **BotJeli** from Chats;
2. send `/newbot`;
3. answer BotJeli's questions;
4. receive the bot token in the conversation;
5. manage owned bots through `/mybots` and contextual inline controls.

Advanced developer settings may later open as a Mini App from BotJeli, but they remain secondary to the chat flow.

## BotJeli commands

Initial command set:
- `/newbot` — create a bot;
- `/mybots` — list owned bots;
- `/token` — issue / rotate / revoke token;
- `/setname` — display name;
- `/setusername` — public username;
- `/setdescription` — profile description;
- `/setcommands` — slash commands;
- `/setwebhook` — webhook URL;
- `/setminiapp` — main Mini App;
- `/permissions` — scopes;
- `/analytics` — usage summary;
- `/deletebot` — destructive flow with confirmation;
- `/help` — help.

Current prototype implements the first local slice: `/newbot`, guided name + username creation, local `jeli_demo_...` test token, `/mybots` and `/help`.

## Bot creation UX

`/newbot` should behave conversationally:
- BotJeli asks for the bot name;
- then asks for a unique username;
- invalid input is rejected without losing previous answers;
- after success, BotJeli returns the token and next management actions;
- tokens are never exposed outside the chat flow unless the user explicitly requests them.

Production token rules:
- cryptographically random with at least 256 bits of entropy;
- raw token shown only at creation/rotation;
- server stores a verifier/hash where practical;
- immediate rotate/revoke;
- scoped permissions;
- per-token rate limits;
- audit record for creation, rotation and revocation.

## Bot API v1

Recommended API:

```text
GET  /bot/v1/me
POST /bot/v1/messages.send
POST /bot/v1/messages.edit
POST /bot/v1/messages.delete
POST /bot/v1/media.upload
POST /bot/v1/chats.get
POST /bot/v1/chats.members
POST /bot/v1/commands.set
POST /bot/v1/webhooks.set
POST /bot/v1/webhooks.delete
```

Authentication:

```text
Authorization: Bot <token>
```

## Webhooks

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

Production requirements:
- HTTPS only;
- signed requests;
- event id + timestamp;
- replay protection;
- idempotency;
- exponential retries;
- dead-letter queue;
- delivery history accessible from BotJeli / advanced Mini App.

## Permissions

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

Users and group admins must always be able to inspect and revoke bot access.

## Inline management inside BotJeli

After `/mybots`, BotJeli should return owned bots with inline buttons such as:
- Edit bot;
- Token;
- Commands;
- Webhook;
- Mini App;
- Permissions;
- Analytics;
- Delete bot.

This keeps the experience inside the chat. Complex forms can open a JELI Mini App only when needed.

## Mini Apps

Mini Apps are an optional extension of BotJeli, not a replacement for the chat UX.

Required capabilities:
- seamless JELI sign-in;
- signed init data;
- theme and safe-area API;
- full-screen and compact modes;
- back/main buttons;
- chat context;
- storage abstraction;
- file picker;
- location with explicit permission;
- deep links and push hooks;
- payments.

## AI bots

First-class AI bot capabilities:
- configurable provider/model;
- system instructions;
- knowledge files and retrieval;
- tool/function calls;
- memory controls;
- human handoff;
- moderation;
- per-user budgets;
- streaming responses;
- voice input/output later.

Provider credentials remain server-side and encrypted.

## No-code automation

BotJeli may launch a Flow Builder Mini App for advanced automation.

Useful blocks:
- new message / command / join / payment / schedule triggers;
- conditions;
- send message;
- buttons/forms;
- HTTP request;
- AI call;
- CRM/table write;
- payment;
- delay;
- human handoff.

## Payments and business mode

Platform primitives:
- one-time invoices;
- subscriptions;
- creator tips;
- refunds;
- affiliate/referral;
- business inbox;
- opening hours and auto-replies;
- lead qualification;
- CRM tags;
- employee assignment;
- AI draft replies;
- human takeover.

## Build order

### Slice 1 — real BotJeli
1. real user account;
2. `/newbot` inside BotJeli;
3. server issues production token;
4. `getMe`;
5. webhook receives user message;
6. bot sends reply;
7. retry/idempotency;
8. rotate/revoke;
9. audit log.

### Slice 2 — interactive bots
- commands;
- inline/reply buttons;
- callbacks;
- media;
- groups;
- rate limits.

### Slice 3 — Mini Apps
- signed init data;
- launch from BotJeli/bot chat;
- full-screen UI;
- chat context;
- storage;
- payments sandbox.

### Slice 4 — AI + business
- AI provider adapter;
- knowledge/RAG;
- business inbox;
- human handoff;
- analytics.

## Success metric

A user should be able to open BotJeli and create a working bot without leaving the messenger. A developer should reach a functioning echo bot in under five minutes once the production Bot API exists.
