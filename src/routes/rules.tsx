import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NotebookText, Search } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { rules } from "@/lib/data";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Справочник правил — NATIVE" },
      { name: "description", content: "Краткий справочник правил английской грамматики с формулами и примерами." },
      { property: "og:title", content: "Справочник правил — NATIVE" },
      { property: "og:description", content: "Краткий справочник правил английской грамматики с формулами и примерами." },
    ],
  }),
  component: Rules,
});

function Rules() {
  const [q, setQ] = useState("");
  const list = rules.filter((r) => (r.topic + r.title + r.body + r.formula).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader eyebrow="Справочник" icon={NotebookText} title="Справочник правил" subtitle="Все правила грамматики в одном месте — с формулами и примерами." />
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск правила…" className="field pl-10" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((r) => (
          <article key={r.topic} className="panel rise p-6">
            <span className="rounded bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{r.topic}</span>
            <h2 className="mt-3 text-xl font-semibold">{r.title}</h2>
            <p className="mt-2 rounded-lg border border-primary/30 bg-background px-3 py-2 text-sm text-primary">{r.formula}</p>
            <p className="mt-3 text-sm text-muted-foreground">{r.body}</p>
            <ul className="mt-3 space-y-1 text-sm">{r.ex.map((e) => <li key={e} className="before:mr-2 before:text-primary before:content-['—']">{e}</li>)}</ul>
          </article>
        ))}
        {list.length === 0 && <p className="text-muted-foreground">Ничего не найдено.</p>}
      </div>
    </>
  );
}
