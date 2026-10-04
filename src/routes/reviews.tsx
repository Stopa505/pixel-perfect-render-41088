import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Film, Lightbulb, Loader2, Plus, Save, ScanText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { useEssays, useSaveEssay } from "@/lib/api";
import { getGeminiKey } from "@/lib/gemini-key";
import { analyzeEssay, type EssayFeedback } from "@/lib/gemini.functions";

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
] as const;
const count = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const empty = { title: "", intro: "", plot: "", chars: "", themes: "" };

function toBase64(file: File) {
  return new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] ?? "");
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function Reviews() {
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const analyze = useServerFn(analyzeEssay);
  const save = useSaveEssay();
  const { data: essays = [] } = useEssays();
  const total = sections.reduce((n, s) => n + count(form[s.k]), 0);
  const fullText = sections.map((s) => form[s.k]).filter(Boolean).join("\n\n");

  const onSave = () => {
    if (!form.title.trim()) { toast.error("Введите название фильма"); return; }
    save.mutate({ ...form, word_count: total }, {
      onSuccess: () => toast.success(`Эссе «${form.title}» сохранено`),
      onError: (e) => toast.error(e.message),
    });
  };

  const run = async (mode: "photo" | "text") => {
    setChecking(true); setFeedback(null);
    try {
      if (mode === "photo" && file && file.size > 8_000_000) { toast.error("Фото слишком большое (макс. 8 МБ)"); return; }
      const payload = mode === "photo" && file ? { imageBase64: await toBase64(file), mimeType: file.type } : { text: fullText };
      const r = await analyze({ data: { ...payload, apiKey: getGeminiKey() || undefined } });
      if (r.ok) setFeedback(r.feedback); else toast.error(r.message);
    } catch {
      toast.error("Не удалось выполнить проверку");
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Кино-рецензии" icon={Film} title="Эссе по фильмам" subtitle="Пишите структурированные рецензии и загружайте фото эссе для AI-анализа грамматики."
        right={<button onClick={() => { setForm(empty); setFile(null); setFeedback(null); }} className="btn-ghost"><Plus className="size-4" />Новое эссе</button>} />

      <section className="panel rise mb-6 border-primary/40 bg-accent p-6">
        <div className="flex gap-3">
          <ScanText className="mt-1 size-5 text-primary" />
          <div><h2 className="text-xl font-semibold">AI-анализ фото эссе</h2>
            <p className="text-sm text-muted-foreground">Загрузите фото рукописного или печатного эссе для проверки грамматики, орфографии и стиля</p></div>
        </div>
        {file && (
          <div className="relative mt-4 inline-block">
            <img src={URL.createObjectURL(file)} alt="Фото эссе" className="h-32 rounded-lg border object-cover" />
            <button onClick={() => setFile(null)} className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border bg-card"><X className="size-3" /></button>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <button onClick={() => fileRef.current?.click()} className="btn-ghost"><Upload className="size-4" />Загрузить фото</button>
          <button disabled={!file || checking} onClick={() => run("photo")} className="btn-gold">
            {checking ? <Loader2 className="size-4 animate-spin" /> : <ScanText className="size-4" />}Проверить эссе
          </button>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-faint"><Lightbulb className="size-3" />Сделайте фото рукописного эссе или загрузите скриншот печатного текста — AI проверит грамматику и стиль.</p>
      </section>

      {feedback && (
        <section className="panel rise mb-6 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Результат проверки</h2>
            <span className="font-display text-3xl text-primary">{Math.round(feedback.score)}<span className="text-base text-faint">/100</span></span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{feedback.summary}</p>
          <div className="mt-4 space-y-2">
            {feedback.issues.length === 0 && <p className="text-sm text-success">Ошибок не найдено 🎉</p>}
            {feedback.issues.map((i, n) => (
              <div key={n} className="rounded-lg border bg-surface p-3 text-sm">
                <span className="mr-2 rounded bg-accent px-1.5 py-0.5 text-xs font-semibold text-accent-foreground">{i.type}</span>
                <span className="text-destructive line-through">{i.original}</span> → <span className="text-success">{i.fix}</span>
                <p className="mt-1 text-muted-foreground">{i.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

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
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <p className="text-sm text-muted-foreground">Всего: <b className="text-foreground">{total} слов</b></p>
          <div className="flex gap-3">
            <button disabled={total < 5 || checking} onClick={() => run("text")} className="btn-ghost"><ScanText className="size-4" />Проверить текст</button>
            <button disabled={save.isPending} onClick={onSave} className="btn-gold"><Save className="size-4" />Сохранить эссе</button>
          </div>
        </div>
      </section>

      {essays.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-xl font-semibold">Мои эссе</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {essays.map((e) => (
              <button key={e.id} onClick={() => { setForm({ title: e.title, intro: e.intro, plot: e.plot, chars: e.chars, themes: e.themes }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="panel p-4 text-left transition-colors hover:border-primary">
                <p className="font-display text-lg">{e.title}</p>
                <p className="text-xs text-faint">{new Date(e.created_at).toLocaleDateString("ru-RU")} · {e.word_count} слов</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
