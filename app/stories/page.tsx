"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Archive, ChevronLeft, ChevronRight, EyeOff, Heart, LockKeyhole, MoreHorizontal, Pin, Plus, Send, ShieldCheck, X } from "lucide-react";
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
  return `${Math.round(minutes / 60)} ч`;
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
    const timer = window.setTimeout(() => {
      const locals = readLocalStories();
      const available = [...locals.filter(story => !isStoryArchived(story)), ...storySamples];
      const params = new URLSearchParams(window.location.search);
      setLocalStories(locals);
      setCompose(params.get("compose") === "1");
      setSelectedId(params.get("story") ?? available[0]?.id ?? null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const stories = useMemo(() => [...localStories.filter(story => !isStoryArchived(story)), ...storySamples], [localStories]);
  const archivedStories = useMemo(() => localStories.filter(story => isStoryArchived(story)), [localStories]);
  const selected = stories.find(story => story.id === selectedId) ?? stories[0] ?? null;
  const selectedIndex = selected ? stories.findIndex(story => story.id === selected.id) : -1;

  function move(delta: number) {
    if (!stories.length || selectedIndex < 0) return;
    const next = (selectedIndex + delta + stories.length) % stories.length;
    setSelectedId(stories[next].id);
    setReply("");
    setReaction("");
  }

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
    setCaption("");
    setCompose(false);
    setSelectedId(story.id);
    setNotice("История добавлена локально");
  }

  function pinSelected() {
    if (!selected?.mine) return;
    const next = localStories.map(story => story.id === selected.id ? { ...story, pinned: !story.pinned } : story);
    setLocalStories(next);
    writeLocalStories(next);
  }

  return <main className="tg-stories-viewer">
    <div className="tg-story-global-bar">
      <Link href="/" className="tg-story-close" aria-label="Назад в чаты"><X /></Link>
      <span className="tg-story-brand"><img src="/jeli-icon.svg" alt="" />JELI</span>
      <div>
        <button onClick={() => setArchiveOpen(value => !value)} aria-label="Архив"><Archive /></button>
        <button onClick={() => setCompose(true)} aria-label="Добавить историю"><Plus /></button>
      </div>
    </div>

    {selected && <>
      <button className="tg-story-side-nav previous" onClick={() => move(-1)} aria-label="Предыдущая история"><ChevronLeft /></button>
      <article className="tg-story-card" style={{ background: selected.accent }}>
        <div className="tg-story-progress"><span /></div>
        <header className="tg-story-author">
          <span className="tg-story-author-avatar">{selected.initials}</span>
          <div><strong>{selected.author}</strong><small>{relativeTime(selected.createdAt)}{selected.demo ? " · демо" : ` · ${storyPrivacyLabel(selected.privacy)}`}</small></div>
          {selected.noScreenshots && <EyeOff aria-label="Сохранение ограничено" />}
          {selected.mine && <button onClick={pinSelected} className={selected.pinned ? "active" : ""} aria-label="Закрепить"><Pin /></button>}
          <MoreHorizontal />
        </header>

        <div className="tg-story-content">
          <p>{selected.caption}</p>
          {selected.pinned && <span><Pin />В профиле</span>}
        </div>

        <div className="tg-story-bottom-gradient" />
        <form className="tg-story-reply" onSubmit={event => { event.preventDefault(); if (!reply.trim()) return; setReply(""); setNotice("Ответ сохранён локально"); }}>
          <Input value={reply} onChange={event => setReply(event.target.value)} placeholder="Ответить…" aria-label="Ответить на историю" />
          <button type="button" className={reaction ? "active" : ""} onClick={() => { setReaction(reaction ? "" : "❤️"); setNotice(reaction ? "Реакция убрана" : "Реакция сохранена локально"); }} aria-label="Реакция"><Heart /></button>
          <Button size="icon" disabled={!reply.trim()} aria-label="Отправить"><Send /></Button>
        </form>
      </article>
      <button className="tg-story-side-nav next" onClick={() => move(1)} aria-label="Следующая история"><ChevronRight /></button>
    </>}

    {!selected && <div className="tg-story-empty"><strong>Нет историй</strong><button onClick={() => setCompose(true)}><Plus />Добавить историю</button></div>}

    {archiveOpen && <aside className="tg-story-drawer">
      <header><div><strong>Архив историй</strong><small>Только ваши завершённые истории</small></div><button onClick={() => setArchiveOpen(false)}><X /></button></header>
      {archivedStories.length ? archivedStories.map(story => <button key={story.id} style={{ background: story.accent }}><strong>{story.caption}</strong><small>{storyPrivacyLabel(story.privacy)}</small></button>) : <p>Архив пока пуст.</p>}
    </aside>}

    {compose && <div className="tg-story-compose-backdrop">
      <form className="tg-story-compose" onSubmit={publish}>
        <header><div><strong>Новая история</strong><small>Локальный режим</small></div><button type="button" onClick={() => setCompose(false)}><X /></button></header>
        <div className="tg-story-compose-preview" style={{ background: accent }}>{caption || "Ваша история"}</div>
        <Textarea value={caption} onChange={event => setCaption(event.target.value)} maxLength={500} rows={3} placeholder="Добавьте подпись…" required />
        <div className="tg-story-color-row">{accents.map(item => <button type="button" key={item} aria-pressed={accent === item} onClick={() => setAccent(item)} style={{ background: item }} />)}</div>
        <fieldset><legend><LockKeyhole />Кто увидит</legend><div>{(["everyone","contacts","close-friends","selected"] as StoryPrivacy[]).map(item => <button type="button" key={item} className={privacy === item ? "active" : ""} onClick={() => setPrivacy(item)}>{storyPrivacyLabel(item)}</button>)}</div></fieldset>
        <fieldset><legend>Срок</legend><div>{([6,12,24,48] as StoryDuration[]).map(item => <button type="button" key={item} className={duration === item ? "active" : ""} onClick={() => setDuration(item)}>{item} ч</button>)}</div></fieldset>
        <label><input type="checkbox" checked={pinned} onChange={event => setPinned(event.target.checked)} /><span><Pin /><strong>Оставить в профиле</strong></span></label>
        <label><input type="checkbox" checked={noScreenshots} onChange={event => setNoScreenshots(event.target.checked)} /><span><ShieldCheck /><strong>Ограничить сохранение</strong></span></label>
        <Button disabled={!caption.trim()}><Send />Опубликовать локально</Button>
      </form>
    </div>}

    <div className={notice ? "tg-story-toast" : "tg-story-toast hidden"}>{notice}</div>
  </main>;
}
