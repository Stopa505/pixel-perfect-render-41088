import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Languages, Lightbulb, Loader2, MessagesSquare, RotateCcw, Send } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { getStoredLevel, levelBlocks, type LevelBlockId } from "@/lib/placement";
import { scenarios, type Scenario } from "@/lib/vocab";
import { dialogueTurn, geminiStatus } from "@/lib/gemini.functions";
import { getGeminiKey } from "@/lib/gemini-key";

export const Route = createFileRoute("/dialogues")({
  head: () => ({
    meta: [
      { title: "ИИ-диалоги — NATIVE" },
      { name: "description", content: "Ролевые диалоги на английском с ИИ-собеседником, подсказками и исправлением ошибок." },
      { property: "og:title", content: "ИИ-диалоги — NATIVE" },
      { property: "og:description", content: "Ролевые диалоги на английском с ИИ-собеседником, подсказками и исправлением ошибок." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dialogues,
});

type Msg = { role: "user" | "ai"; text: string; ru?: string; correction?: string | null | undefined; explanation?: string | null | undefined };

function Dialogues() {
  const [block, setBlock] = useState<LevelBlockId>("A");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const status = useServerFn(geminiStatus);

  useEffect(() => {
    try { setBlock(getStoredLevel().block); } catch { /* keep default */ }
    const local = !!getGeminiKey();
    if (local) setHasKey(true);
    else status().then((r) => setHasKey(r.configured)).catch(() => setHasKey(false));
  }, [status]);

  return (
    <>
      <PageHeader eyebrow="Практика" icon={MessagesSquare} title="ИИ-диалоги" subtitle="Разговаривайте с ИИ-собеседником в жизненных ситуациях — он исправит ошибки и подскажет." />
      {hasKey === false && (
        <div className="panel mb-5 border-primary/40 p-4 text-sm">
          Ключ Gemini не настроен. <Link to="/gemini" className="text-primary underline">Добавьте ключ</Link>, чтобы начать диалог.
        </div>
      )}
      {scenario ? (
        <Chat key={scenario.id} scenario={scenario} block={block} onBack={() => setScenario(null)} />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {(["A", "B", "C"] as const).map((b) => (
              <button key={b} onClick={() => setBlock(b)} className={`min-h-11 rounded-lg border px-4 text-sm ${block === b ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
                Блок {b} · {levelBlocks[b].levels.map((l) => l.code).join("/")}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(scenarios[block] ?? []).map((s) => (
              <button key={s.id} onClick={() => setScenario(s)} className="panel rise min-w-0 p-5 text-left transition-colors hover:border-primary/60">
                <span className="text-3xl">{s.emoji}</span>
                <h2 className="mt-3 text-lg font-semibold">{s.title}</h2>
                <p className="text-sm text-muted-foreground">{s.ru}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function Chat({ scenario, block, onBack }: { scenario: Scenario; block: LevelBlockId; onBack: () => void }) {
  const turn = useServerFn(dialogueTurn);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [hint, setHint] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showRu, setShowRu] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const send = async (history: Msg[]) => {
    setBusy(true);
    setError("");
    setShowHint(false);
    try {
      const r = await turn({ data: { scenario: scenario.title, role: scenario.role, block, history: history.map(({ role, text }) => ({ role, text })), apiKey: getGeminiKey() || undefined } });
      if (!r.ok) { setError(r.message); return; }
      const t = r.turn;
      const next = [...history];
      const last = next[next.length - 1];
      if (last?.role === "user") next[next.length - 1] = { ...last, correction: t.correction ?? null, explanation: t.explanation ?? null };
      setMsgs([...next, { role: "ai", text: t.reply, ru: t.reply_ru }]);
      setHint(t.hint);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось связаться с Gemini");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void send([]).catch(() => setError("Не удалось начать диалог"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const h = [...msgs, { role: "user" as const, text }];
    setMsgs(h);
    setInput("");
    void send(h);
  };

  return (
    <div className="panel flex min-h-[60dvh] flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b p-3 sm:p-4">
        <button onClick={onBack} className="btn-ghost min-h-11"><ArrowLeft className="size-4" />Сценарии</button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{scenario.emoji} {scenario.title}</p>
          <p className="truncate text-xs text-muted-foreground">Блок {block} · {scenario.ru}</p>
        </div>
        <button onClick={() => setShowRu(!showRu)} aria-pressed={showRu} className={`btn-ghost min-h-11 ${showRu ? "text-primary" : ""}`}><Languages className="size-4" />Перевод</button>
        <button onClick={() => { setMsgs([]); setHint(""); void send([]); }} className="btn-ghost min-h-11" aria-label="Начать заново"><RotateCcw className="size-4" /></button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-5">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%] min-w-0 space-y-2">
              <div className={`break-words rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "border bg-surface"}`}>
                {m.text}
                {showRu && m.ru && <p className="mt-1.5 border-t border-border/60 pt-1.5 text-xs text-muted-foreground">{m.ru}</p>}
              </div>
              {m.role === "user" && m.correction && (
                <div className="fb-wrong rounded-xl p-3 text-xs">
                  <p><span className="text-muted-foreground">Лучше: </span><span className="font-semibold text-primary">{m.correction}</span></p>
                  {m.explanation && <p className="mt-1 text-muted-foreground">{m.explanation}</p>}
                </div>
              )}
              {m.role === "user" && m.correction === null && <p className="text-right text-xs text-success">✓ Без ошибок</p>}
            </div>
          </div>
        ))}
        {busy && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Собеседник печатает…</div>}
        {error && <p className="fb-wrong rounded-xl p-3 text-sm">{error}</p>}
        <div ref={endRef} />
      </div>

      <div className="safe-bottom space-y-2 border-t p-3 sm:p-4">
        {showHint && hint && (
          <div className="flex items-start gap-2 rounded-lg border border-primary/40 bg-background/40 p-3 text-sm">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
            <button type="button" onClick={() => setInput(hint)} className="text-left text-primary hover:underline">{hint}</button>
          </div>
        )}
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Напишите ответ по-английски…" className="field min-w-0 flex-1" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowHint(!showHint)} disabled={!hint} className="btn-ghost min-h-11 flex-1 sm:flex-none"><Lightbulb className="size-4" />Подсказка</button>
            <button disabled={busy || !input.trim()} className="btn-gold min-h-11 flex-1 sm:flex-none"><Send className="size-4" />Отправить</button>
          </div>
        </form>
      </div>
    </div>
  );
}
