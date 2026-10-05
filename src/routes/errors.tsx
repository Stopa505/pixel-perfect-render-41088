import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bug, Check, CheckCircle2, Lightbulb, RotateCcw, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { useDeleteMistake, useMistakes, useRecordAttempt } from "@/lib/api";

export const Route = createFileRoute("/errors")({
  head: () => ({
    meta: [
      { title: "Мои ошибки — NATIVE" },
      { name: "description", content: "Архив ошибок с правильными ответами и правилами для пересдачи." },
      { property: "og:title", content: "Мои ошибки — NATIVE" },
      { property: "og:description", content: "Архив ошибок с правильными ответами и правилами для пересдачи." },
    ],
  }),
  component: Errors,
});

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\s]/gu, "").replace(/\s+/g, " ").trim();

function Errors() {
  const { data: items = [], isLoading } = useMistakes();
  const del = useDeleteMistake();
  const record = useRecordAttempt();
  const [retake, setRetake] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const check = (id: string, topic: string, correct: string) => {
    const ok = norm(input) === norm(correct);
    record.mutate({ topic, correct: ok });
    if (ok) {
      del.mutate(id); toast.success("Верно! Ошибка закрыта");
      setRetake(null); setInput("");
    } else toast.error("Пока неверно — сверьтесь с правилом");
  };

  return (
    <>
      <PageHeader eyebrow="Журнал ошибок" icon={Bug} title="Мои ошибки" subtitle="Просматривайте свои ошибки, изучайте правильное правило и пересдавайте." />
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm text-muted-foreground">
        <span>{items.length} ошибок к проверке</span>
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">{items.length} в очереди</span>
      </div>
      {isLoading && <p className="text-faint">Загрузка…</p>}
      {!isLoading && items.length === 0 && (
        <div className="panel grid place-items-center p-8 text-center sm:p-12">
          <CheckCircle2 className="size-10 text-success" />
          <p className="mt-3 font-display text-2xl">Все ошибки проработаны</p>
          <p className="text-sm text-muted-foreground">Отличная работа — очередь пуста.</p>
        </div>
      )}
      <div className="space-y-4">
        {items.map((m) => (
          <article key={m.id} className="panel rise min-w-0 space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded bg-accent px-2 py-0.5 font-semibold text-accent-foreground">{m.topic}</span>
              <span className="text-faint">{new Date(m.created_at).toLocaleDateString("ru-RU")}</span>
            </div>
            <p className="font-medium">{m.prompt}</p>
            <div className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <XCircle className="mt-0.5 size-4 shrink-0" /><span><b>Ваш ответ:</b> {m.yours || "—"}</span>
            </div>
            <div className="flex gap-2 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" /><span><b>Правильно:</b> {m.correct}</span>
            </div>
            <div className="flex gap-2 rounded-lg border border-primary/40 bg-accent p-3 text-sm text-primary">
              <Lightbulb className="mt-0.5 size-4 shrink-0" />{m.rule}
            </div>
            {retake === m.id && (
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <input autoFocus value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check(m.id, m.topic, m.correct)} placeholder="Введите правильный ответ…" className="field" />
                <button onClick={() => check(m.id, m.topic, m.correct)} className="btn-gold min-h-11 min-w-11 px-3" aria-label="Проверить ответ"><Check className="size-4" /></button>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button onClick={() => { setRetake(retake === m.id ? null : m.id); setInput(""); }} className="btn-gold min-h-11"><RotateCcw className="size-4" />Пересдать</button>
              <button onClick={() => del.mutate(m.id)} className="flex items-center gap-1.5 text-sm font-medium hover:text-destructive"><Trash2 className="size-4" />Удалить</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
