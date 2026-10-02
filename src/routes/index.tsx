import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Bug, CalendarDays, Check, ChevronDown, ChevronUp, Clock, Film, Flame, Target, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Личный кабинет — NATIVE" },
      { name: "description", content: "Прогресс, статистика и время обучения английскому в NATIVE." },
      { property: "og:title", content: "Личный кабинет — NATIVE" },
      { property: "og:description", content: "Прогресс, статистика и время обучения английскому в NATIVE." },
    ],
  }),
  component: Dashboard,
});

const chart = [
  { topic: "SVOMPT", score: 190, accuracy: 72 },
  { topic: "ASI", score: 60, accuracy: 70 },
  { topic: "QUASI", score: 40, accuracy: 100 },
];
const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

function Dashboard() {
  const stats = [
    { v: "290", l: "Общий балл", i: TrendingUp },
    { v: "71%", l: "Точность", i: Target },
    { v: "0", l: "Кино-рецензии", i: Film },
    { v: "0 дн.", l: "Стрик", i: Flame },
  ];
  return (
    <div className="space-y-6">
      <section className="panel rise flex flex-wrap items-center justify-between gap-5 p-6">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-3 rounded-lg border bg-surface px-3 py-2">
            <Flame className="size-4 text-faint" />
            <div><p className="text-xs font-medium">Стрик неактивен</p><p className="text-[11px] text-faint">Пройдите конструктор</p></div>
          </div>
          <div>
            <h1 className="text-3xl font-semibold">С возвращением, savinstepan456!</h1>
            <p className="mt-1 text-sm text-muted-foreground">Отслеживайте прогресс и продолжайте обучение</p>
          </div>
        </div>
        <Link to="/lessons" className="btn-gold"><BookOpen className="size-4" />Продолжить обучение</Link>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ v, l, i: I }, n) => (
          <div key={l} className="panel rise p-5" style={{ animationDelay: `${n * 60}ms` }}>
            <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground"><I className="size-4" /></span>
            <p className="mt-4 font-display text-3xl font-semibold">{v}</p>
            <p className="text-sm text-muted-foreground">{l}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="panel rise p-6">
          <h2 className="text-xl font-semibold">Прогресс по грамматике</h2>
          <p className="text-sm text-muted-foreground">Балл и точность по темам SVOMPT, ASI и QUASI</p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="topic" stroke="var(--faint)" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="var(--faint)" tickLine={false} axisLine={false} fontSize={12} width={32} />
                <Tooltip cursor={{ fill: "var(--surface)" }} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--foreground)" }} />
                <Bar dataKey="score" name="Балл" radius={[6, 6, 0, 0]}>
                  {chart.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Bar>
                <Bar dataKey="accuracy" name="Точность, %" radius={[6, 6, 0, 0]} fill="var(--border)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 border-t pt-4">
            {chart.map((c, i) => (
              <div key={c.topic} className="flex items-center gap-2 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: colors[i] }} />
                {c.topic}
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{c.score} очк.</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <TimeCard />
          <div className="panel rise p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold"><CalendarDays className="size-5 text-primary" />Журнал занятий</h2>
            <p className="text-sm text-muted-foreground">Время, уделённое учёбе</p>
            <div className="mt-4 space-y-3">
              {[{ t: "Сегодня", s: "Не начат", i: Clock }, { t: "За неделю", s: "0 занятий", i: CalendarDays }].map(({ t, s, i: I }) => (
                <div key={t} className="flex items-center gap-3 rounded-lg border bg-surface p-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground"><I className="size-4" /></span>
                  <div className="flex-1"><p className="text-sm font-medium">{t}</p><p className="text-xs text-faint">{s}</p></div>
                  <p className="font-display text-xl">0 <span className="text-xs text-faint">мин</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { to: "/lessons", t: "К урокам", s: "Практика грамматики", i: BookOpen },
          { to: "/errors", t: "Мои ошибки", s: "Архив ошибок", i: Bug },
          { to: "/reviews", t: "Кино-рецензии", s: "Написать эссе", i: Film },
        ].map(({ to, t, s, i: I }) => (
          <Link key={to} to={to} className="panel group flex items-center gap-4 p-5 transition-colors hover:border-primary">
            <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground"><I className="size-5" /></span>
            <div className="flex-1"><p className="font-medium">{t}</p><p className="text-sm text-muted-foreground">{s}</p></div>
            <ArrowRight className="size-4 text-faint transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </section>
    </div>
  );
}

function TimeCard() {
  const [h, setH] = useState(19);
  const [m, setM] = useState(15);
  const [saved, setSaved] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    const raw = localStorage.getItem("native-time");
    if (raw) { const [a, b] = raw.split(":").map(Number); setH(a); setM(b); }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    localStorage.setItem("native-time", `${h}:${m}`);
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1500);
    return () => clearTimeout(t);
  }, [h, m]);

  const Seg = ({ v, set, max, step }: { v: number; set: (n: number) => void; max: number; step: number }) => {
    const change = (d: number) => set((v + d * step + max) % max);
    const startY = useRef<number | null>(null);
    return (
      <div
        className="flex select-none flex-col items-center"
        onWheel={(e) => change(e.deltaY > 0 ? 1 : -1)}
        onPointerDown={(e) => { startY.current = e.clientY; }}
        onPointerUp={(e) => { if (startY.current !== null) { const d = e.clientY - startY.current; if (Math.abs(d) > 15) change(d > 0 ? -1 : 1); } startY.current = null; }}
      >
        <button onClick={() => change(1)} className="text-faint hover:text-primary" aria-label="Больше"><ChevronUp className="size-4" /></button>
        <span className="w-14 cursor-ns-resize text-center font-display text-3xl tabular-nums">{String(v).padStart(2, "0")}</span>
        <button onClick={() => change(-1)} className="text-faint hover:text-primary" aria-label="Меньше"><ChevronDown className="size-4" /></button>
      </div>
    );
  };

  return (
    <div className="panel rise p-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold"><Clock className="size-5 text-primary" />Время обучения</h2>
      <p className="text-sm text-muted-foreground">Выберите удобное время для занятий</p>
      <div className="mt-4 flex items-center justify-center gap-1 rounded-full border bg-background px-4 py-1">
        <Seg v={h} set={setH} max={24} step={1} />
        <span className="font-display text-3xl text-primary">:</span>
        <Seg v={m} set={setM} max={60} step={5} />
      </div>
      <p className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${saved ? "text-success" : "text-faint"}`}>
        {saved ? <><Check className="size-3.5" />Сохранено</> : "Прокрутите или потяните. Время сохраняется автоматически."}
      </p>
    </div>
  );
}
