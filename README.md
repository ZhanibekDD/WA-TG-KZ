# JELI — мессенджер и платформа

JELI использует знакомую, быструю геометрию современного мессенджера, но имеет собственную визуальную идентичность и платформенный слой: Stories, боты, Mini Apps, каналы, сообщества и будущие бизнес-инструменты.

**Статус: демонстрационный прототип интерфейса, не работающая сеть.** Все контакты и исходные сообщения вымышлены. Добавленные сообщения, вложения, группы, Stories, боты и настройки существуют локально до подключения настоящих аккаунтов и backend. Не добавляйте конфиденциальные данные.

## Продуктовая формула

- UX и плотность основной переписки: проверенные паттерны WhatsApp Android/Web.
- Stories: Telegram-style компактная лента над чатами, быстрый viewer, privacy, archive и highlights.
- Визуальная идентичность: собственный teal — смесь messenger green и sky blue.
- Платформенные возможности: Telegram-level bots / Mini Apps / channels / communities, но без перегрузки основного Chats.
- JELI не является официальным клиентом WhatsApp или Telegram.

## Что уже есть

| Сценарий | Реализация в этой версии |
|---|---|
| Главный экран | Список чатов, поиск, архив, фильтры «Все / Непрочитанные / Избранное / Группы» |
| Stories | Горизонтальная лента над Chats + `/stories` viewer + реакция/ответ/privacy/duration/archive/highlights |
| Story privacy | Все / Контакты / Близкие друзья / Выбранные контакты |
| Story duration | 6 / 12 / 24 / 48 часов |
| Favorites | Отдельный список любимых чатов, не связанный с pinning |
| Starred messages | Звёздочка хранится на исходном сообщении; отдельный список ведёт обратно в исходный чат |
| Message Yourself | Отдельный чат «Вы / Сіз»; starred messages туда не копируются |
| Телефон | «Чаты / Обновления / Сообщества / Звонки»; Settings через More |
| Новый чат | Полноэкранный Select contact: новая группа / новый контакт / новое сообщество / контакты |
| Компьютер | Компактная rail + список чатов + переписка |
| Переписка | Текст, emoji, reply, edit/delete своих сообщений, star, contextual menu |
| Композер | Emoji, вложение, камера и отдельная mic/send кнопка |
| Обновления | Channels и существующий transition-слой статусов; основной Stories UX вынесен над Chats |
| Сообщества | Отдельная основная вкладка без вымышленных membership-данных |
| Звонки | Честное пустое состояние; реальных звонков пока нет |
| Бренд | Видимое имя JELI, teal `#18b5ad`, круглый `public/jeli-icon.png` |
| Bot Studio | `/bots`: создание bot draft, username, `jeli_demo_...` token, commands, webhook, Mini App URL, scopes |

## JELI Stories

Stories foundation использует `lib/jeli-stories.ts` и отдельный `/stories` экран. Созданные пользователем истории пока сохраняются локально — production delivery и viewer list появятся только вместе с реальными аккаунтами/backend.

Реализованный UX:
- expandable/compact rail над чатами;
- быстрый viewer;
- реакции и reply;
- privacy rules;
- 6/12/24/48h duration;
- archive;
- pinned profile highlights;
- UI-флаг content protection;
- локальный compose flow.

## Bot Platform

Bot Studio foundation открыт по пути `/bots` и опубликован как PWA shortcut. Сейчас он создаёт только локальные draft-боты и `jeli_demo_...` test tokens — они **не работают в сети**.

Production-концепция описана в [docs/BOT_PLATFORM.md](docs/BOT_PLATFORM.md):
- системный `@JELIBot` как BotFather-class manager;
- Bot API v1;
- production token issuance / rotate / revoke;
- signed webhooks + retries;
- permission scopes;
- Mini Apps;
- AI bots;
- no-code Flow Builder;
- payments/subscriptions;
- business inbox + CRM;
- Bot/App marketplace.

## Visual baseline и JELI brand

Ключевая messenger-геометрия зафиксирована отдельным strict baseline. Цветовой слой и JELI Stories развиваются отдельно, поэтому новые функции не должны ломать привычную плотность Chats.

GitHub Actions выполняет production build / TypeScript / ESLint / tests и реальный Chromium visual-capture. Artifact `jeli-ui-screenshots` содержит контрольные PNG мессенджера, Bot Studio и Stories.

## Чего пока нет

- регистрации по номеру телефона и настоящих аккаунтов;
- доставки между устройствами, серверного хранения и синхронизации;
- production Stories media upload/delivery/viewers;
- уведомлений и reconnect/offline очереди;
- адресной книги устройства;
- production Bot API и настоящих bot tokens;
- production Mini Apps runtime;
- записи с микрофона, аудио- и видеозвонков;
- сквозного шифрования и независимого security-аудита.

## Следующие вертикальные срезы

### Messenger slice
Регистрация по номеру → два аккаунта → server persistence → realtime delivery → reconnect без дублей → delivery/read states.

### Stories slice
Account-backed upload → privacy enforcement → viewers/reactions/replies → archive → profile highlights.

### Bot slice
Создать бота через `@JELIBot`/Bot Studio → сервер выдаёт токен → `getMe` → webhook получает сообщение → бот отвечает → rotate/revoke token → audit log.

После этого — Mini Apps, AI/business bots и no-code automation.

Технологии: React 19, TypeScript, Vinext, Tailwind CSS, Radix UI и Lucide. Текущая сборка совместима с Cloudflare Workers; решения о production-инфраструктуре и хранении данных принимаются отдельно.
