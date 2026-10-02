import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Check, Flame, Lightbulb, RotateCcw, Sparkles, X } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { builderTasks, svompt, testQuestions } from "@/lib/data";

export const Route = createFileRoute("/lessons")({
  head: () => ({
    meta: [
      { title: "Интерактивные уроки — NATIVE" },
      { name: "description", content: "Теория SVOMPT, ASI и QUASI, конструктор предложений и тесты." },
      { property: "og:title", content: "Интерактивные уроки — NATIVE" },
      { property: "og:description", content: "Теория SVOMPT, ASI и QUASI, конструктор предложений и тесты." },
    ],
  }),
  component: Lessons,
});

const tabs = ["Теория", "Конструктор", "Тест"] as const;

function Lessons() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Теория");
  const [key, setKey] = useState(0);
  return (
    <>
      <PageHeader eyebrow="Уроки грамматики английского" icon={BookOpen} title="Интерактивные уроки"
        subtitle="Изучите правила, практикуйтесь в конструкторе и проверьте знания тестом."
        right={<div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-faint"><Flame className="size-3" />Стрик не активен</span>
          <button onClick={() => setKey((k) => k + 1)} className="flex items-center gap-1.5 text-sm font-medium hover:text-primary"><RotateCcw className="size-4" />Сбросить</button>
        </div>} />
      <div className="mb-6 inline-flex rounded-lg border bg-card p-1">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-md px-6 py-2 text-sm transition-colors ${tab === t ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>
      <div key={tab + key} className="rise">
        {tab === "Теория" && <Theory />}
        {tab === "Конструктор" && <Builder />}
        {tab === "Тест" && <Test />}
      </div>
    </>
  );
}

function Theory() {
  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground"><Sparkles className="size-5" /></span>
          <div><h2 className="text-2xl font-semibold">Правило SVOMPT</h2><p className="text-sm text-muted-foreground">Стандартный порядок слов в английских повествовательных предложениях</p></div>
        </div>
        <p className="mt-5 leading-relaxed text-muted-foreground">
          В английском языке существует строгий порядок слов. Правило SVOMPT определяет позицию каждого элемента в предложении:{" "}
          <b className="text-foreground">Подлежащее → Глагол → Дополнение → Образ действия → Место → Время</b>. Соблюдение этого порядка необходимо для естественного звучания английской речи.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-faint">
              {["Позиция", "Буква", "Термин", "Описание", "Пример"].map((h) => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {svompt.map((r, i) => (
                <tr key={r.l} className="border-b last:border-0 hover:bg-surface">
                  <td className="px-3 py-3"><span className="grid size-6 place-items-center rounded-full border text-xs">{i + 1}</span></td>
                  <td className="px-3 py-3"><span className="grid size-7 place-items-center rounded-md bg-accent font-bold text-accent-foreground">{r.l}</span></td>
                  <td className="px-3 py-3"><b>{r.term}</b> <span className="text-muted-foreground">({r.ru})</span></td>
                  <td className="px-3 py-3 text-muted-foreground">{r.desc}</td>
                  <td className="px-3 py-3"><code className="rounded bg-surface px-2 py-1 text-xs">{r.ex}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex gap-3 rounded-lg border border-primary/40 bg-accent p-4">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="text-sm"><p className="font-semibold text-primary">Пример предложения</p>
            <p className="mt-1 text-primary/90">{svompt.map((r) => <span key={r.l}><b>{r.ex}</b> <span className="opacity-60">({r.l})</span> </span>)}</p></div>
        </div>
      </section>
      <div className="grid gap-6 md:grid-cols-2">
        {[
          { t: "ASI — Yes/No вопросы", f: "Auxiliary + Subject + Infinitive (Вспом. глагол + Подлежащее + Инфинитив)", d: "Для образования вопросов типа «да/нет» вспомогательный глагол ставится перед подлежащим:", ex: [["Are", " you coming tonight?"], ["Did", " she finish the project?"], ["Does", " he like coffee?"]] },
          { t: "QUASI — WH-вопросы", f: "Question word + Auxiliary + Subject + Infinitive", d: "WH-вопросы начинаются с вопросительного слова, затем идёт порядок ASI:", ex: [["Where are", " you going?"], ["Why did", " she leave?"], ["What does", " he want?"]] },
        ].map((c) => (
          <section key={c.t} className="panel p-6">
            <h3 className="text-xl font-semibold">{c.t}</h3>
            <p className="mt-2 text-sm text-primary/80">{c.f}</p>
            <p className="mt-4 text-sm text-muted-foreground">{c.d}</p>
            <div className="mt-3 space-y-1.5 rounded-lg bg-background p-4 text-sm">
              {c.ex.map(([a, b]) => <p key={a + b}><b className="text-primary">{a}</b>{b}</p>)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function shuffle<T>(a: T[]) { return [...a].sort(() => Math.random() - 0.5); }

function Builder() {
  const [idx, setIdx] = useState(0);
  const task = builderTasks[idx];
  const words = useMemo(() => shuffle(task.answer.split(" ").map((w, i) => ({ w, i }))), [task]);
  const [picked, setPicked] = useState<{ w: string; i: number }[]>([]);
  const [result, setResult] = useState<null | boolean>(null);
  const pool = words.filter((x) => !picked.some((p) => p.i === x.i));
  const next = () => { setIdx((idx + 1) % builderTasks.length); setPicked([]); setResult(null); };

  return (
    <section className="panel p-6">
      <p className="text-xs text-faint">Задание {idx + 1} из {builderTasks.length}</p>
      <h2 className="mt-1 text-2xl font-semibold">{task.ru}</h2>
      <div className={`mt-5 flex min-h-16 flex-wrap gap-2 rounded-lg border border-dashed p-3 ${result === true ? "border-success" : result === false ? "border-destructive" : ""}`}>
        {picked.length === 0 && <span className="text-sm text-faint">Нажимайте на слова, чтобы собрать предложение</span>}
        {picked.map((p) => (
          <button key={p.i} onClick={() => { setPicked(picked.filter((x) => x.i !== p.i)); setResult(null); }} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">{p.w}</button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {pool.map((p) => <button key={p.i} onClick={() => setPicked([...picked, p])} className="btn-ghost px-3 py-1.5">{p.w}</button>)}
      </div>
      {result !== null && (
        <p className={`mt-4 flex items-center gap-2 text-sm ${result ? "text-success" : "text-destructive"}`}>
          {result ? <><Check className="size-4" />Верно!</> : <><X className="size-4" />Правильно: {task.answer}</>}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <button disabled={pool.length > 0} onClick={() => setResult(picked.map((p) => p.w).join(" ") === task.answer)} className="btn-gold">Проверить</button>
        <button onClick={next} className="btn-ghost">Следующее</button>
      </div>
    </section>
  );
}

function Test() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const score = testQuestions.filter((q, i) => answers[i] === q.a).length;
  return (
    <div className="space-y-4">
      {done && (
        <div className="panel flex items-center justify-between border-primary/50 p-5">
          <p className="font-display text-2xl">Результат: <span className="text-primary">{score} / {testQuestions.length}</span></p>
          <button onClick={() => { setAnswers({}); setDone(false); }} className="btn-ghost"><RotateCcw className="size-4" />Заново</button>
        </div>
      )}
      {testQuestions.map((q, i) => (
        <section key={i} className="panel p-5">
          <p className="text-xs font-semibold text-primary">{q.topic}</p>
          <p className="mt-1 font-medium">{i + 1}. {q.q}</p>
          <div className="mt-3 grid gap-2">
            {q.options.map((o, j) => {
              const sel = answers[i] === j;
              const state = done ? (j === q.a ? "border-success bg-success/10" : sel ? "border-destructive bg-destructive/10" : "") : sel ? "border-primary bg-accent" : "";
              return <button key={j} disabled={done} onClick={() => setAnswers({ ...answers, [i]: j })} className={`rounded-lg border px-4 py-2.5 text-left text-sm transition-colors hover:border-primary ${state}`}>{o}</button>;
            })}
          </div>
        </section>
      ))}
      {!done && <button disabled={Object.keys(answers).length < testQuestions.length} onClick={() => setDone(true)} className="btn-gold">Завершить тест</button>}
    </div>
  );
}
