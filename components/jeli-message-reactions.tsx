"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"] as const;

function stableKey(chat: string, index: number, text: string) {
  let hash = 2166136261;
  const source = `${chat}|${index}|${text}`;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `jeli-reaction-${(hash >>> 0).toString(36)}`;
}

export function JeliMessageReactions() {
  const [bubbles, setBubbles] = useState<HTMLElement[]>([]);
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const wired = useRef(new WeakSet<HTMLElement>());
  const timers = useRef(new WeakMap<HTMLElement, number>());

  useEffect(() => {
    const scan = () => {
      const panel = document.querySelector<HTMLElement>(".chat-panel");
      if (!panel || panel.classList.contains("show-welcome")) {
        setBubbles([]);
        return;
      }
      const chat = panel.getAttribute("aria-label") ?? "chat";
      const nodes = [...panel.querySelectorAll<HTMLElement>(".message-bubble")];
      nodes.forEach((bubble, index) => {
        if (!bubble.dataset.jeliReactionKey) {
          const raw = bubble.innerText.replace(/\s+/g, " ").trim();
          bubble.dataset.jeliReactionKey = stableKey(chat, index, raw);
        }
        if (wired.current.has(bubble)) return;
        wired.current.add(bubble);
        bubble.addEventListener("pointerdown", event => {
          const target = event.target as HTMLElement;
          if (target.closest("button,a,input,textarea,audio")) return;
          const timer = window.setTimeout(() => {
            setActiveKey(bubble.dataset.jeliReactionKey ?? null);
            navigator.vibrate?.(12);
          }, 430);
          timers.current.set(bubble, timer);
        });
        const clear = () => {
          const timer = timers.current.get(bubble);
          if (timer) window.clearTimeout(timer);
        };
        bubble.addEventListener("pointerup", clear);
        bubble.addEventListener("pointercancel", clear);
        bubble.addEventListener("pointerleave", clear);
        bubble.addEventListener("dblclick", event => {
          const target = event.target as HTMLElement;
          if (target.closest("button,a,input,textarea,audio")) return;
          const key = bubble.dataset.jeliReactionKey;
          if (!key) return;
          setReactions(current => ({ ...current, [key]: current[key] === "❤️" ? "" : "❤️" }));
        });
      });
      setBubbles(nodes);
    };
    const timer = window.setTimeout(scan, 0);
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-label", "class"] });
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    bubbles.forEach(bubble => {
      const key = bubble.dataset.jeliReactionKey;
      bubble.classList.toggle("has-jeli-reaction", !!(key && reactions[key]));
    });
  }, [bubbles, reactions]);

  const choose = (key: string, emoji: string) => {
    setReactions(current => ({ ...current, [key]: current[key] === emoji ? "" : emoji }));
    setActiveKey(null);
  };

  return <>
    {bubbles.map(bubble => {
      const key = bubble.dataset.jeliReactionKey;
      if (!key) return null;
      const selected = reactions[key];
      return createPortal(
        <>
          <button type="button" className="jeli-reaction-add" aria-label="Добавить реакцию" onClick={event => { event.stopPropagation(); setActiveKey(current => current === key ? null : key); }}>☺</button>
          {selected && <button type="button" className="jeli-reaction-pill" aria-label={`Реакция ${selected}`} onClick={event => { event.stopPropagation(); setActiveKey(key); }}>{selected}<span>1</span></button>}
          {activeKey === key && <div className="jeli-reaction-picker" role="menu" aria-label="Реакции">
            {REACTIONS.map(emoji => <button type="button" role="menuitem" key={emoji} className={selected === emoji ? "active" : ""} onClick={event => { event.stopPropagation(); choose(key, emoji); }}>{emoji}</button>)}
          </div>}
        </>,
        bubble,
        key,
      );
    })}
  </>;
}
