import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Flame, Lightbulb, RotateCcw, Sparkles, X } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { ruleHint, svompt, testQuestions } from "@/lib/data";
import { useRecordAttempt } from "@/lib/api";
import { getBuilderTasksForBlock, getStoredLevel, levelBlocks, type BuilderTask, type LevelBlockId } from "@/lib/placement";

export const Route = createFileRoute("/lessons")({
  head: () => ({
    meta: [
      { title: "Интерактивные уроки — NATIVE" },
      { name: "description", content: "Теория SVOMPT, ASI и QUASI, конструктор предложений и тесты." },
      { property: "og:title", content: "Интерактивные уроки — NATIVE" },
      { property: "og:description", content: "Теория SVOMPT, ASI и QUASI, конструктор предложений и тесты." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
        right={<div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:gap-3">
          <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-faint"><Flame className="size-3" />Стрик не активен</span>
          <button onClick={() => setKey((k) => k + 1)} className="flex items-center gap-1.5 text-sm font-medium hover:text-primary"><RotateCcw className="size-4" />Сбросить</button>
        </div>} />
      <div className="mb-6 grid w-full grid-cols-3 rounded-lg border bg-card p-1 sm:inline-grid sm:w-auto">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`min-w-0 rounded-md px-2 py-2.5 text-sm transition-colors sm:px-6 ${tab === t ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
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
      <section className="panel p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground"><Sparkles className="size-5" /></span>
          <div className="min-w-0"><h2 className="text-xl font-semibold sm:text-2xl">Правило SVOMPT</h2><p className="text-sm text-muted-foreground">Стандартный порядок слов в английских повествовательных предложениях</p></div>
        </div>
        <p className="mt-5 leading-relaxed text-muted-foreground">
          В английском языке существует строгий порядок слов. Правило SVOMPT определяет позицию каждого элемента в предложении:{" "}
          <b className="text-foreground">Подлежащее → Глагол → Дополнение → Образ действия → Место → Время</b>. Соблюдение этого порядка необходимо для естественного звучания английской речи.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[760px] text-sm">
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
          <section key={c.t} className="panel p-4 sm:p-6">
            <h3 className="text-xl font-semibold">{c.t}</h3>
            <p className="mt-2 text-sm text-primary/80">{c.f}</p>
            <p className="mt-4 text-sm text-muted-foreground">{c.d}</p>
            <div className="mt-3 space-y-1.5 rounded-lg bg-background p-4 text-sm">
              {c.ex.map(([a = "", b = ""]) => <p key={a + b}><b className="text-primary">{a}</b>{b}</p>)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function shuffle<T>(a: T[]) { return [...a].sort(() => Math.random() - 0.5); }

function Builder() {
  const initialTasks = getBuilderTasksForBlock("A");
  const [block, setBlock] = useState<LevelBlockId>("A");
  const [tasks, setTasks] = useState<BuilderTask[]>(initialTasks);
  const [idx, setIdx] = useState(0);
  const [task, setTask] = useState<BuilderTask>(initialTasks[0] ?? { topic: "SVOMPT", ru: "", answer: "", block: "A", hint: "" });
  const [picked, setPicked] = useState<{ w: string; i: number }[]>([]);
  const [result, setResult] = useState<null | boolean>(null);
  const record = useRecordAttempt();

  useEffect(() => {
    try {
      const stored = getStoredLevel();
      const b = stored.block;
      const t = getBuilderTasksForBlock(b);
      if (t.length === 0) return;
      setBlock(b);
      setTasks(t);
      setTask(t[0]!);
      setIdx(0);
      setPicked([]);
      setResult(null);
    } catch {
      /* keep defaults */
    }
  }, []);

  const words = useMemo(
    () => shuffle(task.answer.split(" ").map((w, i) => ({ w, i }))),
    [task],
  );

  const check = () => {
    if (result !== null) return;
    const yours = picked.map((p) => p.w).join(" ");
    const ok = yours === task.answer;
    setResult(ok);
    const explanation = task.hint || ruleHint[task.topic] || "";
    record.mutate({ topic: task.topic, correct: ok, mistake: { prompt: task.ru, yours, correct: task.answer, rule: explanation } });
  };
  const pool = words.filter((x) => !picked.some((p) => p.i === x.i));
  const next = () => {
    const ni = (idx + 1) % tasks.length;
    setIdx(ni);
    setTask(tasks[ni]!);
    setPicked([]);
    setResult(null);
  };
  const retry = () => {
    setPicked([]);
    setResult(null);
  };
  const blk = levelBlocks[block];

  return (
    <section className="panel p-4 sm:p-6">
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded px-2 py-0.5 text-xs font-semibold" style={{ background: blk.color + "22", color: blk.color }}>
            Block {block}
          </span>
          <span className="text-xs text-faint">Задание {idx + 1} из {tasks.length}</span>
        </div>
        <Link to="/levels" className="text-xs text-primary hover:underline">Сменить блок</Link>
      </div>
      <h2 className="mt-1 break-words text-xl font-semibold sm:text-2xl">{task.ru}</h2>
      {task.hint && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-faint"><Lightbulb className="size-3" />{task.hint}</p>
      )}
      <div className={`mt-5 flex min-h-16 flex-wrap gap-2 rounded-lg border border-dashed p-3 ${result === true ? "border-success" : result === false ? "border-destructive" : ""}`}>
        {picked.length === 0 && <span className="text-sm text-faint">Нажимайте на слова, чтобы собрать предложение</span>}
        {picked.map((p) => (
          <button key={p.i} disabled={result !== null} onClick={() => setPicked(picked.filter((x) => x.i !== p.i))} className="min-h-11 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:cursor-default">{p.w}</button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {pool.map((p) => <button key={p.i} disabled={result !== null} onClick={() => setPicked([...picked, p])} className="btn-ghost min-h-11 px-3 py-2 disabled:cursor-default disabled:opacity-45">{p.w}</button>)}
      </div>

      {result === true && (
        <div className="fb-correct mt-5 flex items-start gap-3 p-4" role="status">
          <CheckCircle2 className="size-5 shrink-0 text-success" />
          <div className="min-w-0">
            <p className="font-semibold text-success">Верно!</p>
            <p className="text-sm text-success/80">Отличная работа — предложение составлено правильно.</p>
          </div>
        </div>
      )}

      {result === false && (
        <div className="fb-wrong mt-5 space-y-3 p-4" role="status">
          <div className="flex items-center gap-3">
            <X className="size-5 shrink-0 text-destructive" />
            <p className="font-semibold text-destructive">Неверно</p>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Ваш ответ: </span>
            <span className="text-destructive line-through">{picked.map((p) => p.w).join(" ") || "—"}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Правильно: </span>
            <span className="font-medium text-success">{task.answer}</span>
          </div>
          <div className="flex gap-2 rounded-lg border border-primary/40 bg-background/40 p-3 text-sm text-primary">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{task.hint || ruleHint[task.topic] || "Проверьте порядок слов по правилу."}</span>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {result === null && (
          <button disabled={pool.length > 0} onClick={check} className="btn-gold min-h-11 w-full sm:w-auto">Проверить</button>
        )}
        {result === false && (
          <button onClick={retry} className="btn-ghost min-h-11 w-full sm:w-auto"><RotateCcw className="size-4" />Попробовать снова</button>
        )}
        {result !== null && (
          <button onClick={next} className="btn-gold min-h-11 w-full sm:w-auto">Следующее задание <ArrowRight className="size-4" /></button>
        )}
      </div>
    </section>
  );
}

function Test() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const score = testQuestions.filter((q, i) => answers[i] === q.a).length;
  const record = useRecordAttempt();
  const finish = () => {
    setDone(true);
    testQuestions.forEach((q, i) => {
      const ok = answers[i] === q.a;
      record.mutate({ topic: q.topic, correct: ok, mistake: { prompt: q.q, yours: q.options[answers[i] ?? 0] ?? "", correct: q.options[q.a] ?? "", rule: ruleHint[q.topic] ?? "" } });
    });
  };
  return (
    <div className="space-y-4">
      {done && (
        <div className="panel grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-primary/50 p-4 sm:p-5">
          <p className="font-display text-2xl">Результат: <span className="text-primary">{score} / {testQuestions.length}</span></p>
          <button onClick={() => { setAnswers({}); setDone(false); }} className="btn-ghost"><RotateCcw className="size-4" />Заново</button>
        </div>
      )}
      {testQuestions.map((q, i) => (
        <section key={i} className="panel p-4 sm:p-5">
          <p className="text-xs font-semibold text-primary">{q.topic}</p>
          <p className="mt-1 font-medium">{i + 1}. {q.q}</p>
          <div className="mt-3 grid gap-2">
            {q.options.map((o, j) => {
              const sel = answers[i] === j;
              const state = done ? (j === q.a ? "border-success bg-success/10" : sel ? "border-destructive bg-destructive/10" : "") : sel ? "border-primary bg-accent" : "";
               return <button key={j} disabled={done} onClick={() => setAnswers({ ...answers, [i]: j })} className={`min-h-11 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors hover:border-primary ${state}`}>{o}</button>;
            })}
          </div>
        </section>
      ))}
      {!done && <button disabled={Object.keys(answers).length < testQuestions.length} onClick={finish} className="btn-gold">Завершить тест</button>}
    </div>
  );
}
