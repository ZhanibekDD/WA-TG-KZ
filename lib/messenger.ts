export type Locale = "ru" | "kk";
export type Text = string | Record<Locale, string>;
export type Kind = "direct" | "group" | "channel" | "saved";
export type Filter = "all" | "unread" | "favorites" | "groups" | "channels";
export type Attachment = { name: string; url: string; size: number; kind: "file" | "image" | "audio" };
export type BotFlow = "ask-name" | "ask-username" | "created";
export type BotMeta = { name: string; username: string };
export type Message = { id: string; body: Text; mine: boolean; at: string; sender?: string; replyTo?: string; edited?: boolean; starred?: boolean; attachment?: Attachment; botFlow?: BotFlow; botMeta?: BotMeta };
export type Thread = { id: string; name: Text; initials: string; color: string; kind: Kind; unread: number; pinned: boolean; favorite: boolean; muted: boolean; archived: boolean; following?: boolean; members?: string[]; order: number };
export type MessengerState = { threads: Thread[]; messages: Record<string, Message[]> };
export type Action =
  | { type: "send"; chatId: string; message: Message }
  | { type: "edit"; chatId: string; messageId: string; body: string }
  | { type: "remove" | "star"; chatId: string; messageId: string }
  | { type: "read" | "pin" | "favorite" | "mute" | "archive" | "follow"; chatId: string }
  | { type: "create"; thread: Thread };

export const contacts = [
  { id: "aigerim", name: "Айгерим", initials: "А", color: "#be6978" },
  { id: "daniyar", name: "Данияр", initials: "Д", color: "#658db5" },
  { id: "asqar", name: "Асқар", initials: "А", color: "#b28b52" },
  { id: "madi", name: "Мади", initials: "М", color: "#709c88" },
];

export const localize = (value: Text, locale: Locale): string => typeof value === "string" ? value : value[locale];
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const MAX_SESSION_ATTACHMENT_BYTES = 30 * 1024 * 1024;

const at = (time: string) => `2026-09-04T${time}:00+05:00`;
const pair = (ru: string, kk: string): Text => ({ ru, kk });
const thread = (id: string, name: Text, initials: string, color: string, kind: Kind, order: number, extra: Partial<Thread> = {}): Thread => ({ id, name, initials, color, kind, order, unread: 0, pinned: false, favorite: false, muted: false, archived: false, ...extra });

const botReply = (id: string, body: Text, flow?: BotFlow, meta?: BotMeta): Message => ({
  id: `botjeli-${id}`,
  mine: false,
  body,
  at: new Date().toISOString(),
  botFlow: flow,
  botMeta: meta,
});

function botJeliResponse(list: Message[], body: string, seed: string): Message {
  const command = body.trim();
  const normalized = command.toLocaleLowerCase();
  const lastBot = [...list].reverse().find(message => !message.mine);

  if (normalized === "/start" || normalized === "/help") {
    return botReply(seed, pair(
      "Я BotJeli — системный бот JELI для создания и управления ботами.\n\n/newbot — создать бота\n/mybots — мои боты\n/help — помощь",
      "Мен BotJeli — JELI боттарын құруға және басқаруға арналған жүйелік ботпын.\n\n/newbot — бот құру\n/mybots — менің боттарым\n/help — көмек",
    ));
  }

  if (normalized === "/newbot" || normalized === "создать бота") {
    return botReply(seed, pair(
      "Создаём нового бота. Как его назовём?\n\nНапример: ZakonExpert Assistant",
      "Жаңа бот құрамыз. Оның атауы қандай болады?\n\nМысалы: ZakonExpert Assistant",
    ), "ask-name");
  }

  if (normalized === "/mybots") {
    const bots = list.filter(message => message.botMeta?.username).map(message => message.botMeta!);
    const unique = [...new Map(bots.map(bot => [bot.username, bot])).values()];
    if (!unique.length) return botReply(seed, pair(
      "У вас пока нет ботов в этой сессии. Отправьте /newbot, чтобы создать первого.",
      "Бұл сессияда әзірге боттарыңыз жоқ. Біріншісін құру үшін /newbot жіберіңіз.",
    ));
    return botReply(seed, pair(
      `Ваши боты:\n\n${unique.map(bot => `• ${bot.name} — @${bot.username}`).join("\n")}\n\nДля нового бота: /newbot`,
      `Сіздің боттарыңыз:\n\n${unique.map(bot => `• ${bot.name} — @${bot.username}`).join("\n")}\n\nЖаңа бот үшін: /newbot`,
    ));
  }

  if (lastBot?.botFlow === "ask-name") {
    const name = command.slice(0, 64).trim();
    if (name.length < 2) return botReply(seed, pair("Название слишком короткое. Отправьте название бота ещё раз.", "Атауы тым қысқа. Бот атауын қайта жіберіңіз."), "ask-name");
    return botReply(seed, pair(
      `Отлично: ${name}. Теперь придумайте username.\n\nОн должен быть латиницей, длиной 5–32 символа и заканчиваться на bot. Например: zakonexpert_bot`,
      `Жақсы: ${name}. Енді username ойлап табыңыз.\n\nОл латын әріптерімен, 5–32 таңба және bot сөзімен аяқталуы керек. Мысалы: zakonexpert_bot`,
    ), "ask-username", { name, username: "" });
  }

  if (lastBot?.botFlow === "ask-username") {
    const username = command.replace(/^@/, "").trim();
    const valid = /^[A-Za-z0-9_]{5,32}$/.test(username) && /bot$/i.test(username);
    if (!valid) return botReply(seed, pair(
      "Такой username не подходит. Используйте 5–32 латинских символа/цифры/_ и окончание bot.\n\nПример: zakonexpert_bot",
      "Бұл username сәйкес емес. 5–32 латын таңбасын/санын/_ және bot аяқталуын қолданыңыз.\n\nМысалы: zakonexpert_bot",
    ), "ask-username", lastBot.botMeta);
    const name = lastBot.botMeta?.name ?? "JELI Bot";
    const token = `jeli_demo_${seed.replace(/[^A-Za-z0-9]/g, "").slice(-24)}`;
    return botReply(seed, pair(
      `Готово. Бот создан в локальном режиме.\n\n${name}\n@${username}\n\nTest token:\n${token}\n\nНе публикуйте токен. Сейчас он работает только как демонстрация этой вкладки.\n\n/mybots — мои боты\n/newbot — создать ещё`,
      `Дайын. Бот жергілікті режимде құрылды.\n\n${name}\n@${username}\n\nTest token:\n${token}\n\nТокенді жарияламаңыз. Қазір ол тек осы қойындыдағы демо ретінде жұмыс істейді.\n\n/mybots — менің боттарым\n/newbot — тағы бір бот құру`,
    ), "created", { name, username });
  }

  return botReply(seed, pair(
    "Используйте команды:\n/newbot — создать бота\n/mybots — мои боты\n/help — помощь",
    "Командаларды қолданыңыз:\n/newbot — бот құру\n/mybots — менің боттарым\n/help — көмек",
  ));
}

// Fictional fixtures only. No contacts are imported and no real users are online.
export function createDemoState(): MessengerState {
  return {
    threads: [
      thread("botjeli", "BotJeli", "🤖", "#18b5ad", "direct", 11, { pinned: true }),
      thread("saved", pair("Вы", "Сіз"), "", "#5b9ecd", "saved", 1, { pinned: true }),
      thread("aigerim", "Айгерим", "А", "#be6978", "direct", 9, { pinned: true, favorite: true, unread: 2 }),
      thread("family", pair("Семья", "Отбасы"), "", "#71a48c", "group", 8, { favorite: true, unread: 3, members: ["aigerim", "daniyar", "asqar"] }),
      thread("daniyar", "Данияр", "Д", "#658db5", "direct", 7),
      thread("team", pair("Наша команда", "Біздің команда"), "", "#aa8a60", "group", 6, { muted: true, members: ["madi", "asqar"] }),
      thread("asqar", "Асқар", "А", "#b28b52", "direct", 5, { unread: 1 }),
      thread("madi", "Мади", "М", "#709c88", "direct", 4),
      thread("weekend", pair("Планы на выходные", "Демалыс жоспары"), "", "#a08bc1", "group", 2, { archived: true, members: ["daniyar", "madi"] }),
      thread("jeli", "JELI", "J", "#15816b", "channel", 3, { following: true }),
      thread("qazaqtech", "Qazaq Tech", "QT", "#608eb6", "channel", 2, { following: false }),
    ],
    messages: {
      botjeli: [{ id: "bj1", mine: false, body: pair("Я BotJeli — системный бот JELI. Я создаю и управляю чат-ботами прямо здесь, в обычной переписке.\n\n/newbot — создать бота\n/mybots — мои боты\n/help — помощь", "Мен BotJeli — JELI жүйелік ботымын. Чат-боттарды осы кәдімгі чаттың ішінде құрамын және басқарамын.\n\n/newbot — бот құру\n/mybots — менің боттарым\n/help — көмек"), at: at("10:45") }],
      saved: [{ id: "s1", mine: true, body: pair("Это чат с самим собой. Здесь можно отправлять себе заметки и файлы.", "Бұл өзіңізбен чат. Мұнда өзіңізге жазбалар мен файлдар жібере аласыз."), at: at("09:00") }],
      aigerim: [
        { id: "a1", mine: false, body: pair("Привет! Как дела?", "Сәлем! Қалайсың?"), at: at("10:31") },
        { id: "a2", mine: true, body: pair("Привет 🙂 Всё хорошо. Как твой день?", "Сәлем 🙂 Бәрі жақсы. Күнің қалай өтіп жатыр?"), at: at("10:33"), starred: true },
        { id: "a3", mine: false, body: pair("Отлично! Вечером увидимся?", "Керемет! Кешке кездесеміз бе?"), at: at("10:35") },
        { id: "a4", mine: true, body: pair("Да, давай в 19:00. Напиши, когда будешь рядом.", "Иә, сағат 19:00-де. Жақындағанда жаз."), at: at("10:37") },
        { id: "a5", mine: false, body: pair("Хорошо, договорились 🤍", "Жақсы, келістік 🤍"), at: at("10:42") },
      ],
      family: [{ id: "f1", mine: false, sender: "Асқар", body: pair("В воскресенье собираемся вместе?", "Жексенбіде бірге жиналамыз ба?"), at: at("10:24") }],
      daniyar: [{ id: "d1", mine: false, body: pair("Спасибо, посмотрю и напишу", "Рақмет, қарап шығып жазамын"), at: at("10:12") }],
      team: [{ id: "t1", mine: false, sender: "Мади", body: pair("Давайте обсудим завтра утром", "Ертең таңертең талқылайық"), at: at("09:48") }],
      asqar: [{ id: "as1", mine: false, body: pair("Сәлем! Ты сейчас занят?", "Сәлем! Қазір боссың ба?"), at: at("09:15") }],
      madi: [{ id: "m1", mine: true, body: pair("Хорошо 👍", "Жақсы 👍"), at: at("08:56") }],
      weekend: [{ id: "w1", mine: false, sender: "Данияр", body: pair("Кто идёт в горы?", "Тауға кім барады?"), at: at("08:00") }],
      jeli: [{ id: "j1", mine: false, body: pair("Добро пожаловать в демо JELI!\n\nЧаты, группы и каналы находятся в привычных разделах. Это пример публикации в канале, а не сообщение действующего сервиса.", "JELI демосына қош келдіңіз!\n\nЧаттар, топтар және арналар үйреншікті бөлімдерде орналасқан. Бұл жұмыс істеп тұрған сервистің хабарламасы емес, арнадағы жарияланым үлгісі."), at: at("09:00") }],
      qazaqtech: [{ id: "qt1", mine: false, body: pair("Пример канала о технологиях. Здесь будут публикации авторов, а не общая лента рекомендаций.", "Технологиялар туралы арна үлгісі. Мұнда жалпы ұсыныстар таспасы емес, авторлардың жазбалары болады."), at: at("08:00") }],
    },
  };
}

export function selectThreads(state: MessengerState, filter: Filter, query: string, archived: boolean, locale: Locale): Thread[] {
  const search = query.trim().toLocaleLowerCase();
  return state.threads.filter(t => {
    if (t.archived !== archived) return false;
    if (t.kind === "channel") {
      if (filter !== "channels" || !t.following) return false;
    } else if (filter === "channels") {
      return false;
    }
    if (filter === "unread" && !t.unread) return false;
    if (filter === "favorites" && !t.favorite) return false;
    if (filter === "groups" && t.kind !== "group") return false;
    return !search || localize(t.name, locale).toLocaleLowerCase().includes(search) || (state.messages[t.id] ?? []).some(m => localize(m.body, locale).toLocaleLowerCase().includes(search));
  }).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.order - a.order);
}

// Session-only demo reducer, not a backend or an authorization boundary.
export function messengerReducer(state: MessengerState, action: Action): MessengerState {
  if (action.type === "create") {
    if (state.threads.some(t => t.id === action.thread.id)) return state;
    return { threads: [action.thread, ...state.threads], messages: { ...state.messages, [action.thread.id]: [] } };
  }
  const chat = state.threads.find(t => t.id === action.chatId);
  if (!chat) return state;
  const list = state.messages[chat.id] ?? [];
  if (action.type === "send") {
    const body = localize(action.message.body, "ru").trim();
    if (chat.kind === "channel" || !action.message.mine || (!body && !action.message.attachment) || body.length > MAX_MESSAGE_LENGTH || list.some(m => m.id === action.message.id)) return state;
    const replyTo = list.some(m => m.id === action.message.replyTo) ? action.message.replyTo : undefined;
    const sent = { ...action.message, body, replyTo };
    const nextOrder = Math.max(...state.threads.map(x => x.order), 0) + 1;
    if (chat.id === "botjeli") {
      const response = botJeliResponse(list, body, action.message.id);
      return {
        threads: state.threads.map(t => t.id === chat.id ? { ...t, archived: false, order: nextOrder } : t),
        messages: { ...state.messages, [chat.id]: [...list, sent, response] },
      };
    }
    return {
      threads: state.threads.map(t => t.id === chat.id ? { ...t, archived: false, order: nextOrder } : t),
      messages: { ...state.messages, [chat.id]: [...list, sent] },
    };
  }
  if (action.type === "edit") {
    const body = action.body.trim();
    if (!body || body.length > MAX_MESSAGE_LENGTH) return state;
    return { ...state, messages: { ...state.messages, [chat.id]: list.map(m => m.id === action.messageId && m.mine ? { ...m, body, edited: true } : m) } };
  }
  if (action.type === "star") {
    return { ...state, messages: { ...state.messages, [chat.id]: list.map(m => m.id === action.messageId ? { ...m, starred: !m.starred } : m) } };
  }
  if (action.type === "remove") {
    return { ...state, messages: { ...state.messages, [chat.id]: list.filter(m => !(m.id === action.messageId && m.mine)) } };
  }
  return { ...state, threads: state.threads.map(t => {
    if (t.id !== chat.id) return t;
    if (action.type === "read") return { ...t, unread: 0 };
    if (action.type === "pin") return { ...t, pinned: !t.pinned };
    if (action.type === "favorite" && t.kind !== "channel" && t.kind !== "saved") return { ...t, favorite: !t.favorite };
    if (action.type === "mute") return { ...t, muted: !t.muted };
    if (action.type === "archive") return { ...t, archived: !t.archived };
    if (action.type === "follow" && t.kind === "channel") return { ...t, following: !t.following };
    return t;
  }) };
}
