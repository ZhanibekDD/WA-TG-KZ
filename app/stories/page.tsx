"use client";

import Link from "next/link";
import { Archive, ArrowLeft, ChevronLeft, ChevronRight, EyeOff, Heart, LockKeyhole, MoreHorizontal, Pin, Plus, Reply, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isStoryArchived, readLocalStories, storyPrivacyLabel, storySamples, writeLocalStories, type JeliStory, type StoryDuration, type StoryPrivacy } from "@/lib/jeli-stories";

const accents = [
  "linear-gradient(145deg,#18b5ad,#1f9fe5)",
  "linear-gradient(145deg,#11b985,#249ce8)",
  "linear-gradient(145deg,#0f9fa8,#2676e8)",
  "linear-gradient(145deg,#2ccf9a,#1785dc)",
];

function relativeTime(value: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.round(minutes / 60);
  return `${hours} ч`;
}

export default function StoriesPage() {
  const [localStories, setLocalStories] = useState<JeliStory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compose, setCompose] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [privacy, setPrivacy] = useState<StoryPrivacy>("contacts");
  const [duration, setDuration] = useState<StoryDuration>(24);
  const [pinned, setPinned] = useState(false);
  const [noScreenshots, setNoScreenshots] = useState(false);
  const [accent, setAccent] = useState(accents[0]);
  const [reply, setReply] = useState("");
  const [reaction, setReaction] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const stories = readLocalStories();
    setLocalStories(stories);
    const params = new URLSearchParams(window.location.search);
    if (params.get("compose") === "1") setCompose(true);
    const requested = params.get("story");
    if (requested) setSelectedId(requested);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const activeStories = useMemo(() => [...localStories.filter(story => !isStoryArchived(story)), ...storySamples], [localStories]);
  const archivedStories = useMemo(() => localStories.filter(story => isStoryArchived(story)), [localStories]);
  const pinnedStories = useMemo(() => localStories.filter(story => story.pinned), [localStories]);
  const selectedIndex = Math.max(0, activeStories.findIndex(story => story.id === selectedId));
  const selected = selectedId ? activeStories.find(story => story.id === selectedId) ?? activeStories[selectedIndex] : null;

  function publish(event: FormEvent) {
    event.preventDefault();
    if (!caption.trim()) return;
    const now = Date.now();
    const story: JeliStory = {
      id: crypto.randomUUID(),
      authorId: "me",
      author: "Вы",
      initials: "Я",
      accent,
      caption: caption.trim(),
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + duration * 60 * 60 * 1000).toISOString(),
      privacy,
      durationHours: duration,
      pinned,
      noScreenshots,
      mine: true,
    };
    const next = [story, ...localStories];
    setLocalStories(next);
    writeLocalStories(next);
    setCompose(false);
    setCaption("");
    setSelectedId(story.id);
    setNotice("История добавлена локально");
  }

  function move(delta: number) {
    if (!activeStories.length) return;
    const current = selected ? activeStories.findIndex(story => story.id === selected.id) : 0;
    const next = (current + delta + activeStories.length) % activeStories.length;
    setSelectedId(activeStories[next].id);
    setReaction("");
    setReply("");
  }

  function pinSelected() {
    if (!selected?.mine) return;
    const next = localStories.map(story => story.id === selected.id ? { ...story, pinned: !story.pinned } : story);
    setLocalStories(next);
    writeLocalStories(next);
  }

  return <main className="jeli-stories-page">
    <header className="jeli-stories-header">
      <Link href="/" className="jeli-stories-back"><ArrowLeft />JELI</Link>
      <div><strong>Stories</strong><span>Моменты над списком чатов</span></div>
      <div className="jeli-stories-header-actions">
        <Button variant="ghost" size="icon" onClick={() => setArchiveOpen(value => !value)} aria-label="Архив"><Archive /></Button>
        <Button onClick={() => setCompose(true)}><Plus />История</Button>
      </div>
    </header>

    <section className="jeli-stories-profile-rail">
      <button className="jeli-story-card mine" onClick={() => setCompose(true)}><span><img src="/jeli-icon.png" alt="" /><b><Plus /></b></span><strong>Моя история</strong><small>Добавить</small></button>
      {activeStories.map(story => <button className={selectedId === story.id ? "jeli-story-card active" : "jeli-story-card"} key={story.id} onClick={() => setSelectedId(story.id)}><span className="jeli-story-card-ring"><i style={{ background: story.accent }}>{story.initials}</i></span><strong>{story.author}</strong><small>{relativeTime(story.createdAt)}</small></button>)}
    </section>

    {pinnedStories.length > 0 && <section className="jeli-story-highlights"><div><strong>Закреплённые</strong><span>Истории профиля</span></div>{pinnedStories.map(story => <button key={story.id} onClick={() => setSelectedId(story.id)} style={{ background: story.accent }}>{story.caption.slice(0, 42)}</button>)}</section>}

    <section className="jeli-stories-stage">
      {archiveOpen ? <div className="jeli-story-archive-panel">
        <div className="jeli-story-section-title"><div><Archive /><span><strong>Архив историй</strong><small>Истории автоматически попадают сюда после завершения срока</small></span></div><Button variant="ghost" size="icon" onClick={() => setArchiveOpen(false)}><X /></Button></div>
        {archivedStories.length ? <div className="jeli-story-archive-grid">{archivedStories.map(story => <button key={story.id} style={{ background: story.accent }} onClick={() => { setArchiveOpen(false); setSelectedId(story.id); }}><strong>{story.caption}</strong><small>{storyPrivacyLabel(story.privacy)}</small></button>)}</div> : <div className="jeli-story-empty"><Archive /><strong>Архив пока пуст</strong><span>Локальные истории появятся здесь после завершения срока.</span></div>}
      </div> : selected ? <div className="jeli-story-viewer">
        <button className="jeli-story-nav previous" onClick={() => move(-1)} aria-label="Предыдущая"><ChevronLeft /></button>
        <article className="jeli-story-canvas" style={{ background: selected.accent }}>
          <div className="jeli-story-progress"><span /></div>
          <div className="jeli-story-author"><span>{selected.initials}</span><div><strong>{selected.author}</strong><small>{relativeTime(selected.createdAt)} · {selected.demo ? "демо" : storyPrivacyLabel(selected.privacy)}</small></div>{selected.noScreenshots && <EyeOff aria-label="Скриншоты отключены" />}{selected.mine && <Button variant="ghost" size="icon" onClick={pinSelected} aria-label="Закрепить"><Pin /></Button>}<MoreHorizontal /></div>
          <div className="jeli-story-caption"><p>{selected.caption}</p>{selected.pinned && <span><Pin />Закреплено в профиле</span>}</div>
          <div className="jeli-story-viewer-actions">
            <button className={reaction === "❤️" ? "active" : ""} onClick={() => { setReaction("❤️"); setNotice("Реакция сохранена локально"); }}><Heart />{reaction || "Реакция"}</button>
            <button onClick={() => document.querySelector<HTMLInputElement>("#jeli-story-reply")?.focus()}><Reply />Ответить</button>
          </div>
        </article>
        <button className="jeli-story-nav next" onClick={() => move(1)} aria-label="Следующая"><ChevronRight /></button>
        <form className="jeli-story-reply" onSubmit={event => { event.preventDefault(); if (reply.trim()) { setNotice("Ответ сохранён локально"); setReply(""); } }}><Input id="jeli-story-reply" value={reply} onChange={event => setReply(event.target.value)} placeholder="Ответить на историю…" /><Button size="icon" disabled={!reply.trim()}><Send /></Button></form>
      </div> : <div className="jeli-story-empty large"><Sparkles /><strong>Выберите историю</strong><span>Stories находятся над чатами, как в Telegram, и не занимают отдельную тяжёлую ленту.</span><Button onClick={() => setCompose(true)}><Plus />Создать историю</Button></div>}
    </section>

    {compose && <div className="jeli-story-compose-overlay" role="presentation"><form className="jeli-story-compose" onSubmit={publish}>
      <div className="jeli-story-compose-head"><div><strong>Новая история</strong><span>Локальный режим до подключения аккаунтов</span></div><Button type="button" variant="ghost" size="icon" onClick={() => setCompose(false)}><X /></Button></div>
      <div className="jeli-story-preview" style={{ background: accent }}><span>{caption || "Ваша история"}</span></div>
      <Textarea value={caption} onChange={event => setCaption(event.target.value)} maxLength={500} rows={3} placeholder="Добавьте подпись…" required />
      <fieldset><legend>Цвет</legend><div className="jeli-story-accent-picker">{accents.map(item => <button type="button" key={item} aria-pressed={accent === item} onClick={() => setAccent(item)} style={{ background: item }} />)}</div></fieldset>
      <fieldset><legend><LockKeyhole />Кто увидит</legend><div className="jeli-story-choice-grid">{(["everyone","contacts","close-friends","selected"] as StoryPrivacy[]).map(item => <button type="button" key={item} className={privacy === item ? "active" : ""} onClick={() => setPrivacy(item)}>{storyPrivacyLabel(item)}</button>)}</div></fieldset>
      <fieldset><legend>Срок</legend><div className="jeli-story-choice-grid duration">{([6,12,24,48] as StoryDuration[]).map(item => <button type="button" key={item} className={duration === item ? "active" : ""} onClick={() => setDuration(item)}>{item} ч</button>)}</div></fieldset>
      <label className="jeli-story-switch"><input type="checkbox" checked={pinned} onChange={event => setPinned(event.target.checked)} /><span><Pin /><strong>Оставить в профиле</strong><small>После срока история останется как highlight</small></span></label>
      <label className="jeli-story-switch"><input type="checkbox" checked={noScreenshots} onChange={event => setNoScreenshots(event.target.checked)} /><span><ShieldCheck /><strong>Запретить сохранение</strong><small>UI-флаг; реальная защита появится в native app</small></span></label>
      <Button className="jeli-story-publish" disabled={!caption.trim()}><Send />Опубликовать локально</Button>
    </form></div>}

    <div className={notice ? "jeli-story-toast" : "jeli-story-toast hidden"}>{notice}</div>
  </main>;
}
