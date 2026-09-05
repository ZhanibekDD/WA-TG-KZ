"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const commands = [
  { label: "Создать бота", command: "/newbot" },
  { label: "Мои боты", command: "/mybots" },
  { label: "Помощь", command: "/help" },
];

export function BotJeliCommandBar() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let timer = 0;
    const findTarget = () => {
      const composer = document.querySelector<HTMLElement>('.chat-panel[aria-label="BotJeli"] .composer');
      setTarget(current => current === composer ? current : composer);
    };
    timer = window.setTimeout(findTarget, 0);
    const observer = new MutationObserver(findTarget);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-label", "class"] });
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  if (!target) return null;

  const run = (command: string) => {
    const panel = document.querySelector<HTMLElement>('.chat-panel[aria-label="BotJeli"]');
    const textarea = panel?.querySelector<HTMLTextAreaElement>("textarea.message-input");
    const form = panel?.querySelector<HTMLFormElement>("form.composer-form");
    if (!textarea || !form) return;
    const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
    descriptor?.set?.call(textarea, command);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    window.setTimeout(() => form.requestSubmit(), 0);
  };

  return createPortal(
    <div className="botjeli-command-bar" aria-label="Команды BotJeli">
      {commands.map(item => <button type="button" key={item.command} onClick={() => run(item.command)}>{item.label}</button>)}
    </div>,
    target,
  );
}
