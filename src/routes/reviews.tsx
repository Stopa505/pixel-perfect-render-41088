import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Film, Lightbulb, Loader2, Plus, Save, ScanText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Эссе по фильмам — NATIVE" },
      { name: "description", content: "Пишите структурированные рецензии на фильмы и проверяйте фото эссе с AI." },
      { property: "og:title", content: "Эссе по фильмам — NATIVE" },
      { property: "og:description", content: "Пишите структурированные рецензии на фильмы и проверяйте фото эссе с AI." },
    ],
  }),
  component: Reviews,
});

const sections = [
  { k: "intro", t: "1. Introduction", p: "Introduce the film, its director, and the main themes..." },
  { k: "plot", t: "2. Plot Summary", p: "Summarize the main events of the film..." },
  { k: "chars", t: "3. Character Analysis", p: "Analyze the main characters and their development..." },
  { k: "themes", t: "4. Themes & Reflection", p: "Discuss the key themes and your personal reflection..." },
];
const count = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const empty = { title: "", intro: "", plot: "", chars: "", themes: "" };

function Reviews() {
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [photo, setPhoto] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const total = sections.reduce((n, s) => n + count(form[s.k]), 0);

  const save = () => {
    if (!form.title.trim()) return toast.error("Введите название фильма");
    const list = JSON.parse(localStorage.getItem("native-essays") || "[]");
    localStorage.setItem("native-essays", JSON.stringify([...list, { ...form, date: Date.now() }]));
    toast.success(`Эссе «${form.title}» сохранено`);
  };
  const analyze = () => {
    setChecking(true);
    setTimeout(() => { setChecking(false); toast("Для AI-проверки подключите Gemini на странице интеграции"); }, 1200);
  };

  return (
    <>
      <PageHeader eyebrow="Кино-рецензии" icon={Film} title="Эссе по фильмам" subtitle="Пишите структурированные рецензии и загружайте фото эссе для AI-анализа грамматики."
        right={<button onClick={() => { setForm(empty); setPhoto(null); }} className="btn-ghost"><Plus className="size-4" />Новое эссе</button>} />

      <section className="panel rise mb-6 border-primary/40 bg-accent p-6">
        <div className="flex gap-3">
          <ScanText className="mt-1 size-5 text-primary" />
          <div><h2 className="text-xl font-semibold">AI-анализ фото эссе</h2>
            <p className="text-sm text-muted-foreground">Загрузите фото рукописного или печатного эссе для проверки грамматики, орфографии и стиля</p></div>
        </div>
        {photo && (
          <div className="relative mt-4 inline-block">
            <img src={photo} alt="Фото эссе" className="h-32 rounded-lg border object-cover" />
            <button onClick={() => setPhoto(null)} className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-card border"><X className="size-3" /></button>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f)); }} />
          <button onClick={() => fileRef.current?.click()} className="btn-ghost"><Upload className="size-4" />Загрузить фото</button>
          <button disabled={!photo || checking} onClick={analyze} className="btn-gold">
            {checking ? <Loader2 className="size-4 animate-spin" /> : <ScanText className="size-4" />}Проверить эссе
          </button>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-faint"><Lightbulb className="size-3" />Сделайте фото рукописного эссе или загрузите скриншот печатного текста — AI проверит грамматику и стиль.</p>
      </section>

      <section className="panel rise space-y-6 p-6">
        <div>
          <label className="mb-2 block text-xs text-faint">Название фильма</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Введите название фильма..." className="field font-display text-lg" />
        </div>
        {sections.map((s) => (
          <div key={s.k}>
            <label className="mb-2 block text-sm font-semibold">{s.t}</label>
            <textarea rows={3} value={form[s.k]} onChange={(e) => setForm({ ...form, [s.k]: e.target.value })} placeholder={s.p} className="field resize-y" />
            <p className="mt-1 text-xs text-faint">{count(form[s.k])} слов</p>
          </div>
        ))}
        <div className="flex items-center justify-between border-t pt-5">
          <p className="text-sm text-muted-foreground">Всего: <b className="text-foreground">{total} слов</b></p>
          <button onClick={save} className="btn-gold"><Save className="size-4" />Сохранить эссе</button>
        </div>
      </section>
    </>
  );
}
