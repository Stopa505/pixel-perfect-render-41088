import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getGeminiKey, setGeminiKey } from "@/lib/gemini-key";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { geminiStatus, verifyGeminiKey } from "@/lib/gemini.functions";
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/gemini")({
  head: () => ({
    meta: [
      { title: "Интеграция с Gemini — NATIVE" },
      { name: "description", content: "Настройка Google Gemini AI для проверки эссе и генерации материалов." },
      { property: "og:title", content: "Интеграция с Gemini — NATIVE" },
      { property: "og:description", content: "Настройка Google Gemini AI для проверки эссе и генерации материалов." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gemini,
});

const features = [
  { t: "AI-анализ фото эссе", d: "Загрузите фото рукописного или печатного эссе — Gemini проверит грамматику, орфографию и стиль.", ok: true },
  { t: "Генерация лексики по фильму", d: "Введите название фильма — AI подберёт продвинутую лексику и вопросы для эссе.", ok: true },
  { t: "Умные подсказки в конструкторе", d: "AI помогает с подсказками при построении предложений и переводе.", ok: false },
];

function Gemini() {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState("");
  useEffect(() => { const k = getGeminiKey(); setKey(k); setSaved(k); }, []);
  const statusFn = useServerFn(geminiStatus);
  const verifyFn = useServerFn(verifyGeminiKey);
  const { data: status } = useQuery({ queryKey: ["gemini-status"], queryFn: () => statusFn() });
  const verify = async () => {
    setBusy(true);
    try {
      const r = await verifyFn({ data: { key: key.trim() || undefined } });
      if (r.ok) {
        setGeminiKey(key.trim()); setSaved(key.trim());
        toast.success(key.trim() ? r.message + " — ключ сохранён и будет использоваться для всех AI-функций" : r.message);
      } else toast.error(r.message);
    } catch { toast.error("Не удалось проверить ключ"); }
    finally { setBusy(false); }
  };
  return (
    <>
      <PageHeader eyebrow="Настройки" icon={Sparkles} title="Интеграция с Gemini" subtitle="Управление связкой с Google Gemini AI для интеллектуальных проверок эссе и генерации материалов." />
      <div className="space-y-6">
        <section className="panel rise p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><KeyRound className="size-5 text-primary" />API ключ Gemini</h2>
          <p className="text-sm text-muted-foreground">Ключ используется для AI-анализа фото эссе и генерации материалов</p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-accent px-3 py-1 text-xs font-semibold text-primary"><AlertCircle className="size-3" />{status === undefined ? "Проверяем…" : saved ? "Используется ваш ключ" : status.configured ? "Настроен на сервере" : "Не настроен"}</span>
          <label className="mb-2 mt-4 block text-sm font-semibold">Ваш API ключ:</label>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative min-w-0">
              <input type={show ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} placeholder="Введите ваш Gemini API ключ…" className="field pr-10" />
              <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-foreground" aria-label="Показать ключ">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <button onClick={verify} disabled={busy} className="btn-gold min-h-11">{busy && <Loader2 className="size-4 animate-spin" />}Проверить</button>
          </div>
          <p className="mt-2 text-xs text-faint">Подходит любой формат ключа: Google AI Studio, Vertex AI или прокси. «Проверить» отправляет тестовый запрос в Gemini; рабочий ключ сохраняется в этом браузере и заменяет серверный. Оставьте поле пустым и нажмите «Проверить», чтобы вернуться к ключу сервера. Получить ключ можно на{" "}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-primary underline">Google AI Studio</a>.</p>
        </section>

        <section className="panel rise p-4 sm:p-6">
          <h2 className="text-xl font-semibold">AI-функции</h2>
          <p className="text-sm text-muted-foreground">Что доступно с подключённым Gemini</p>
          <div className="mt-4 space-y-3">
            {features.map((f) => (
              <div key={f.t} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-lg border bg-surface p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                {f.ok ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" /> : <AlertCircle className="mt-0.5 size-5 shrink-0 text-faint" />}
                <div className="min-w-0"><p className="font-medium">{f.t}</p><p className="text-sm text-muted-foreground">{f.d}</p></div>
                <span className={`col-start-2 w-fit rounded-full px-3 py-1 text-xs font-semibold sm:col-start-auto ${f.ok ? "bg-primary text-primary-foreground" : "border text-muted-foreground"}`}>{f.ok ? "Доступно" : "Скоро"}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel rise flex gap-3 border-primary/40 bg-accent p-4 sm:p-5">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <div><p className="font-semibold">Как это работает?</p>
            <p className="mt-1 text-sm text-muted-foreground">Gemini AI анализирует ваши эссе на грамматику, орфографию и стиль — без оценки содержания. Все запросы идут через серверный API, ваш ключ хранится безопасно. AI не оценивает философские рассуждения — только языковую корректность.</p></div>
        </section>
      </div>
    </>
  );
}
