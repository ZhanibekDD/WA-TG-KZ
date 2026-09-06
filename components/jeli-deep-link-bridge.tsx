"use client";

import { useEffect } from "react";

export function JeliDeepLinkBridge() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("botjeli") !== "1") return;

    let attempts = 0;
    const openBot = () => {
      attempts += 1;
      const button = document.querySelector<HTMLButtonElement>('button[aria-label="BotJeli"]');
      if (button) {
        button.click();
        const next = new URL(window.location.href);
        next.searchParams.delete("botjeli");
        window.history.replaceState({}, "", `${next.pathname}${next.search}${next.hash}`);
        return;
      }
      if (attempts < 20) window.setTimeout(openBot, 100);
    };

    openBot();
  }, []);

  return null;
}
