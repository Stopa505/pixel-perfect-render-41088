import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardList, RotateCcw, Trophy } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import {
  levelBlocks,
  placementQuestions,
  savePlacementResult,
  scorePlacement,
  type LevelBlockId,
  type StoredLevel,
} from "@/lib/placement";

export const Route = createFileRoute("/placement")({
  head: () => ({
    meta: [
      { title: "Placement Test — NATIVE" },
      { name: "description", content: "Определите уровень английского и получите рекомендованный блок обучения." },
    ],
  }),
  component: Placement,
});

function Placement() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [stored, setStored] = useState<StoredLevel | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("native_user_level");
      if (raw) setStored(JSON.parse(raw) as StoredLevel);
    } catch { /* noop */ }
  }, []);

  const total = placementQuestions.length;
  const q = placementQuestions[current]!;
  const progress = ((current + (phase === "result" ? 1 : 0)) / total) * 100;

  const select = (opt: number) => {
    setAnswers({ ...answers, [current]: opt });
    if (current < total - 1) {
      setCurrent(current + 1);
    } else {
      const result = scorePlacement({ ...answers, [current]: opt });
      savePlacementResult(result);
      setStored({
        block: result.block,
        placementDone: true,
        placementDate: new Date().toISOString(),
        scores: result.scores,
      });
      setPhase("result");
    }
  };

  const restart = () => {
    setPhase("intro");
    setCurrent(0);
    setAnswers({});
  };

  if (phase === "intro") {
    return (
      <>
        <PageHeader
          eyebrow="Определение уровня"
          icon={ClipboardList}
          title="Placement Test"
          subtitle="Пройдите короткий тест из 18 вопросов, чтобы определить ваш уровень английского и получить рекомендованный блок обучения."
        />
        <div className="panel rise p-8 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent">
            <ClipboardList className="size-8 text-primary" />
          </span>
          <h2 className="mt-6 font-display text-3xl">Готовы начать?</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Тест состоит из вопросов разной сложности — от базовых до продвинутых. По результатам вы получите рекомендацию одного из трёх блоков: A, B или C.
          </p>
          <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              {(["A", "B", "C"] as LevelBlockId[]).map((b) => (
                <span key={b} className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ background: levelBlocks[b].color }} />
                  Block {b}
                </span>
              ))}
            </div>
            <span className="text-xs text-faint">18 вопросов · примерно 5 минут</span>
          </div>
          <button onClick={() => setPhase("quiz")} className="btn-gold mx-auto mt-8">
            Начать тест <ArrowRight className="size-4" />
          </button>
          {stored?.placementDone && (
            <div className="mt-6 rounded-lg border border-primary/30 bg-accent p-4 text-sm">
              <p className="text-muted-foreground">
                Последний результат: <b className="text-primary">Block {stored.block}</b> от{" "}
                {new Date(stored.placementDate).toLocaleDateString("ru-RU")}
              </p>
              <button onClick={restart} className="mt-2 text-xs text-primary underline">
                Пройти заново
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  if (phase === "result") {
    const result = scorePlacement(answers);
    const block = levelBlocks[result.block];
    return (
      <>
        <PageHeader
          eyebrow="Результат теста"
          icon={Trophy}
          title="Ваш уровень определён"
          subtitle="На основе ваших ответов мы подобрали оптимальный блок обучения."
        />
        <div className="panel rise mb-6 p-8 text-center" style={{ borderColor: block.color + "60" }}>
          <span className="text-4xl">{block.badge}</span>
          <h2 className="mt-3 font-display text-3xl" style={{ color: block.color }}>{block.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{block.subtitle}</p>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">{block.description}</p>
          <div className="mx-auto mt-6 flex max-w-xs flex-col gap-2">
            {(["A", "B", "C"] as LevelBlockId[]).map((b) => {
              const count = placementQuestions.filter((q) => q.block === b).length;
              const pct = Math.round((result.scores[b] / count) * 100);
              return (
                <div key={b} className="flex items-center gap-3">
                  <span className="w-16 text-sm font-medium" style={{ color: levelBlocks[b].color }}>Block {b}</span>
                  <div className="flex-1 h-2 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: levelBlocks[b].color }} />
                  </div>
                  <span className="w-10 text-right text-xs tabular-nums text-faint">{result.scores[b]}/{count}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/levels" className="btn-gold">Подробнее о блоке <ArrowRight className="size-4" /></Link>
            <Link to="/lessons" className="btn-ghost">К урокам</Link>
          </div>
        </div>
        <div className="panel rise p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-success" />
            <p className="text-sm text-muted-foreground">
              Ваш результат сохранён. Конструктор предложений теперь адаптирован под <b className="text-primary">Block {result.block}</b>.
              Вы можете изменить блок вручную на странице уровней.
            </p>
          </div>
          <button onClick={restart} className="btn-ghost mt-4"><RotateCcw className="size-4" />Пройти тест заново</button>
        </div>
      </>
    );
  }

  // ── Quiz phase ──
  return (
    <>
      <PageHeader
        eyebrow={`Вопрос ${current + 1} из ${total}`}
        icon={ClipboardList}
        title="Placement Test"
        subtitle="Выберите правильный вариант ответа."
      />
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <section key={current} className="panel rise p-6">
        <span className="rounded bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
          Block {q.block}
        </span>
        <h2 className="mt-3 text-xl font-semibold">{q.q}</h2>
        <div className="mt-5 grid gap-2">
          {q.options.map((opt, j) => {
            const sel = answers[current] === j;
            return (
              <button
                key={j}
                onClick={() => select(j)}
                className={`rounded-lg border px-4 py-3 text-left text-sm transition-all hover:border-primary ${
                  sel ? "border-primary bg-accent" : "border-border bg-surface"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-faint">
          <button
            disabled={current === 0}
            onClick={() => setCurrent(current - 1)}
            className="hover:text-foreground disabled:opacity-30"
          >
            ← Назад
          </button>
          <span>{Object.keys(answers).length} из {total} отвечено</span>
        </div>
      </section>
    </>
  );
}
