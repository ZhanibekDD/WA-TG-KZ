"use client";

import { useEffect, useReducer, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Dialog, DropdownMenu, Popover } from "radix-ui";
import { Archive, ArrowLeft, BellOff, Bookmark, Camera, Check, ChevronDown, ChevronRight, CircleHelp, CircleUserRound, Clock3, Copy, FileText, Info, Languages, Megaphone, MessageCircle, MessageSquarePlus, Mic, MoreVertical, Palette, Paperclip, Pencil, Phone, Pin, Plus, Reply, Search, Send, Shield, Smile, Trash2, UsersRound, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { contacts, createDemoState, localize, MAX_ATTACHMENT_BYTES, MAX_MESSAGE_LENGTH, MAX_SESSION_ATTACHMENT_BYTES, messengerReducer, selectThreads, type Attachment, type Filter, type Locale, type Message, type Thread } from "@/lib/messenger";
import { messengerCopy, type MessengerCopy } from "@/lib/messenger-copy";

type View = "chats" | "updates" | "communities" | "calls" | "settings";
type Modal = "new" | "about" | "call" | "voice" | "info" | "status" | "view-status" | null;
type Draft = { text: string; replyTo?: string; editing?: string; attachment?: Attachment };
const emptyDraft: Draft = { text: "" };
const clock = (at: string) => new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Almaty" }).format(new Date(at));
const uid = () => crypto.randomUUID();

function Avatar({ chat, small = false }: { chat: Pick<Thread, "initials" | "color" | "kind">; small?: boolean }) {
  const Icon = chat.kind === "group" ? UsersRound : chat.kind === "saved" ? Bookmark : chat.kind === "channel" ? Megaphone : null;
  return <span aria-hidden="true" className={cn("avatar", small && "small")} style={{ background: chat.color }}>{Icon ? <Icon /> : chat.initials}</span>;
}

function MenuItem({ children, action, danger = false }: { children: ReactNode; action: () => void; danger?: boolean }) {
  return <DropdownMenu.Item className={cn("menu-item", danger && "danger")} onSelect={action}>{children}</DropdownMenu.Item>;
}

function ChatMenu({ chat, t, act }: { chat: Thread; t: MessengerCopy; act: (type: "pin" | "mute" | "archive") => void }) {
  return <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild><Button variant="ghost" size="icon" className="icon-button" aria-label={t.more}><MoreVertical /></Button></DropdownMenu.Trigger>
    <DropdownMenu.Portal><DropdownMenu.Content className="context-menu" align="end" sideOffset={6}>
      <MenuItem action={() => act("pin")}><Pin />{chat.pinned ? t.unpin : t.pin}</MenuItem>
      <MenuItem action={() => act("mute")}><BellOff />{chat.muted ? t.unmute : t.mute}</MenuItem>
      <MenuItem action={() => act("archive")}><Archive />{chat.archived ? t.unarchive : t.archive}</MenuItem>
    </DropdownMenu.Content></DropdownMenu.Portal>
  </DropdownMenu.Root>;
}

export default function HomePage() {
  const [state, dispatch] = useReducer(messengerReducer, undefined, createDemoState);
  const [locale, setLocale] = useState<Locale>("ru");
  const [accent, setAccent] = useState<"green" | "blue">("green");
  const [view, setView] = useState<View>("chats");
  const [activeId, setActiveId] = useState("aigerim");
  const [opened, setOpened] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [archived, setArchived] = useState(false);
  const [listSearchOpen, setListSearchOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [messageQuery, setMessageQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [modal, setModal] = useState<Modal>(null);
  const [newKind, setNewKind] = useState<"direct" | "group">("direct");
  const [groupName, setGroupName] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contactQuery, setContactQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ chatId: string; messageId: string } | null>(null);
  const [statusDraft, setStatusDraft] = useState("");
  const [myStatus, setMyStatus] = useState("");
  const [viewedStatus, setViewedStatus] = useState<{ name: string; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const composeRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const modalOpener = useRef<HTMLElement | null>(null);
  const focusComposerAfterMenu = useRef(false);
  const fileUrls = useRef(new Map<string, number>());
  const t = messengerCopy[locale];
  const active = state.threads.find(chat => chat.id === activeId)!;
  const messages = state.messages[activeId] ?? [];
  const draft = drafts[activeId] ?? emptyDraft;
  const filtered = selectThreads(state, filter, query, archived, locale);
  const unread = state.threads.filter(chat => !chat.archived).reduce((sum, chat) => sum + chat.unread, 0);
  const archiveCount = state.threads.filter(chat => chat.archived).length;
  const visibleMessages = messages.filter(message => localize(message.body, locale).toLocaleLowerCase().includes(messageQuery.toLocaleLowerCase()));
  const searchContacts = contacts.filter(contact => contact.name.toLocaleLowerCase().includes(contactQuery.toLocaleLowerCase()));
  const replyMessage = messages.find(message => message.id === draft.replyTo);
  const communitiesLabel = locale === "ru" ? "Сообщества" : "Қауымдастықтар";
  const viewLabels: Record<View, string> = { chats: t.chats, updates: t.updates, communities: communitiesLabel, calls: t.calls, settings: t.settings };
  const viewLabel = viewLabels[view];
  const nav = [
    { id: "chats" as const, label: t.chats, icon: MessageCircle },
    { id: "updates" as const, label: t.updates, icon: Megaphone },
    { id: "communities" as const, label: communitiesLabel, icon: UsersRound },
    { id: "calls" as const, label: t.calls, icon: Phone },
  ];

  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant", block: "end" });
  }, [activeId, messages.length, opened]);
  useEffect(() => {
    const urls = fileUrls.current;
    return () => { urls.forEach((_, url) => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);

  function updateDraft(patch: Partial<Draft>) {
    setDrafts(current => ({ ...current, [activeId]: { ...(current[activeId] ?? emptyDraft), ...patch } }));
  }
  function resetComposition() {
    updateDraft({ text: "", replyTo: undefined, editing: undefined });
  }
  function openChat(id: string) {
    setActiveId(id);
    setOpened(true);
    setSearchOpen(false);
    setMessageQuery("");
    dispatch({ type: "read", chatId: id });
  }
  function switchView(next: View) {
    setView(next);
    setOpened(false);
    setListSearchOpen(false);
    setSearchOpen(false);
    setMessageQuery("");
    if (next === "chats") { setArchived(false); setQuery(""); }
  }
  function send(event?: FormEvent) {
    event?.preventDefault();
    if (active.kind === "channel") return;
    if (draft.text.trim().length > MAX_MESSAGE_LENGTH) { setNotice(t.tooLong); return; }
    if (draft.editing) {
      if (!draft.text.trim()) return;
      dispatch({ type: "edit", chatId: activeId, messageId: draft.editing, body: draft.text });
      releaseAttachment(draft.attachment);
    } else {
      if (!draft.text.trim() && !draft.attachment) return;
      dispatch({ type: "send", chatId: activeId, message: { id: uid(), body: draft.text, mine: true, at: new Date().toISOString(), replyTo: draft.replyTo, attachment: draft.attachment } });
    }
    setDrafts(current => ({ ...current, [activeId]: { text: "" } }));
    setNotice(t.noDelivery);
    composeRef.current?.focus();
  }
  function newChat() {
    setNewKind("direct"); setGroupName(""); setSelectedContacts([]); setContactQuery(""); setModal("new");
  }
  function startDirect(id: string) {
    setView("chats"); setArchived(false); setQuery(""); setFilter("all");
    const existing = state.threads.find(chat => chat.id === id);
    if (existing?.archived) dispatch({ type: "archive", chatId: id });
    setModal(null); openChat(id);
  }
  function createGroup(event: FormEvent) {
    event.preventDefault();
    if (!groupName.trim() || !selectedContacts.length) { setNotice(t.missingMembers); return; }
    const id = uid();
    dispatch({ type: "create", thread: { id, name: groupName.trim(), initials: "", color: "#638eae", kind: "group", members: [...selectedContacts], unread: 0, pinned: false, muted: false, archived: false, order: Math.max(...state.threads.map(chat => chat.order), 0) + 1 } });
    setView("chats"); setArchived(false); setFilter("all"); setQuery(""); setModal(null); openChat(id);
  }
  function releaseAttachment(attachment?: Attachment) {
    if (!attachment) return;
    URL.revokeObjectURL(attachment.url);
    fileUrls.current.delete(attachment.url);
  }
  function attach(file: File | undefined) {
    if (!file) return;
    const used = [...fileUrls.current.values()].reduce((sum, size) => sum + size, 0) - (draft.attachment?.size ?? 0);
    if (file.size > MAX_ATTACHMENT_BYTES || used + file.size > MAX_SESSION_ATTACHMENT_BYTES) { setNotice(t.fileLimit); return; }
    releaseAttachment(draft.attachment);
    const url = URL.createObjectURL(file);
    fileUrls.current.set(url, file.size);
    // SVG and HTML are download-only; never embed active documents.
    const kind = ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type) ? "image" : file.type.startsWith("audio/") ? "audio" : "file";
    updateDraft({ attachment: { url, name: file.name, size: file.size, kind } });
  }
  function toSaved(message: Message) {
    if (message.attachment) return;
    dispatch({ type: "send", chatId: "saved", message: { id: uid(), body: localize(message.body, locale), at: new Date().toISOString(), mine: true } });
    setNotice(t.savedToast);
  }
  async function copyMessage(message: Message) {
    try { await navigator.clipboard.writeText(localize(message.body, locale)); setNotice(t.copied); }
    catch { setNotice(t.copyError); }
  }
  const infoText = active.kind === "channel" ? t.channelInfo : active.kind === "saved" ? t.savedInfo : active.kind === "group" ? t.groupInfo + " · " + ((active.members?.length ?? 0) + 1) + " " + t.memberUnit : t.directInfo;
  const textFor = (message?: Message) => message ? localize(message.body, locale) || (message.attachment?.kind === "image" ? t.photo : message.attachment?.kind === "audio" ? t.audio : t.file) : "";

  function threadRow(chat: Thread) {
    const last = (state.messages[chat.id] ?? []).at(-1);
    const pending = drafts[chat.id];
    return <li className={cn("conversation-row", opened && activeId === chat.id && "selected")} key={chat.id}>
      <button className="conversation-open" onClick={() => openChat(chat.id)} aria-label={localize(chat.name, locale)} aria-current={opened && activeId === chat.id ? "true" : undefined}>
        <Avatar chat={chat} />
        <span className="conversation-summary">
          <span className="conversation-title"><strong>{localize(chat.name, locale)}</strong><time className={chat.unread ? "unread-time" : ""}>{last ? clock(last.at) : ""}</time></span>
          <span className="conversation-preview">
            <span className="preview-text">{pending?.text || pending?.attachment ? <><span className="draft-label">{t.draft}: </span>{pending.text || t.attachment}</> : <>{last?.mine && <span className="preview-you">{t.you}: </span>}{last?.sender && <span>{last.sender}: </span>}{textFor(last) || t.noMessages}</>}</span>
            {chat.muted && <BellOff className="small-icon" aria-label={t.mute} />}
            {chat.pinned && <Pin className="small-icon" aria-label={t.pin} />}
            {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
          </span>
        </span>
      </button>
      <div className="row-menu"><ChatMenu chat={chat} t={t} act={type => { dispatch({ type, chatId: chat.id }); if (type === "archive" && activeId === chat.id) setOpened(false); }} /></div>
    </li>;
  }

  return <main className={cn("messenger-shell", opened && "conversation-open-mobile")} data-accent={accent}>
    <nav className="desktop-rail" aria-label={t.chats}>
      <button className="wordmark-icon" onClick={() => switchView("chats")} aria-label="Qazyna">Q</button>
      {nav.map(item => <button key={item.id} title={item.label} aria-label={item.label} aria-current={view === item.id ? "page" : undefined} className={cn("rail-button", view === item.id && "active")} onClick={() => switchView(item.id)}><item.icon />{item.id === "chats" && unread > 0 && <span className="rail-dot" />}</button>)}
      <button className="rail-button rail-bottom" onClick={() => setModal("about")} aria-label={t.help} title={t.help}><CircleHelp /></button>
      <button className="profile-dot" onClick={() => switchView("settings")} aria-label={t.me}><CircleUserRound /></button>
    </nav>

    <section className="inbox-panel" aria-label={viewLabel}>
      <header className="inbox-header">
        <div className="brand-row">
          <span>{view === "chats" ? "Qazyna" : viewLabel}</span>
          <div className="whatsapp-list-actions">
            {view === "chats" && <>
              <Button variant="ghost" size="icon" className="icon-button" onClick={() => setNotice(locale === "ru" ? "Камера будет подключена в нативном приложении." : "Камера нативті қолданбада қосылады.")} aria-label={locale === "ru" ? "Камера" : "Камера"} title={locale === "ru" ? "Камера" : "Камера"}><Camera /></Button>
              <Button variant="ghost" size="icon" className="icon-button" onClick={() => setListSearchOpen(value => !value)} aria-label={t.search} title={t.search}><Search /></Button>
            </>}
            {view === "calls" && <Button variant="ghost" size="icon" className="icon-button" onClick={() => setModal("call")} aria-label={t.startCall}><Plus /></Button>}
            <Button variant="ghost" size="icon" className="icon-button" onClick={() => view === "settings" ? switchView("chats") : switchView("settings")} aria-label={view === "settings" ? t.back : t.settings}>{view === "settings" ? <ArrowLeft /> : <MoreVertical />}</Button>
          </div>
        </div>
        <div className={cn("title-row", view === "chats" && archived ? "archive-title" : "normal-title")}>
          <h1 className={cn(view === "chats" && !archived && "chats-main-title")}>{view === "chats" && archived ? t.archive : viewLabel}</h1>
          <div className="title-actions">{view === "chats" && archived && <Button variant="ghost" size="icon" className="icon-button" onClick={() => setArchived(false)} aria-label={t.back}><ArrowLeft /></Button>}</div>
        </div>
      </header>

      {view === "chats" && <>
        <div className={cn("search-box", "chat-list-search", !listSearchOpen && !query && "mobile-search-collapsed")}><Search /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search} />{(query || listSearchOpen) && <button onClick={() => { setQuery(""); setListSearchOpen(false); }} aria-label={t.close}><X /></button>}</div>
        <div className="chat-filters" role="group" aria-label={t.chats}>{(["all", "unread", "groups"] as Filter[]).map(item => <button key={item} aria-pressed={filter === item} className={cn("filter-chip", filter === item && "active")} onClick={() => setFilter(item)}>{t[item]}</button>)}</div>
        <div className="inbox-scroll">
          {!archived && <button className="archive-row" onClick={() => { setArchived(true); setFilter("all"); setQuery(""); }}><Archive /><span>{t.archive}</span><span>{archiveCount}</span></button>}
          {filtered.length ? <ul className="conversation-list">{filtered.map(threadRow)}</ul> : <div className="small-empty"><Search /><strong>{t.noChats}</strong><p>{t.noChatsHint}</p></div>}
        </div>
        <button className="new-chat-fab" onClick={newChat} aria-label={t.newChat}><MessageSquarePlus /></button>
      </>}

      {view === "updates" && <div className="inbox-scroll updates-list">
        <div className="section-heading"><h2>{t.statuses}</h2><Button variant="ghost" size="icon" className="icon-button" onClick={() => setModal("status")} aria-label={t.addStatus}><Plus /></Button></div>
        <button className="status-row" onClick={() => myStatus ? (setViewedStatus({ name: t.myStatus, text: myStatus }), setModal("view-status")) : setModal("status")}><span className={cn("status-ring", myStatus && "has-status")}><CircleUserRound /><span className="status-plus">+</span></span><span><strong>{t.myStatus}</strong><small>{myStatus || t.addStatus}</small></span></button>
        <button className="status-row" onClick={() => { setViewedStatus({ name: "Данияр", text: locale === "ru" ? t.sampleStatus : t.sampleStatusKk }); setModal("view-status"); }}><span className="status-ring has-status"><Avatar chat={{ initials: "Д", color: "#658db5", kind: "direct" }} small /></span><span><strong>Данияр</strong><small>{t.demo} · 09:30</small></span></button>
        <div className="section-divider" />
        <div className="section-heading"><h2>{t.channels}</h2><Megaphone className="muted" /></div>
        <p className="section-description">{t.subscribeHint}</p>
        <ul className="conversation-list">{state.threads.filter(chat => chat.kind === "channel" && chat.following).map(threadRow)}</ul>
        <h3 className="find-heading">{t.discover}</h3>
        {state.threads.filter(chat => chat.kind === "channel" && !chat.following).map(chat => <div className="channel-discover" key={chat.id}><button onClick={() => openChat(chat.id)}><Avatar chat={chat} /><span><strong>{localize(chat.name, locale)}</strong><small>{t.channelInfo}</small></span></button><Button variant="secondary" className="subscribe-small" onClick={() => dispatch({ type: "follow", chatId: chat.id })}>{t.follow}</Button></div>)}
      </div>}

      {view === "communities" && <div className="inbox-scroll"><div className="small-empty communities-empty"><span className="empty-icon"><UsersRound /></span><strong>{communitiesLabel}</strong><p>{locale === "ru" ? "Объединяйте связанные группы в одном месте — как в WhatsApp." : "Байланысты топтарды WhatsApp-тағыдай бір жерде біріктіріңіз."}</p><Button className="primary-button" onClick={() => { setNewKind("group"); setGroupName(""); setSelectedContacts([]); setContactQuery(""); setModal("new"); }}><UsersRound />{locale === "ru" ? "Новое сообщество" : "Жаңа қауымдастық"}</Button><small>{t.soon}</small></div></div>}

      {view === "calls" && <div className="inbox-scroll"><div className="small-empty calls-empty"><span className="empty-icon"><Phone /></span><strong>{t.noCalls}</strong><p>{t.callsHint}</p><Button className="primary-button" onClick={() => setModal("call")}><Phone />{t.startCall}</Button><small>{t.soon}</small></div></div>}

      {view === "settings" && <div className="inbox-scroll settings-list">
        <div className="settings-profile"><span className="avatar profile"><CircleUserRound /></span><div><strong>{t.me}</strong><small>{t.profileHint}</small></div></div>
        <section className="setting-section"><h2><Languages />{t.language}</h2><div className="segmented" role="group" aria-label={t.language}><button className={locale === "ru" ? "active" : ""} onClick={() => setLocale("ru")} aria-pressed={locale === "ru"}>Русский</button><button className={locale === "kk" ? "active" : ""} onClick={() => setLocale("kk")} aria-pressed={locale === "kk"}>Қазақша</button></div></section>
        <section className="setting-section"><h2><Palette />{t.appearance}</h2><div className="segmented" role="group" aria-label={t.appearance}><button className={accent === "green" ? "active" : ""} onClick={() => setAccent("green")} aria-pressed={accent === "green"}><i className="color-dot green" />{t.green}</button><button className={accent === "blue" ? "active" : ""} onClick={() => setAccent("blue")} aria-pressed={accent === "blue"}><i className="color-dot blue" />{t.blue}</button></div><p>{t.themeHint}</p></section>
        <button className="settings-row" onClick={() => setModal("about")}><Shield /><span>{t.privacy}</span><ChevronRight /></button>
        <button className="settings-row" onClick={() => { switchView("chats"); openChat("saved"); }}><Bookmark /><span>{t.saved}</span><ChevronRight /></button>
        <button className="settings-row" onClick={() => setModal("about")}><Info /><span>{t.help}</span><ChevronRight /></button>
      </div>}
      <button className="demo-footer" onClick={() => setModal("about")}><Info /><span>{t.demoShort}</span></button>
    </section>

    <section className={cn("chat-panel", view !== "chats" && !opened && "show-welcome")} aria-label={localize(active.name, locale)}>
      {view !== "chats" && !opened ? <div className="welcome-panel"><span className="welcome-mark"><MessageCircle /></span><h2>Qazyna</h2><p>{t.selectChatHint}</p><span className="welcome-demo">{t.demo} · {t.demoShort}</span></div> : <>
        <header className="chat-header">
          <Button variant="ghost" size="icon" className="icon-button mobile-back" onClick={() => setOpened(false)} aria-label={t.back}><ArrowLeft /></Button>
          <button className="chat-identity" onClick={() => setModal("info")} aria-label={t.chatInfo}><Avatar chat={active} small /><span><strong>{localize(active.name, locale)}</strong><small>{infoText}</small></span></button>
          <div className="chat-header-actions">
            {active.kind !== "channel" && active.kind !== "saved" && <><Button variant="ghost" size="icon" className="icon-button" onClick={() => setModal("call")} aria-label={t.video} title={t.video}><Video /></Button><Button variant="ghost" size="icon" className="icon-button audio-call" onClick={() => setModal("call")} aria-label={t.phone} title={t.phone}><Phone /></Button><span className="header-divider" /></>}
            <Button variant="ghost" size="icon" className="icon-button chat-search-action" onClick={() => { setSearchOpen(!searchOpen); setMessageQuery(""); }} aria-label={t.chatSearch} title={t.chatSearch}><Search /></Button>
            <ChatMenu chat={active} t={t} act={type => { dispatch({ type, chatId: activeId }); if (type === "archive") setOpened(false); }} />
          </div>
        </header>
        {searchOpen && <div className="message-search"><Search /><Input autoFocus value={messageQuery} onChange={e => setMessageQuery(e.target.value)} placeholder={t.chatSearch} aria-label={t.chatSearch} /><span>{visibleMessages.length}</span><Button variant="ghost" size="icon" className="icon-button" onClick={() => { setSearchOpen(false); setMessageQuery(""); }} aria-label={t.close}><X /></Button></div>}

        <div className="chat-wallpaper">
          <div className="chat-history" role="log" aria-live="polite" aria-relevant="additions text" aria-label={t.chats}>
            <div className="day-divider"><span>{t.today}</span></div>
            <button className="chat-demo-note" onClick={() => setModal("about")}><Info />{t.demo} · {t.demoShort}</button>
            {!visibleMessages.length && <div className="history-empty">{messageQuery ? t.noMatches : t.noMessagesHint}</div>}
            {visibleMessages.map(message => {
              const quoted = messages.find(item => item.id === message.replyTo);
              return <article className={cn("message-row", message.mine && "outgoing", active.kind === "channel" && "channel-message")} key={message.id}>
                <div className="message-bubble">
                  {message.sender && active.kind === "group" && <strong className="message-sender">{message.sender}</strong>}
                  {message.replyTo && <div className="reply-quote"><strong>{quoted ? quoted.mine ? t.you : quoted.sender || localize(active.name, locale) : t.reply}</strong><span>{quoted ? textFor(quoted) : t.quoteDeleted}</span></div>}
                  {message.attachment && <AttachmentView file={message.attachment} t={t} />}
                  {localize(message.body, locale) && <p className="message-body">{localize(message.body, locale)}</p>}
                  <div className="message-meta">{message.edited && <span>{t.edited}</span>}<time dateTime={message.at}>{clock(message.at)}</time>{message.mine && <span title={t.noDelivery} aria-label={t.noDelivery}><Clock3 /></span>}</div>
                  <DropdownMenu.Root><DropdownMenu.Trigger asChild><button className="message-menu-trigger" aria-label={t.more}><ChevronDown /></button></DropdownMenu.Trigger>
                    <DropdownMenu.Portal><DropdownMenu.Content className="context-menu" sideOffset={4} align="end" onCloseAutoFocus={e => { if (focusComposerAfterMenu.current) { e.preventDefault(); focusComposerAfterMenu.current = false; composeRef.current?.focus(); } }}>
                      {active.kind !== "channel" && <MenuItem action={() => { focusComposerAfterMenu.current = true; updateDraft({ replyTo: message.id, editing: undefined }); }}><Reply />{t.reply}</MenuItem>}
                      <MenuItem action={() => void copyMessage(message)}><Copy />{t.copy}</MenuItem>
                      {!message.attachment && <MenuItem action={() => toSaved(message)}><Bookmark />{t.saveTo}</MenuItem>}
                      {message.mine && <MenuItem action={() => { focusComposerAfterMenu.current = true; updateDraft({ editing: message.id, text: localize(message.body, locale), replyTo: undefined }); }}><Pencil />{t.edit}</MenuItem>}
                      {message.mine && <MenuItem danger action={() => setDeleteTarget({ chatId: activeId, messageId: message.id })}><Trash2 />{t.delete}</MenuItem>}
                    </DropdownMenu.Content></DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </article>;
            })}
            <div ref={bottomRef} />
          </div>
        </div>

        {active.kind === "channel" ? <footer className="channel-composer"><p>{t.readonly}</p><Button className="primary-button" onClick={() => dispatch({ type: "follow", chatId: activeId })}>{active.following ? t.unfollow : t.follow}</Button></footer> : <footer className="composer">
          {(draft.replyTo || draft.editing) && <div className="compose-reference"><span>{draft.editing ? <Pencil /> : <Reply />}</span><div><strong>{draft.editing ? t.edit : t.reply}</strong><p>{draft.editing ? draft.text : replyMessage ? textFor(replyMessage) : t.quoteDeleted}</p></div><Button variant="ghost" size="icon" className="icon-button" onClick={() => draft.editing ? resetComposition() : updateDraft({ replyTo: undefined })} aria-label={t.cancel}><X /></Button></div>}
          {draft.attachment && !draft.editing && <div className="compose-attachment"><FileText /><div><strong>{draft.attachment.name}</strong><small>{t.attachmentHint}</small></div><Button variant="ghost" size="icon" className="icon-button" aria-label={t.delete} onClick={() => { releaseAttachment(draft.attachment); updateDraft({ attachment: undefined }); }}><X /></Button></div>}
          <form className="composer-form" onSubmit={send}>
            <Popover.Root><Popover.Trigger asChild><Button type="button" variant="ghost" size="icon" className="icon-button emoji-button" aria-label={t.emoji}><Smile /></Button></Popover.Trigger><Popover.Portal><Popover.Content className="emoji-menu" sideOffset={12} aria-label={t.emoji}>{["🙂", "❤️", "👍", "😂", "🙏", "🔥", "🤍", "😊", "👋", "🎉", "👌", "🇰🇿"].map(emoji => <Popover.Close key={emoji} asChild><button onClick={() => { updateDraft({ text: draft.text + emoji }); composeRef.current?.focus(); }} aria-label={emoji}>{emoji}</button></Popover.Close>)}</Popover.Content></Popover.Portal></Popover.Root>
            <Button type="button" variant="ghost" size="icon" className="icon-button attach-button" onClick={() => fileRef.current?.click()} disabled={!!draft.editing} aria-label={t.attachment} title={t.attachment}><Paperclip /></Button>
            <Button type="button" variant="ghost" size="icon" className="icon-button camera-button" onClick={() => fileRef.current?.click()} disabled={!!draft.editing} aria-label={locale === "ru" ? "Фото" : "Фото"} title={locale === "ru" ? "Фото" : "Фото"}><Camera /></Button>
            <input type="file" ref={fileRef} hidden onChange={e => { attach(e.target.files?.[0]); e.target.value = ""; }} />
            <Textarea ref={composeRef} value={draft.text} rows={1} maxLength={MAX_MESSAGE_LENGTH} className="message-input" placeholder={t.message} aria-label={t.message} onChange={e => updateDraft({ text: e.target.value })} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
            {draft.text.trim() || draft.attachment || draft.editing ? <Button type="submit" size="icon" className="send-button" disabled={draft.editing ? !draft.text.trim() : !draft.text.trim() && !draft.attachment} aria-label={draft.editing ? t.save : t.send}>{draft.editing ? <Check /> : <Send />}</Button> : <Button type="button" variant="ghost" size="icon" className="icon-button mic-button" onClick={() => setModal("voice")} aria-label={t.voice} title={t.voice}><Mic /></Button>}
          </form>
          <p className="keyboard-hint">{t.enterHint}</p>
        </footer>}
      </>}
    </section>

    <nav className="mobile-nav" aria-label={t.typeHint}>{nav.map(item => <button className={cn(view === item.id && "active")} onClick={() => switchView(item.id)} aria-current={view === item.id ? "page" : undefined} key={item.id}><span><item.icon />{item.id === "chats" && unread > 0 && <b>{unread}</b>}</span><small>{item.label}</small></button>)}</nav>

    <Dialog.Root open={modal !== null} onOpenChange={value => { if (!value) setModal(null); }}>
      <Dialog.Portal><Dialog.Overlay className="modal-overlay" /><Dialog.Content className={cn("modal-content", modal === "view-status" && "status-modal")} onOpenAutoFocus={() => { modalOpener.current = document.activeElement as HTMLElement | null; }} onCloseAutoFocus={e => { e.preventDefault(); if (modalOpener.current?.getClientRects().length) modalOpener.current.focus(); else composeRef.current?.focus(); }}>
        <Dialog.Title>{modal === "new" ? newKind === "group" ? t.newGroup : t.newChat : modal === "call" ? t.notReadyTitle : modal === "voice" ? t.voice : modal === "info" ? localize(active.name, locale) : modal === "status" ? t.myStatus : modal === "view-status" ? viewedStatus?.name : t.demoTitle}</Dialog.Title>
        <Dialog.Description>{modal === "new" ? t.groupHint : modal === "call" ? t.notReadyHint : modal === "voice" ? t.voiceHint : modal === "info" ? infoText : modal === "status" || modal === "view-status" ? t.statusHint : t.demoHint}</Dialog.Description>
        <Dialog.Close asChild><Button variant="ghost" size="icon" className="icon-button modal-close" aria-label={t.close}><X /></Button></Dialog.Close>
        {modal === "about" && <div className="modal-body"><p>{t.demoDetails}</p><h3><Shield />{t.privacy}</h3><p>{t.privacyHint}</p></div>}
        {modal === "voice" && <div className="modal-body"><Button className="primary-button" onClick={() => { setModal(null); fileRef.current?.click(); }}><Paperclip />{t.attachment}</Button></div>}
        {modal === "info" && <div className="modal-body info-body"><Avatar chat={active} /><p>{messages.length} {t.messageCount}</p>{active.members && <ul className="member-list"><li>{t.you}</li>{active.members.map(id => <li key={id}>{contacts.find(person => person.id === id)?.name ?? id}</li>)}</ul>}<p>{t.demoShort}</p></div>}
        {modal === "new" && <div className="modal-body">
          <div className="segmented" role="group" aria-label={t.newChat}><button className={newKind === "direct" ? "active" : ""} aria-pressed={newKind === "direct"} onClick={() => setNewKind("direct")}>{t.newChat}</button><button className={newKind === "group" ? "active" : ""} aria-pressed={newKind === "group"} onClick={() => setNewKind("group")}>{t.newGroup}</button></div>
          <form onSubmit={createGroup}>
            {newKind === "group" && <label className="field-label">{t.groupName}<Input value={groupName} onChange={e => setGroupName(e.target.value)} maxLength={64} required /></label>}
            <label className="field-label">{t.contacts}<Input value={contactQuery} onChange={e => setContactQuery(e.target.value)} placeholder={t.search} /></label>
            <div className="contact-picker">
              {newKind === "direct" && !contactQuery && <button type="button" onClick={() => startDirect("saved")}><Avatar chat={{ initials: "", kind: "saved", color: "#5b9ecd" }} /><strong>{t.saved}</strong></button>}
              {searchContacts.map(person => newKind === "direct" ? <button type="button" key={person.id} onClick={() => startDirect(person.id)}><Avatar chat={{ ...person, kind: "direct" }} /><strong>{person.name}</strong></button> : <label className="contact-checkbox" key={person.id}><Avatar chat={{ ...person, kind: "direct" }} /><strong>{person.name}</strong><input type="checkbox" checked={selectedContacts.includes(person.id)} onChange={e => setSelectedContacts(current => e.target.checked ? [...current, person.id] : current.filter(id => id !== person.id))} /></label>)}
              {!searchContacts.length && <p>{t.noMatches}</p>}
            </div>
            {newKind === "group" && <Button type="submit" className="primary-button wide" disabled={!groupName.trim() || !selectedContacts.length}><UsersRound />{t.create} · {selectedContacts.length}</Button>}
          </form>
        </div>}
        {modal === "status" && <form className="modal-body" onSubmit={e => { e.preventDefault(); if (statusDraft.trim()) { setMyStatus(statusDraft.trim()); setStatusDraft(""); setModal(null); } }}><Textarea value={statusDraft} maxLength={500} onChange={e => setStatusDraft(e.target.value)} placeholder={t.statusPlaceholder} aria-label={t.statusPlaceholder} required /><Button className="primary-button wide" disabled={!statusDraft.trim()}>{t.publish}</Button></form>}
        {modal === "view-status" && <div className="status-text">{viewedStatus?.text}</div>}
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>

    <Dialog.Root open={!!deleteTarget} onOpenChange={value => { if (!value) setDeleteTarget(null); }}>
      <Dialog.Portal><Dialog.Overlay className="modal-overlay" /><Dialog.Content className="modal-content" onCloseAutoFocus={e => { e.preventDefault(); composeRef.current?.focus(); }}>
        <Dialog.Title>{t.deleteTitle}</Dialog.Title><Dialog.Description>{t.deleteHint}</Dialog.Description>
        <div className="confirm-actions"><Dialog.Close asChild><Button variant="secondary">{t.cancel}</Button></Dialog.Close><Button variant="destructive" onClick={() => { if (deleteTarget) { const message = state.messages[deleteTarget.chatId]?.find(item => item.id === deleteTarget.messageId); releaseAttachment(message?.attachment); dispatch({ type: "remove", ...deleteTarget }); if (draft.editing === deleteTarget.messageId) resetComposition(); } setDeleteTarget(null); }}>{t.delete}</Button></div>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
    <div className={cn("toast-notice", !notice && "is-hidden")} role="status" aria-live="polite">{notice}</div>
  </main>;
}

function AttachmentView({ file, t }: { file: Attachment; t: MessengerCopy }) {
  return <div className="message-attachment">
    {/* eslint-disable-next-line @next/next/no-img-element -- Local blob previews must not be sent to an image optimizer. */}
    {file.kind === "image" && <img src={file.url} alt={file.name} className="attachment-image" />}
    {file.kind === "audio" && <audio src={file.url} controls preload="metadata" aria-label={file.name} />}
    <a className="file-download" href={file.url} download={file.name}><FileText /><span><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(0)} KB · {t.download}</small></span></a>
  </div>;
}
