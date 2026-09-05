# Qazyna — мессенджер и платформа для Казахстана

Qazyna использует знакомую, быструю геометрию современного мессенджера, но имеет собственную визуальную идентичность и собственный платформенный слой: боты, Mini Apps, каналы, сообщества и будущие бизнес-инструменты.

**Статус: демонстрационный прототип интерфейса, не работающая сеть.** Все контакты и исходные сообщения вымышлены. Добавленные сообщения, вложения, группы, статусы, боты и настройки существуют только в текущей вкладке и исчезают после её перезагрузки. Не добавляйте конфиденциальные данные.

## Продуктовая формула

- UX и плотность основной переписки: проверенные паттерны WhatsApp Android/Web.
- Визуальная идентичность: собственный **Qazyna Indigo**, а не WhatsApp green и не Telegram blue.
- Платформенные возможности: Telegram-level bots / Mini Apps / channels / communities, но без перегрузки основного Chats.
- Qazyna не является официальным клиентом WhatsApp или Telegram.

## Что уже есть

| Сценарий | Реализация в этой версии |
|---|---|
| Главный экран | Список чатов, поиск, архив, фильтры «Все / Непрочитанные / Избранное / Группы» |
| Favorites | Отдельный список любимых чатов, не связанный с pinning |
| Starred messages | Звёздочка хранится на исходном сообщении; отдельный список ведёт обратно в исходный чат |
| Message Yourself | Отдельный чат «Вы / Сіз»; starred messages туда не копируются |
| Телефон | «Чаты / Обновления / Сообщества / Звонки»; Settings через More |
| Новый чат | Полноэкранный Select contact: новая группа / новый контакт / новое сообщество / контакты |
| Компьютер | Компактная rail + список чатов + переписка |
| Переписка | Текст, emoji, reply, edit/delete своих сообщений, star, contextual menu |
| Композер | Emoji, вложение, камера и отдельная mic/send кнопка |
| Вложения | Локальный просмотр изображения, готового аудиофайла и скачивание файла |
| Обновления | Status tray и отдельные Channels; каналы не смешиваются с Chats |
| Сообщества | Отдельная основная вкладка без вымышленных membership-данных |
| Звонки | Честное пустое состояние; реальных звонков пока нет |
| Бренд | `app/qazyna-brand.css` накладывает Qazyna Indigo поверх стабильной геометрии |
| Bot Studio | `/bots`: создание bot draft, username, test token, commands, webhook, Mini App URL, scopes |

## Bot Platform

Bot Studio foundation открыт по пути `/bots` и также опубликован как PWA shortcut. Сейчас он создаёт только локальные draft-боты и `qz_demo_...` test tokens — они **не работают в сети**.

Production-концепция описана в [docs/BOT_PLATFORM.md](docs/BOT_PLATFORM.md):
- системный `@QazynaBot` как BotFather-class manager;
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

## Visual baseline и Qazyna brand

Ключевая геометрия зафиксирована отдельным strict baseline. После него импортируется `app/qazyna-brand.css`, поэтому фирменные цвета можно развивать независимо от UX-размеров.

GitHub Actions выполняет production build / TypeScript / ESLint / tests и реальный Chromium visual-capture. Artifact `qazyna-ui-screenshots` содержит контрольные PNG мессенджера и Bot Studio.

## Чего пока нет

- регистрации по номеру телефона и настоящих аккаунтов;
- доставки между устройствами, серверного хранения и синхронизации;
- уведомлений и reconnect/offline очереди;
- адресной книги устройства;
- production Bot API и настоящих bot tokens;
- production Mini Apps runtime;
- записи с микрофона, аудио- и видеозвонков;
- сквозного шифрования и независимого security-аудита.

## Следующие вертикальные срезы

### Messenger slice
Регистрация по номеру → два аккаунта → server persistence → realtime delivery → reconnect без дублей → delivery/read states.

### Bot slice
Создать бота через `@QazynaBot`/Bot Studio → сервер выдаёт токен → `getMe` → webhook получает сообщение → бот отвечает → rotate/revoke token → audit log.

После этого — Mini Apps, AI/business bots и no-code automation.

Технологии: React 19, TypeScript, Vinext, Tailwind CSS, Radix UI и Lucide. Текущая сборка совместима с Cloudflare Workers; решения о production-инфраструктуре и хранении данных принимаются отдельно.
