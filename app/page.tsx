"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Building2,
  CarFront,
  CheckCheck,
  CircleHelp,
  Compass,
  GraduationCap,
  Hash,
  Heart,
  Home,
  Image as ImageIcon,
  Landmark,
  MapPin,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  PenLine,
  Phone,
  Plus,
  Radio,
  Repeat2,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type View = "feed" | "chats" | "communities" | "services";
type Language = "kz" | "ru";

type Post = {
  id: number;
  author: string;
  handle: string;
  initials: string;
  tone: string;
  time: string;
  location?: string;
  verified?: boolean;
  text: string;
  topic: string;
  likes: number;
  comments: number;
  shares: number;
};

type Chat = {
  id: number;
  name: string;
  initials: string;
  tone: string;
  preview: string;
  time: string;
  unread?: number;
  online?: boolean;
  verified?: boolean;
};

type Message = {
  id: number;
  mine: boolean;
  text: string;
  time: string;
};

const copy = {
  kz: {
    home: "Басты бет",
    chats: "Чаттар",
    communities: "Қауымдар",
    services: "Қызметтер",
    search: "Адамдар, қауымдар және жаңалықтар",
    feed: "Сіздің лентаңыз",
    city: "Талдықорған",
    compose: "Не жаңалық, Жанибек?",
    publish: "Жариялау",
    cancel: "Бас тарту",
    all: "Барлығы",
    local: "Менің қалам",
    business: "Бизнес",
    technology: "Технология",
    suggestions: "Сізге қызық болуы мүмкін",
    popular: "Танымал тақырыптар",
    seeAll: "Барлығын көру",
    messages: "Хабарламалар",
    chatSearch: "Чатты іздеу",
    messagePlaceholder: "Хабарлама жазыңыз...",
    communityTitle: "Өз ортаңызды табыңыз",
    communityIntro: "Қала, қызығушылық және кәсіп бойынша тірі қауымдар.",
    joined: "Қосылдым",
    join: "Қосылу",
    serviceTitle: "Күнделікті қызметтер",
    serviceIntro: "Тексерілген жергілікті мамандар мен ұйымдар — бір жерде.",
    newPost: "Жаңа жазба",
    postPlaceholder: "Ойыңызды жазыңыз...",
    photo: "Фото",
    topic: "Тақырып",
  },
  ru: {
    home: "Главная",
    chats: "Чаты",
    communities: "Сообщества",
    services: "Сервисы",
    search: "Люди, сообщества и новости",
    feed: "Ваша лента",
    city: "Талдыкорган",
    compose: "Что нового, Жанибек?",
    publish: "Опубликовать",
    cancel: "Отмена",
    all: "Всё",
    local: "Мой город",
    business: "Бизнес",
    technology: "Технологии",
    suggestions: "Может быть интересно",
    popular: "Популярные темы",
    seeAll: "Смотреть всё",
    messages: "Сообщения",
    chatSearch: "Поиск чатов",
    messagePlaceholder: "Напишите сообщение...",
    communityTitle: "Найдите своё сообщество",
    communityIntro: "Живые сообщества по городу, интересам и профессии.",
    joined: "Вы вступили",
    join: "Вступить",
    serviceTitle: "Сервисы на каждый день",
    serviceIntro: "Проверенные местные специалисты и организации — в одном месте.",
    newPost: "Новая публикация",
    postPlaceholder: "Поделитесь мыслью...",
    photo: "Фото",
    topic: "Тема",
  },
};

const initialPosts: Post[] = [
  {
    id: 1,
    author: "Айдана Сәрсен",
    handle: "@aidana.s",
    initials: "АС",
    tone: "from-[#08A89D] to-[#006E7A]",
    time: "12 мин",
    location: "Алматы",
    verified: true,
    topic: "#қала",
    text: "Алматыда сенбі күні жас кәсіпкерлердің ашық кездесуі өтеді. Тәжірибе, серіктес және нақты байланыс іздегендерге пайдалы болады. Кім барады?",
    likes: 284,
    comments: 37,
    shares: 18,
  },
  {
    id: 2,
    author: "Qazaq Tech",
    handle: "@qazaqtech",
    initials: "QT",
    tone: "from-[#7761FF] to-[#4537C8]",
    time: "41 мин",
    topic: "#технология",
    verified: true,
    text: "Қазақстандық әзірлеушілерге арналған жаңа грант бағдарламасының өтінімдері ашылды. Командада кемінде екі адам болуы керек, алғашқы өнімнің прототипі жеткілікті.",
    likes: 916,
    comments: 104,
    shares: 221,
  },
  {
    id: 3,
    author: "Нұржан Әлиев",
    handle: "@nurzhankz",
    initials: "НА",
    tone: "from-[#E29B3B] to-[#B96320]",
    time: "1 сағ",
    location: "Астана",
    topic: "#бизнес",
    text: "Шағын бизнеске ең керегі — көп кеңес емес, алғашқы 10 тұрақты клиент. Осы аптада жергілікті кәсіпкерлерге сату процесін тегін талдап беремін.",
    likes: 153,
    comments: 29,
    shares: 11,
  },
];

const chats: Chat[] = [
  { id: 1, name: "Айдана", initials: "А", tone: "bg-[#E75480]", preview: "Жақсы, кешке сөйлесеміз", time: "10:42", unread: 2, online: true },
  { id: 2, name: "Qazyna командасы", initials: "Q", tone: "bg-[#00A99D]", preview: "Дизайн нұсқасын жібердім", time: "09:18", verified: true },
  { id: 3, name: "Бизнес Талдықорған", initials: "БТ", tone: "bg-[#7357D9]", preview: "Асқар: Кездесу қай жерде?", time: "кеше", unread: 5 },
  { id: 4, name: "Данияр К.", initials: "ДК", tone: "bg-[#D9842B]", preview: "Рақмет!", time: "сс", online: true },
  { id: 5, name: "Отбасы", initials: "О", tone: "bg-[#3976C8]", preview: "Фото", time: "дс" },
];

const initialMessages: Record<number, Message[]> = {
  1: [
    { id: 1, mine: false, text: "Сәлем! Бүгін орталыққа барасың ба?", time: "10:31" },
    { id: 2, mine: true, text: "Сәлем! Иә, түстен кейін барамын.", time: "10:35" },
    { id: 3, mine: false, text: "Жақсы, кешке сөйлесеміз", time: "10:42" },
  ],
  2: [
    { id: 1, mine: false, text: "Басты экранның жаңа дизайны дайын.", time: "09:12" },
    { id: 2, mine: false, text: "Дизайн нұсқасын жібердім", time: "09:18" },
  ],
  3: [{ id: 1, mine: false, text: "Кездесу қай жерде?", time: "кеше" }],
  4: [{ id: 1, mine: false, text: "Рақмет!", time: "сс" }],
  5: [{ id: 1, mine: false, text: "Демалыста түскен фото", time: "дс" }],
};

const communities = [
  { id: 1, name: "Алматы бүгін", description: "Қала жаңалықтары, орындар, оқиғалар", members: "128 мың", initials: "AL", tone: "from-[#15A7A0] to-[#05747F]", tag: "Қала" },
  { id: 2, name: "Қазақстан кәсіпкерлері", description: "Тәжірибе, серіктестік және өсу", members: "84 мың", initials: "KZ", tone: "from-[#7357D9] to-[#4A369A]", tag: "Бизнес" },
  { id: 3, name: "Ата-аналар ортасы", description: "Балалар, оқу және пайдалы кеңестер", members: "61 мың", initials: "AO", tone: "from-[#E98D45] to-[#BC592F]", tag: "Отбасы" },
  { id: 4, name: "Qazaq Developers", description: "Код, өнім және бос жұмыс орындары", members: "39 мың", initials: "QD", tone: "from-[#2A7AD7] to-[#2450A3]", tag: "IT" },
];

const services = [
  { name: "Дәрігерлер", description: "Қабылдауға жазылу", icon: Stethoscope, color: "bg-[#DDF7F4] text-[#087E76]" },
  { name: "Білім", description: "Курстар мен мұғалімдер", icon: GraduationCap, color: "bg-[#EAE5FF] text-[#664CC4]" },
  { name: "Жұмыс", description: "Жергілікті вакансиялар", icon: BriefcaseBusiness, color: "bg-[#FFF0D9] text-[#A45B12]" },
  { name: "Көлік", description: "Шеберлер мен қызметтер", icon: CarFront, color: "bg-[#E1ECFF] text-[#2C68B8]" },
  { name: "Мемқызметтер", description: "Қажетті сілтемелер", icon: Landmark, color: "bg-[#E3F3E7] text-[#2E7C45]" },
  { name: "Компаниялар", description: "Тексерілген бизнес", icon: Building2, color: "bg-[#FDE8EF] text-[#B7426D]" },
];

function Avatar({ initials, tone, size = "md", online = false }: { initials: string; tone: string; size?: "sm" | "md" | "lg"; online?: boolean }) {
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm", tone, size === "sm" && "h-9 w-9 text-xs", size === "md" && "h-11 w-11 text-sm", size === "lg" && "h-14 w-14 text-base")}>
      {initials}
      {online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#27C76F]" />}
    </span>
  );
}

export default function HomePage() {
  const [view, setView] = useState<View>("feed");
  const [language, setLanguage] = useState<Language>("kz");
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [feedFilter, setFeedFilter] = useState("all");
  const [selectedChat, setSelectedChat] = useState(1);
  const [messages, setMessages] = useState(initialMessages);
  const [messageDraft, setMessageDraft] = useState("");
  const [chatQuery, setChatQuery] = useState("");
  const [joined, setJoined] = useState<Set<number>>(new Set([2]));
  const t = copy[language];

  const activeChat = chats.find((chat) => chat.id === selectedChat) ?? chats[0];
  const filteredChats = useMemo(
    () => chats.filter((chat) => chat.name.toLowerCase().includes(chatQuery.toLowerCase())),
    [chatQuery],
  );

  function publishPost() {
    const value = draft.trim();
    if (!value) return;
    setPosts((current) => [{ id: Date.now(), author: "Жанибек Қияшев", handle: "@zhanibek", initials: "ЖҚ", tone: "from-[#00A99D] to-[#006E7A]", time: language === "kz" ? "қазір" : "сейчас", location: t.city, verified: true, topic: "#ой", text: value, likes: 0, comments: 0, shares: 0 }, ...current]);
    setDraft("");
    setComposerOpen(false);
  }

  function toggleLike(id: number) {
    setLikedPosts((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    const value = messageDraft.trim();
    if (!value) return;
    setMessages((current) => ({ ...current, [selectedChat]: [...(current[selectedChat] ?? []), { id: Date.now(), mine: true, text: value, time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) }] }));
    setMessageDraft("");
  }

  const navItems = [
    { id: "feed" as View, label: t.home, icon: Home },
    { id: "chats" as View, label: t.chats, icon: MessageCircle, badge: 7 },
    { id: "communities" as View, label: t.communities, icon: UsersRound },
    { id: "services" as View, label: t.services, icon: Compass },
  ];

  return (
    <main className="min-h-dvh bg-[#EEF2F5] text-[#17212B]">
      <header className="sticky top-0 z-40 border-b border-[#DCE3E8] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6">
          <button className="flex items-center gap-2" onClick={() => setView("feed")} aria-label="Qazyna">
            <span className="qazyna-mark">Q</span>
            <span className="text-xl font-black tracking-[-0.04em] text-[#102D35]">Qazyna</span>
          </button>
          <div className="relative ml-auto hidden w-full max-w-[520px] md:block">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8B95]" />
            <Input className="h-10 rounded-full border-transparent bg-[#F1F4F6] pl-10 shadow-none focus-visible:border-[#00A99D] focus-visible:ring-[#00A99D]/15" placeholder={t.search} />
          </div>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Button variant="ghost" size="icon" className="relative rounded-full text-[#4F616B]" aria-label="Уведомления">
              <Bell />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#EF5D67] ring-2 ring-white" />
            </Button>
            <button className="lang-switch" onClick={() => setLanguage((current) => current === "kz" ? "ru" : "kz")} aria-label="Сменить язык">
              <span className={language === "kz" ? "active" : ""}>ҚАЗ</span><span className={language === "ru" ? "active" : ""}>RU</span>
            </button>
            <Avatar initials="ЖҚ" tone="from-[#00A99D] to-[#006E7A]" size="sm" />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-5 px-0 pb-24 md:px-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,720px)_300px]">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] flex-col py-6 lg:flex">
          <nav className="space-y-1.5" aria-label="Основная навигация">
            {navItems.map((item) => {
              const Icon = item.icon;
              return <button key={item.id} className={cn("side-nav-item", view === item.id && "active")} onClick={() => setView(item.id)}><Icon className="h-5 w-5" /><span>{item.label}</span>{item.badge && <span className="ml-auto rounded-full bg-[#EF5D67] px-2 py-0.5 text-xs font-bold text-white">{item.badge}</span>}</button>;
            })}
          </nav>
          <Button className="mt-5 h-11 rounded-2xl bg-[#00A99D] font-bold text-white shadow-[0_10px_24px_rgba(0,169,157,.22)] hover:bg-[#008F85]" onClick={() => { setView("feed"); setComposerOpen(true); }}><PenLine /> {t.newPost}</Button>
          <div className="mt-auto space-y-1">
            <button className="side-nav-item text-[#647680]"><Settings className="h-5 w-5" /> Баптаулар</button>
            <button className="side-nav-item text-[#647680]"><CircleHelp className="h-5 w-5" /> Көмек</button>
          </div>
          <p className="mt-4 px-3 text-xs leading-5 text-[#8A99A1]">© 2026 Qazyna · Қазақстанда жасалған</p>
        </aside>

        <section className="min-w-0 py-0 md:py-5">
          {view === "feed" && <FeedView t={t} posts={posts} likedPosts={likedPosts} composerOpen={composerOpen} draft={draft} feedFilter={feedFilter} setComposerOpen={setComposerOpen} setDraft={setDraft} setFeedFilter={setFeedFilter} publishPost={publishPost} toggleLike={toggleLike} />}
          {view === "chats" && <ChatsView t={t} activeChat={activeChat} selectedChat={selectedChat} setSelectedChat={setSelectedChat} filteredChats={filteredChats} chatQuery={chatQuery} setChatQuery={setChatQuery} messages={messages[selectedChat] ?? []} messageDraft={messageDraft} setMessageDraft={setMessageDraft} sendMessage={sendMessage} />}
          {view === "communities" && <CommunitiesView t={t} joined={joined} setJoined={setJoined} />}
          {view === "services" && <ServicesView t={t} />}
        </section>

        <RightRail t={t} className={view === "chats" ? "xl:hidden" : ""} />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#DCE3E8] bg-white/96 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden" aria-label="Мобильная навигация">
        <div className="mx-auto flex max-w-xl items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} className={cn("mobile-nav-item", view === item.id && "active")} onClick={() => setView(item.id)}><span className="relative"><Icon className="h-5 w-5" />{item.badge && <span className="absolute -right-2 -top-1 h-2 w-2 rounded-full bg-[#EF5D67]" />}</span><span>{item.label}</span></button>;
          })}
        </div>
      </nav>
    </main>
  );
}

function FeedView({ t, posts, likedPosts, composerOpen, draft, feedFilter, setComposerOpen, setDraft, setFeedFilter, publishPost, toggleLike }: { t: typeof copy.kz; posts: Post[]; likedPosts: Set<number>; composerOpen: boolean; draft: string; feedFilter: string; setComposerOpen: (value: boolean) => void; setDraft: (value: string) => void; setFeedFilter: (value: string) => void; publishPost: () => void; toggleLike: (id: number) => void; }) {
  const filters = [{ id: "all", label: t.all }, { id: "local", label: t.local }, { id: "business", label: t.business }, { id: "tech", label: t.technology }];
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="border-b border-[#E0E6EA] bg-white px-4 pb-3 pt-4 md:rounded-t-[24px] md:border md:px-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-extrabold tracking-tight">{t.feed}</h1><button className="mt-1 flex items-center gap-1 text-sm font-semibold text-[#008F85]"><MapPin className="h-3.5 w-3.5" />{t.city}</button></div>
          <Button variant="ghost" size="icon" className="rounded-full md:hidden"><Search /></Button>
        </div>
        <div className="scrollbar-none -mx-1 mt-4 flex gap-2 overflow-x-auto px-1">{filters.map((filter) => <button key={filter.id} onClick={() => setFeedFilter(filter.id)} className={cn("filter-pill", feedFilter === filter.id && "active")}>{filter.label}</button>)}</div>
      </div>

      <article className="surface-card rounded-none px-4 py-4 md:rounded-[24px] md:px-5">
        <div className="flex gap-3">
          <Avatar initials="ЖҚ" tone="from-[#00A99D] to-[#006E7A]" />
          {!composerOpen ? <button className="h-11 flex-1 rounded-2xl bg-[#F1F4F6] px-4 text-left text-base text-[#7B8C95] transition hover:bg-[#E9EEF1]" onClick={() => setComposerOpen(true)}>{t.compose}</button> : (
            <div className="min-w-0 flex-1">
              <Textarea autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t.postPlaceholder} className="min-h-28 rounded-2xl border-[#DDE5E9] bg-[#F8FAFB] text-base shadow-none focus-visible:border-[#00A99D] focus-visible:ring-[#00A99D]/15" />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm" className="rounded-xl text-[#547078]"><ImageIcon /> {t.photo}</Button><Button variant="ghost" size="sm" className="rounded-xl text-[#547078]"><Hash /> {t.topic}</Button>
                <div className="ml-auto flex gap-2"><Button variant="ghost" size="sm" className="rounded-xl" onClick={() => { setComposerOpen(false); setDraft(""); }}>{t.cancel}</Button><Button size="sm" className="rounded-xl bg-[#00A99D] px-4 hover:bg-[#008F85]" disabled={!draft.trim()} onClick={publishPost}>{t.publish}</Button></div>
              </div>
            </div>
          )}
        </div>
        {!composerOpen && <div className="mt-3 flex items-center gap-2 border-t border-[#EDF1F3] pt-3 pl-14"><button className="composer-action"><ImageIcon /> {t.photo}</button><button className="composer-action"><Hash /> {t.topic}</button></div>}
      </article>

      {posts.map((post) => {
        const liked = likedPosts.has(post.id);
        return (
          <article key={post.id} className="surface-card rounded-none p-4 md:rounded-[24px] md:p-5">
            <div className="flex gap-3">
              <Avatar initials={post.initials} tone={post.tone} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <div className="min-w-0"><div className="flex items-center gap-1.5"><h2 className="truncate font-bold">{post.author}</h2>{post.verified && <BadgeCheck className="h-4 w-4 shrink-0 fill-[#00A99D] text-white" />}</div><div className="flex flex-wrap items-center gap-1.5 text-[13px] text-[#82919A]"><span>{post.handle}</span><span>·</span><span>{post.time}</span>{post.location && <><span>·</span><span>{post.location}</span></>}</div></div>
                  <Button variant="ghost" size="icon-sm" className="ml-auto rounded-full text-[#8A99A1]"><MoreHorizontal /></Button>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-[15.5px] leading-6 text-[#21333D] md:text-base">{post.text}</p>
                <button className="mt-2 text-sm font-semibold text-[#008F85]">{post.topic}</button>
                <div className="mt-4 flex items-center justify-between border-t border-[#EDF1F3] pt-3 text-[#6D7E87]">
                  <button className={cn("post-action", liked && "liked")} onClick={() => toggleLike(post.id)}><Heart className={cn(liked && "fill-current")} /><span>{post.likes + (liked ? 1 : 0)}</span></button><button className="post-action"><MessageSquare /><span>{post.comments}</span></button><button className="post-action"><Repeat2 /><span>{post.shares}</span></button><button className="post-action" aria-label="Поделиться"><Send /></button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ChatsView({ t, activeChat, selectedChat, setSelectedChat, filteredChats, chatQuery, setChatQuery, messages, messageDraft, setMessageDraft, sendMessage }: { t: typeof copy.kz; activeChat: Chat; selectedChat: number; setSelectedChat: (id: number) => void; filteredChats: Chat[]; chatQuery: string; setChatQuery: (value: string) => void; messages: Message[]; messageDraft: string; setMessageDraft: (value: string) => void; sendMessage: (event: FormEvent) => void; }) {
  return (
    <div className="chat-shell md:rounded-[24px]">
      <aside className="chat-list">
        <div className="flex items-center justify-between px-4 pb-3 pt-4"><h1 className="text-xl font-extrabold">{t.messages}</h1><Button size="icon-sm" className="rounded-full bg-[#00A99D] hover:bg-[#008F85]" aria-label="Новый чат"><Plus /></Button></div>
        <div className="relative px-3 pb-3"><Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-[calc(50%+6px)] text-[#89979F]" /><Input value={chatQuery} onChange={(event) => setChatQuery(event.target.value)} placeholder={t.chatSearch} className="h-10 rounded-xl border-transparent bg-[#F1F4F6] pl-10 shadow-none" /></div>
        <div className="scrollbar-thin flex gap-2 overflow-x-auto px-3 pb-3 md:block md:h-[calc(100%-116px)] md:space-y-1 md:overflow-y-auto md:pb-4">
          {filteredChats.map((chat) => <button key={chat.id} onClick={() => setSelectedChat(chat.id)} className={cn("chat-row", selectedChat === chat.id && "active")}><Avatar initials={chat.initials} tone={chat.tone} online={chat.online} /><span className="hidden min-w-0 flex-1 text-left md:block"><span className="flex items-center gap-1 font-bold"><span className="truncate">{chat.name}</span>{chat.verified && <BadgeCheck className="h-4 w-4 fill-[#00A99D] text-white" />}</span><span className="mt-0.5 block truncate text-sm text-[#7B8B94]">{chat.preview}</span></span><span className="hidden shrink-0 self-start text-right md:block"><span className="block text-xs text-[#91A0A8]">{chat.time}</span>{chat.unread && <span className="mt-1 inline-flex min-w-5 justify-center rounded-full bg-[#00A99D] px-1.5 py-0.5 text-xs font-bold text-white">{chat.unread}</span>}</span></button>)}
        </div>
      </aside>

      <section className="message-panel">
        <header className="flex h-[70px] items-center gap-3 border-b border-[#E6ECEF] bg-white px-4"><Avatar initials={activeChat.initials} tone={activeChat.tone} online={activeChat.online} size="sm" /><div className="min-w-0"><div className="flex items-center gap-1 font-bold"><span className="truncate">{activeChat.name}</span>{activeChat.verified && <BadgeCheck className="h-4 w-4 fill-[#00A99D] text-white" />}</div><p className="text-[13px] text-[#00A99D]">{activeChat.online ? "онлайн" : "жақында кірді"}</p></div><div className="ml-auto flex gap-1"><Button variant="ghost" size="icon" className="rounded-full text-[#60747E]"><Phone /></Button><Button variant="ghost" size="icon" className="rounded-full text-[#60747E]"><Video /></Button><Button variant="ghost" size="icon" className="rounded-full text-[#60747E]"><MoreHorizontal /></Button></div></header>
        <div className="message-background scrollbar-thin flex min-h-[430px] flex-1 flex-col overflow-y-auto p-4"><div className="mx-auto mb-5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#71838C] shadow-sm">Бүгін</div><div className="mt-auto space-y-2">{messages.map((message) => <div key={message.id} className={cn("flex", message.mine ? "justify-end" : "justify-start")}><div className={cn("message-bubble", message.mine ? "mine" : "theirs")}><p>{message.text}</p><span>{message.time}{message.mine && <CheckCheck className="h-3.5 w-3.5 text-[#008F85]" />}</span></div></div>)}</div></div>
        <form className="flex items-end gap-2 border-t border-[#E5EBEE] bg-white p-3" onSubmit={sendMessage}><Button type="button" variant="ghost" size="icon" className="rounded-full text-[#72838C]"><Paperclip /></Button><Input value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder={t.messagePlaceholder} className="h-11 flex-1 rounded-2xl border-transparent bg-[#F1F4F6] px-4 text-base shadow-none focus-visible:border-[#00A99D] focus-visible:ring-[#00A99D]/15" /><Button type="submit" size="icon" className="h-11 w-11 rounded-full bg-[#00A99D] shadow-md hover:bg-[#008F85]" disabled={!messageDraft.trim()}><Send /></Button></form>
      </section>
    </div>
  );
}

function CommunitiesView({ t, joined, setJoined }: { t: typeof copy.kz; joined: Set<number>; setJoined: (value: Set<number>) => void }) {
  function toggleCommunity(id: number) { const next = new Set(joined); if (next.has(id)) next.delete(id); else next.add(id); setJoined(next); }
  return (
    <div className="surface-card min-h-[680px] rounded-none p-4 md:rounded-[24px] md:p-6">
      <div className="rounded-[22px] bg-[linear-gradient(125deg,#0B3036,#006E74_58%,#00A99D)] p-6 text-white md:p-8"><div className="flex items-center gap-2 text-sm font-bold text-[#A9F0E7]"><UsersRound className="h-4 w-4" /> QAZYNA ҚАУЫМ</div><h1 className="mt-3 max-w-md text-3xl font-black tracking-tight md:text-4xl">{t.communityTitle}</h1><p className="mt-3 max-w-lg text-base leading-7 text-white/75">{t.communityIntro}</p><div className="relative mt-6 max-w-md"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" /><Input placeholder={t.search} className="h-12 rounded-2xl border-white/15 bg-white/12 pl-11 text-white shadow-none placeholder:text-white/55 focus-visible:border-white/40 focus-visible:ring-white/10" /></div></div>
      <div className="mt-7 flex items-center justify-between"><h2 className="text-xl font-extrabold">{t.suggestions}</h2><button className="text-sm font-bold text-[#008F85]">{t.seeAll}</button></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{communities.map((community) => { const isJoined = joined.has(community.id); return <article key={community.id} className="rounded-[22px] border border-[#E3E9EC] p-4 transition hover:-translate-y-0.5 hover:border-[#B8DAD6] hover:shadow-lg hover:shadow-[#173A3C]/5"><div className="flex items-start gap-3"><Avatar initials={community.initials} tone={community.tone} size="lg" /><Badge variant="secondary" className="ml-auto bg-[#F0F4F6] text-[#61737C]">{community.tag}</Badge></div><h3 className="mt-4 text-lg font-extrabold">{community.name}</h3><p className="mt-1 min-h-10 text-sm leading-5 text-[#71828B]">{community.description}</p><div className="mt-4 flex items-center justify-between"><span className="text-sm font-semibold text-[#7D8D95]">{community.members} мүше</span><Button onClick={() => toggleCommunity(community.id)} variant={isJoined ? "secondary" : "default"} size="sm" className={cn("rounded-xl", !isJoined && "bg-[#00A99D] hover:bg-[#008F85]")}>{isJoined ? <><CheckCheck />{t.joined}</> : <><Plus />{t.join}</>}</Button></div></article>; })}</div>
    </div>
  );
}

function ServicesView({ t }: { t: typeof copy.kz }) {
  return (
    <div className="space-y-4">
      <section className="surface-card rounded-none p-5 md:rounded-[24px] md:p-7"><div className="flex items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-bold text-[#008F85]"><ShieldCheck className="h-4 w-4" /> QAZYNA SENIM</p><h1 className="mt-2 text-3xl font-black tracking-tight">{t.serviceTitle}</h1><p className="mt-2 max-w-xl leading-7 text-[#6F818A]">{t.serviceIntro}</p></div><div className="hidden rounded-2xl bg-[#E2F7F4] p-3 text-[#008F85] sm:block"><Sparkles className="h-7 w-7" /></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => { const Icon = service.icon; return <button key={service.name} className="group rounded-[20px] border border-[#E3E9EC] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#B9DCD7] hover:shadow-lg hover:shadow-[#173A3C]/5"><span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", service.color)}><Icon className="h-5 w-5" /></span><span className="mt-4 block font-extrabold">{service.name}</span><span className="mt-1 block text-sm text-[#778891]">{service.description}</span></button>; })}</div></section>
      <section className="surface-card rounded-none p-5 md:rounded-[24px] md:p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Ұсынылған мамандар</h2><button className="text-sm font-bold text-[#008F85]">{t.seeAll}</button></div><div className="mt-4 divide-y divide-[#E8EDF0]">{[{ name: "ZakonExpert", type: "Құқықтық сервис", initials: "ZE", tone: "from-[#00A99D] to-[#006E7A]", rating: "4.9" }, { name: "Densaulyq Clinic", type: "Медициналық орталық", initials: "DC", tone: "from-[#367ED1] to-[#2454A3]", rating: "4.8" }, { name: "Bastau Academy", type: "Оқу орталығы", initials: "BA", tone: "from-[#7458D9] to-[#4D399F]", rating: "4.9" }].map((item) => <button key={item.name} className="flex w-full items-center gap-3 py-4 text-left"><Avatar initials={item.initials} tone={item.tone} /><span className="min-w-0 flex-1"><span className="flex items-center gap-1 font-bold">{item.name}<BadgeCheck className="h-4 w-4 fill-[#00A99D] text-white" /></span><span className="mt-0.5 block text-sm text-[#7B8C95]">{item.type}</span></span><span className="rounded-full bg-[#FFF4D8] px-2.5 py-1 text-sm font-extrabold text-[#946311]">★ {item.rating}</span></button>)}</div></section>
    </div>
  );
}

function RightRail({ t, className }: { t: typeof copy.kz; className?: string }) {
  return (
    <aside className={cn("sticky top-16 hidden h-[calc(100dvh-4rem)] py-5 xl:block", className)}>
      <section className="surface-card rounded-[22px] p-5"><div className="flex items-center justify-between"><h2 className="font-extrabold">{t.popular}</h2><Radio className="h-4 w-4 text-[#00A99D]" /></div><div className="mt-4 space-y-4">{[{ topic: "#Қазақстан", count: "12,4 мың жазба" }, { topic: "#Кәсіпкерлік", count: "8,7 мың жазба" }, { topic: "#Алматы", count: "6,2 мың жазба" }, { topic: "#QazaqTech", count: "4,9 мың жазба" }].map((trend, index) => <button key={trend.topic} className="group flex w-full items-start gap-3 text-left"><span className="mt-0.5 text-xs font-black text-[#ABB6BC]">0{index + 1}</span><span><span className="block font-bold transition group-hover:text-[#008F85]">{trend.topic}</span><span className="mt-0.5 block text-xs text-[#8A99A1]">{trend.count}</span></span></button>)}</div></section>
      <section className="mt-4 overflow-hidden rounded-[22px] bg-[#102F35] p-5 text-white shadow-xl shadow-[#102F35]/10"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#66E1D5]"><ShieldCheck /></span><h2 className="mt-4 text-lg font-extrabold">Сенім белгісі</h2><p className="mt-2 text-sm leading-6 text-white/65">Расталған адамдар мен компанияларды бірден таныңыз.</p><Button variant="secondary" size="sm" className="mt-4 rounded-xl bg-white text-[#14333A] hover:bg-[#E7F5F3]">Толығырақ</Button></section>
    </aside>
  );
}
