"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { readLocalStories, storySamples, type JeliStory } from "@/lib/jeli-stories";

export function JeliStoriesDock() {
  const [visible, setVisible] = useState(false);
  const [localStories, setLocalStories] = useState<JeliStory[]>([]);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const refresh = () => setLocalStories(readLocalStories().filter(story => new Date(story.expiresAt).getTime() > Date.now()));
    const panel = document.querySelector<HTMLElement>(".inbox-panel");
    const syncView = () => {
      const label = panel?.getAttribute("aria-label") ?? "";
      setVisible(!panel || label === "Чаты" || label === "Чаттар");
    };
    const timer = window.setTimeout(() => {
      refresh();
      syncView();
    }, 0);
    window.addEventListener("storage", refresh);
    const observer = panel ? new MutationObserver(syncView) : null;
    observer?.observe(panel!, { attributes: true, attributeFilter: ["aria-label"] });
    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const stories = useMemo(() => [...localStories, ...storySamples].slice(0, 6), [localStories]);
  if (!visible) return null;

  return <aside className="jeli-stories-dock" aria-label="Stories">
    <Link href="/stories?compose=1" className="jeli-story-dock-item mine" aria-label="Добавить историю">
      <span className="jeli-story-avatar mine"><img src="/jeli-icon.svg" alt="" /><b><Plus /></b></span>
      <small>Моя история</small>
    </Link>
    {stories.map(story => <Link key={story.id} href={`/stories?story=${encodeURIComponent(story.id)}`} className="jeli-story-dock-item" aria-label={`История ${story.author}`}>
      <span className="jeli-story-ring"><span className="jeli-story-avatar" style={{ background: story.accent }}>{story.initials}</span></span>
      <small>{story.author}</small>
    </Link>)}
    <Link href="/stories" className="jeli-stories-all">Все</Link>
  </aside>;
}
