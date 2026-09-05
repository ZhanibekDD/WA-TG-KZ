"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Bot, Check, ChevronLeft, Clipboard, Code2, KeyRound, Plus, RefreshCw, Save, ShieldCheck, Sparkles, Store, Webhook, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type BotKind = "ai" | "support" | "shop" | "automation" | "custom";
type BotDraft = {
  id: string;
  name: string;
  username: string;
  kind: BotKind;
  description: string;
  token: string;
  webhook: string;
  miniApp: string;
  commands: string;
  scopes: string[];
};

const kindLabels: Record<BotKind, string> = {
  ai: "AI-ассистент",
  support: "Поддержка",
  shop: "Магазин",
  automation: "Автоматизация",
  custom: "Свой бот",
};

const scopeOptions = [
  ["messages", "Сообщения"],
  ["groups", "Группы"],
  ["media", "Медиа"],
  ["payments", "Платежи"],
  ["miniapps", "Mini Apps"],
] as const;

const normalizeUsername = (value: string) => value.trim().replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 32);
const makeDemoToken = () => `qz_demo_${crypto.randomUUID().replaceAll("-", "")}`;

export default function BotStudioPage() {
  const [bots, setBots] = useState<BotDraft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [kind, setKind] = useState<BotKind>("ai");
  const [copied, setCopied] = useState(false);

  const selected = useMemo(() => bots.find(bot => bot.id === selectedId) ?? null, [bots, selectedId]);

  function createBot(event: FormEvent) {
    event.preventDefault();
    const safeUsername = normalizeUsername(username);
    if (!name.trim() || safeUsername.length < 4) return;
    const bot: BotDraft = {
      id: crypto.randomUUID(),
      name: name.trim(),
      username: safeUsername,
      kind,
      description: "",
      token: makeDemoToken(),
      webhook: "",
      miniApp: "",
      commands: "/start — Запуск\n/help — Помощь",
      scopes: ["messages"],
    };
    setBots(current => [bot, ...current]);
    setSelectedId(bot.id);
    setCreating(false);
    setName("");
    setUsername("");
    setKind("ai");
  }

  function patchSelected(patch: Partial<BotDraft>) {
    if (!selectedId) return;
    setBots(current => current.map(bot => bot.id === selectedId ? { ...bot, ...patch } : bot));
  }

  function toggleScope(scope: string) {
    if (!selected) return;
    patchSelected({ scopes: selected.scopes.includes(scope) ? selected.scopes.filter(item => item !== scope) : [...selected.scopes, scope] });
  }

  async function copyToken() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return <main className="bot-studio-shell">
    <header className="bot-studio-header">
      <a className="bot-studio-back" href="/"><ChevronLeft />Qazyna</a>
      <div>
        <strong><Bot />Bot Studio</strong>
        <span>Создание и управление чат-ботами</span>
      </div>
      <span className="bot-studio-badge">foundation</span>
    </header>

    <div className="bot-studio-layout">
      <aside className="bot-studio-sidebar">
        <div className="bot-studio-sidebar-title">
          <div><strong>Мои боты</strong><small>{bots.length} создано в этой сессии</small></div>
          <Button size="icon" onClick={() => { setCreating(true); setSelectedId(null); }} aria-label="Создать бота"><Plus /></Button>
        </div>
        <button className={creating ? "bot-list-item active" : "bot-list-item"} onClick={() => { setCreating(true); setSelectedId(null); }}>
          <span className="bot-avatar new"><Plus /></span><span><strong>Создать бота</strong><small>BotFather, но визуально</small></span>
        </button>
        {bots.map(bot => <button key={bot.id} className={selectedId === bot.id ? "bot-list-item active" : "bot-list-item"} onClick={() => { setSelectedId(bot.id); setCreating(false); }}>
          <span className="bot-avatar"><Bot /></span><span><strong>{bot.name}</strong><small>@{bot.username}</small></span>
        </button>)}
      </aside>

      <section className="bot-studio-main">
        {creating ? <div className="bot-create-card">
          <div className="bot-studio-kicker"><Sparkles />Qazyna Bot Platform</div>
          <h1>Создайте чат-бота</h1>
          <p>В Qazyna бот создаётся через понятную форму. Позже те же действия будут доступны внутри системного <strong>@QazynaBot</strong> — кнопками и командами.</p>
          <form onSubmit={createBot} className="bot-create-form">
            <label>Название<Input value={name} onChange={event => setName(event.target.value)} maxLength={64} placeholder="Например, ZakonExpert Assistant" required /></label>
            <label>Username<div className="bot-username-field"><span>@</span><Input value={username} onChange={event => setUsername(normalizeUsername(event.target.value))} minLength={4} maxLength={32} placeholder="zakonexpert_bot" required /></div></label>
            <fieldset><legend>Тип бота</legend><div className="bot-kind-grid">
              {(Object.keys(kindLabels) as BotKind[]).map(item => <button type="button" key={item} className={kind === item ? "active" : ""} onClick={() => setKind(item)}>{item === "ai" ? <Sparkles /> : item === "shop" ? <Store /> : item === "automation" ? <Workflow /> : <Bot />}<span>{kindLabels[item]}</span></button>)}
            </div></fieldset>
            <Button className="bot-primary-action" disabled={!name.trim() || normalizeUsername(username).length < 4}><Plus />Создать бота</Button>
          </form>
          <div className="bot-security-note"><ShieldCheck /><span><strong>Сейчас это foundation UI.</strong> Токен, созданный здесь, локальный тестовый и не работает в сети. Боевые токены будут выпускаться только сервером и показываться один раз.</span></div>
        </div> : selected ? <div className="bot-dashboard">
          <div className="bot-dashboard-title">
            <span className="bot-avatar large"><Bot /></span>
            <div><h1>{selected.name}</h1><p>@{selected.username} · {kindLabels[selected.kind]}</p></div>
            <span className="bot-status"><span />draft</span>
          </div>

          <div className="bot-dashboard-grid">
            <section className="bot-panel bot-token-panel">
              <h2><KeyRound />API token</h2>
              <p>Локальный тестовый токен. Боевой токен будет выдаваться сервером.</p>
              <div className="bot-token-row"><code>{selected.token}</code><Button variant="ghost" size="icon" onClick={() => void copyToken()} aria-label="Копировать токен">{copied ? <Check /> : <Clipboard />}</Button><Button variant="ghost" size="icon" onClick={() => patchSelected({ token: makeDemoToken() })} aria-label="Перевыпустить тестовый токен"><RefreshCw /></Button></div>
            </section>

            <section className="bot-panel">
              <h2><Code2 />Команды</h2>
              <Textarea value={selected.commands} onChange={event => patchSelected({ commands: event.target.value })} rows={6} placeholder="/start — Запуск" />
            </section>

            <section className="bot-panel">
              <h2><Webhook />Webhook</h2>
              <Input value={selected.webhook} onChange={event => patchSelected({ webhook: event.target.value })} placeholder="https://example.kz/qazyna/webhook" />
              <small>HTTPS endpoint для событий сообщений, кнопок, оплат и системных обновлений.</small>
            </section>

            <section className="bot-panel">
              <h2><Sparkles />Mini App</h2>
              <Input value={selected.miniApp} onChange={event => patchSelected({ miniApp: event.target.value })} placeholder="https://app.example.kz" />
              <small>Полноэкранное приложение внутри Qazyna: магазин, CRM, сервис, игра или AI-интерфейс.</small>
            </section>

            <section className="bot-panel bot-permissions">
              <h2><ShieldCheck />Разрешения</h2>
              <div>{scopeOptions.map(([scope, label]) => <label key={scope}><input type="checkbox" checked={selected.scopes.includes(scope)} onChange={() => toggleScope(scope)} /><span>{label}</span></label>)}</div>
            </section>

            <section className="bot-panel bot-description-panel">
              <h2><Bot />Профиль</h2>
              <Textarea value={selected.description} onChange={event => patchSelected({ description: event.target.value })} rows={5} placeholder="Что умеет этот бот?" />
            </section>
          </div>
          <div className="bot-save-row"><Button className="bot-primary-action" onClick={() => undefined}><Save />Сохранено локально</Button><span>Backend/API ещё не подключены — настройки существуют только в этой вкладке.</span></div>
        </div> : null}
      </section>
    </div>
  </main>;
}
