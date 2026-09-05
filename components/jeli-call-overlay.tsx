"use client";

import { Mic, MicOff, PhoneOff, Plus, Speaker, UsersRound, Video, VideoOff, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const GROUPS: Record<string, string[]> = {
  "Семья": ["Вы", "Айгерим", "Данияр", "Асқар"],
  "Отбасы": ["Сіз", "Айгерим", "Данияр", "Асқар"],
  "Наша команда": ["Вы", "Мади", "Асқар"],
  "Біздің команда": ["Сіз", "Мади", "Асқар"],
};

function initials(name: string) {
  return name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
}

export function JeliCallOverlay() {
  const [open, setOpen] = useState(false);
  const [chooser, setChooser] = useState(false);
  const [video, setVideo] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [title, setTitle] = useState("");
  const [group, setGroup] = useState(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>("button[aria-label]");
      if (!button) return;
      const label = button.getAttribute("aria-label") ?? "";
      const isVideo = label === "Видеозвонок" || label === "Бейнеқоңырау";
      const isAudio = label === "Аудиозвонок" || label === "Аудиоқоңырау";
      const isNew = label === "Новый звонок" || label === "Жаңа қоңырау";
      if (!isVideo && !isAudio && !isNew) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (isNew) {
        setChooser(true);
        setOpen(true);
        return;
      }

      const panel = document.querySelector<HTMLElement>(".chat-panel");
      const chat = panel?.getAttribute("aria-label") ?? "Контакт";
      const info = panel?.querySelector<HTMLElement>(".chat-identity small")?.innerText ?? "";
      setTitle(chat);
      setGroup(/групп|топ|участник|қатысушы/i.test(info) || !!GROUPS[chat]);
      setVideo(isVideo);
      setMuted(false);
      setCameraOff(false);
      setChooser(false);
      setOpen(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const participants = useMemo(() => group ? (GROUPS[title] ?? ["Вы", title, "Участник 3", "Участник 4"]) : [title], [group, title]);

  if (!open) return null;

  if (chooser) {
    return <div className="jeli-call-overlay" role="dialog" aria-modal="true" aria-label="Новый звонок">
      <section className="jeli-call-chooser">
        <header><div><strong>Новый звонок</strong><span>JELI</span></div><button onClick={() => setOpen(false)} aria-label="Закрыть"><X /></button></header>
        <button className="jeli-group-call-entry" onClick={() => { setChooser(false); setGroup(true); setTitle("Групповой звонок"); setVideo(true); }}><span><UsersRound /></span><div><strong>Новый групповой звонок</strong><small>Выберите участников</small></div></button>
        <div className="jeli-call-contact-list">
          {["Айгерим", "Данияр", "Асқар", "Мади"].map(name => <div key={name}><span>{initials(name)}</span><strong>{name}</strong><button aria-label={`Аудио ${name}`} onClick={() => { setChooser(false); setGroup(false); setTitle(name); setVideo(false); }}><Mic /></button><button aria-label={`Видео ${name}`} onClick={() => { setChooser(false); setGroup(false); setTitle(name); setVideo(true); }}><Video /></button></div>)}
        </div>
        <p>Интерфейс готов. Реальный звонок включится после подключения WebRTC/STUN/TURN.</p>
      </section>
    </div>;
  }

  return <div className="jeli-call-overlay" role="dialog" aria-modal="true" aria-label={video ? "Видеозвонок" : "Аудиозвонок"}>
    <section className={video ? "jeli-call-screen video" : "jeli-call-screen audio"}>
      <header><span className="jeli-call-demo-badge">UI PREVIEW · WEBRTC OFF</span><button onClick={() => setOpen(false)} aria-label="Закрыть"><X /></button></header>
      <div className="jeli-call-heading"><strong>{title}</strong><span>{group ? "Групповой звонок" : video ? "Видеозвонок" : "Аудиозвонок"}</span></div>
      <div className={group ? "jeli-call-participants group" : "jeli-call-participants"}>
        {participants.map((name, index) => <div className="jeli-call-participant" key={`${name}-${index}`}><span>{initials(name)}</span><small>{name}</small></div>)}
        {group && participants.length < 6 && <button className="jeli-add-participant" aria-label="Добавить участника"><Plus /></button>}
      </div>
      <footer className="jeli-call-controls">
        <button className={muted ? "active" : ""} onClick={() => setMuted(value => !value)} aria-label={muted ? "Включить микрофон" : "Выключить микрофон"}>{muted ? <MicOff /> : <Mic />}</button>
        {video && <button className={cameraOff ? "active" : ""} onClick={() => setCameraOff(value => !value)} aria-label={cameraOff ? "Включить камеру" : "Выключить камеру"}>{cameraOff ? <VideoOff /> : <Video />}</button>}
        <button className={speaker ? "active" : ""} onClick={() => setSpeaker(value => !value)} aria-label="Динамик"><Speaker /></button>
        <button className="end" onClick={() => setOpen(false)} aria-label="Завершить звонок"><PhoneOff /></button>
      </footer>
      <p className="jeli-call-note">Микрофон и камера не запрашиваются: это только интерфейс будущего звонка.</p>
    </section>
  </div>;
}
