# JELI — мессенджер и платформа

JELI строится по простой формуле: основной мессенджер должен ощущаться привычно как WhatsApp, Stories — быстро и полноэкранно как Telegram, а создание ботов — происходить внутри системного чата BotJeli по модели BotFather.

**Статус: демонстрационный прототип интерфейса, не работающая сеть.** Контакты и исходные сообщения вымышлены. Новые сообщения, Stories и созданные через BotJeli боты пока существуют только локально до появления настоящих аккаунтов и backend. Не добавляйте конфиденциальные данные.

## Продуктовая формула

- Chats / открытая переписка / New Chat / нижняя навигация: WhatsApp-like UX и плотность.
- Stories: компактная лента над чатами + тёмный полноэкранный Telegram-like viewer.
- Bots: только системный чат **BotJeli**, без отдельной пользовательской админ-панели.
- Платформенные возможности: каналы, сообщества, Mini Apps, AI/business bots — за понятными точками входа, без перегрузки Chats.
- Визуальная идентичность: JELI teal, зелёный × голубой, собственный круглый знак.
- JELI не является официальным клиентом WhatsApp или Telegram.

## Что уже есть

| Сценарий | Реализация в этой версии |
|---|---|
| Главный экран | Список чатов, поиск, архив, фильтры «Все / Непрочитанные / Избранное / Группы» |
| Stories rail | Компактные аватары над Chats, не вытесняют список чатов |
| Stories viewer | Тёмный fullscreen viewer; mobile = весь экран, desktop = вертикальная карточка по центру |
| Story actions | Prev/next, reply, reaction, privacy, duration, archive, pinned profile stories |
| BotJeli | Обычный системный чат в списке сообщений |
| Создание бота | `/newbot` → имя → username → локальный test token прямо в переписке |
| Управление ботами | `/mybots`, `/help`; production Bot API подключается позже |
| Favorites | Отдельный список любимых чатов, не связанный с pinning |
| Starred messages | Звёздочка хранится на исходном сообщении; отдельный список ведёт обратно в исходный чат |
| Message Yourself | Отдельный чат «Вы / Сіз» |
| Телефон | «Чаты / Обновления / Сообщества / Звонки»; Settings через More |
| Новый чат | Полноэкранный Select contact: новая группа / новый контакт / новое сообщество / контакты |
| Компьютер | Rail + список чатов + открытая переписка |
| Переписка | Текст, emoji, reply, edit/delete своих сообщений, star, contextual menu |
| Композер | Emoji, вложение, камера и отдельная mic/send кнопка |
| Каналы | Находятся в Updates и не смешиваются с обычными Chats |
| Звонки | UI существует, реальные звонки пока не подключены |
| Бренд | JELI, teal `#18b5ad`, круглый `public/jeli-icon.svg` |

## Stories

Stories используют `lib/jeli-stories.ts`. Созданные пользователем истории пока сохраняются локально.

Текущий UX:
- компактная лента над Chats;
- fullscreen viewer без отдельной белой «веб-страницы»;
- реакции и reply;
- privacy: Everyone / Contacts / Close Friends / Selected Contacts;
- 6 / 12 / 24 / 48 часов;
- archive;
- pinned profile stories;
- локальный compose flow.

## BotJeli

Отдельный пользовательский Bot Studio удалён. Единственный основной UX создания бота — **чат BotJeli**.

Текущий локальный flow:
1. `/newbot`;
2. BotJeli спрашивает имя;
3. BotJeli спрашивает username, который заканчивается на `bot`;
4. после валидного username выдаётся `jeli_demo_...` test token;
5. `/mybots` показывает ботов, созданных в текущей сессии.

Production roadmap: server-issued token, `getMe`, signed webhooks, rotate/revoke, scopes, Mini Apps, AI bots, no-code automation и audit log.

## Visual / CI gates

GitHub Actions выполняет:
- production build;
- TypeScript;
- ESLint;
- полный test suite;
- Chromium capture мессенджера mobile/desktop;
- Chromium capture **BotJeli внутри мессенджера**;
- Chromium capture Stories mobile/desktop.

Artifact: `jeli-ui-screenshots`.

## Чего пока нет

- регистрации по номеру и настоящих аккаунтов;
- server persistence / realtime / delivery states;
- production Stories upload/delivery/viewers;
- production Bot API и настоящих bot tokens;
- push;
- реальных аудио/видеозвонков и групповых звонков;
- production Mini Apps runtime;
- E2EE и независимого security-аудита.

## Следующие вертикальные срезы

### Messenger
Регистрация → два аккаунта → server persistence → realtime → reconnect → delivered/read → reactions.

### Calls
WebRTC audio 1:1 → video 1:1 → TURN/reconnect → group calls → screen sharing.

### Stories
Account-backed media upload → privacy enforcement → viewers/reactions/replies → archive/profile.

### BotJeli
Server-issued bot token → `getMe` → signed webhook → bot reply → rotate/revoke → audit log.

После этого — Mini Apps, AI/business bots, payments и no-code automation.

Технологии: React 19, TypeScript, Vinext, Tailwind CSS, Radix UI и Lucide. Текущая сборка совместима с Cloudflare Workers; production-инфраструктура выбирается отдельно.
