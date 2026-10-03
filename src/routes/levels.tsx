import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardList, GraduationCap, Layers } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import {
  blockList,
  getStoredLevel,
  setActiveBlock,
  type LevelBlockId,
  type StoredLevel,
} from "@/lib/placement";

export const Route = createFileRoute("/levels")({
  head: () => ({
    meta: [
      { title: "Уровни — NATIVE" },
      { name: "description", content: "Три блока обучения: A (A1–A2), B (B1–B2), C (C1–C2). Выберите подходящий и переключайтесь вручную." },
    ],
  }),
  component: Levels,
});

function Levels() {
  const [stored, setStored] = useState<StoredLevel | null>(null);

  const refresh = () => {
    try {
      const raw = localStorage.getItem("native_user_level");
      setStored(raw ? (JSON.parse(raw) as StoredLevel) : null);
    } catch {
      setStored(null);
    }
  };

  useEffect(() => { refresh(); }, []);

  const switchBlock = (id: LevelBlockId) => {
    setActiveBlock(id);
    refresh();
  };

  return (
    <>
      <PageHeader
        eyebrow="Уровни обучения"
        icon={Layers}
        title="Блоки A, B, C"
        subtitle="Три блока по уровням CEFR. Пройдите тест для автоматического определения или выберите блок вручную."
        right={
          <Link to="/placement" className="btn-gold">
            <ClipboardList className="size-4" />Placement Test
          </Link>
        }
      />

      <div className="space-y-6">
        {blockList.map((block) => {
          const isActive = stored?.block === block.id;
          return (
            <article
              key={block.id}
              className="panel rise p-6"
              style={{ borderColor: isActive ? block.color + "80" : undefined }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span
                    className="grid size-14 shrink-0 place-items-center rounded-2xl text-2xl font-bold"
                    style={{ background: block.color + "22", color: block.color }}
                  >
                    {block.id}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{block.badge}</span>
                      <h2 className="font-display text-2xl font-semibold">{block.title}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">{block.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isActive && (
                    <span
                      className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: block.color + "22", color: block.color }}
                    >
                      <CheckCircle2 className="size-3.5" />Активен
                    </span>
                  )}
                  <button
                    onClick={() => switchBlock(block.id)}
                    disabled={isActive}
                    className="btn-gold"
                    style={isActive ? { opacity: 0.4 } : undefined}
                  >
                    {isActive ? "Текущий блок" : "Выбрать блок"}
                  </button>
                </div>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">{block.description}</p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-faint">
                    <GraduationCap className="size-4" />Включает уровни
                  </h3>
                  <div className="space-y-3">
                    {block.levels.map((lvl) => (
                      <div key={lvl.code} className="rounded-lg border bg-surface p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded px-2 py-0.5 text-xs font-bold"
                            style={{ background: block.color + "22", color: block.color }}
                          >
                            {lvl.code}
                          </span>
                          <span className="text-sm font-medium">{lvl.name}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{lvl.can}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-faint">
                    <Layers className="size-4" />Ключевые навыки
                  </h3>
                  <ul className="space-y-1.5">
                    {block.skills.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: block.color }} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-faint">Учебный план</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {block.roadmap.map((phase, i) => (
                    <div key={phase.phase} className="rounded-lg border bg-surface p-4">
                      <span
                        className="grid size-7 place-items-center rounded-full text-xs font-bold"
                        style={{ background: block.color + "22", color: block.color }}
                      >
                        {i + 1}
                      </span>
                      <p className="mt-3 text-sm font-semibold">{phase.phase}</p>
                      <ul className="mt-2 space-y-1">
                        {phase.topics.map((t) => (
                          <li key={t} className="text-xs text-muted-foreground">{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {isActive && (
                <div className="mt-6 flex items-center gap-3 border-t pt-4">
                  <Link to="/lessons" className="btn-ghost">
                    К конструктору <ArrowRight className="size-4" />
                  </Link>
                  <span className="text-xs text-faint">
                    Конструктор адаптирован под Block {block.id}
                  </span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
