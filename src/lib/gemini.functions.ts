import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MODEL = "gemini-flash-latest";
const BASE = "https://generativelanguage.googleapis.com/v1beta";

// Accept any key format: Google API keys go in x-goog-api-key, OAuth/Vertex-style tokens as Bearer.
function authHeaders(key: string): Record<string, string> {
  return key.startsWith("ya29.") || key.split(".").length === 3
    ? { Authorization: `Bearer ${key}` }
    : { "x-goog-api-key": key };
}

export const geminiStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => ({ configured: !!process.env["GEMINI_API_KEY"] }));

export const verifyGeminiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ key: z.string().max(4000).optional() }).parse(d))
  .handler(async ({ data }) => {
    const key = data.key?.trim() || process.env["GEMINI_API_KEY"];
    if (!key) return { ok: false, message: "Ключ не задан" };
    const res = await fetch(`${BASE}/models?pageSize=1`, { headers: authHeaders(key) });
    if (res.ok) return { ok: true, message: "Ключ рабочий — Gemini отвечает" };
    return { ok: false, message: res.status === 400 || res.status === 403 ? "Ключ отклонён Google" : `Ошибка Gemini (${res.status})` };
  });

const Feedback = z.object({
  summary: z.string(),
  score: z.number(),
  transcript: z.string(),
  issues: z.array(z.object({ type: z.string(), original: z.string(), fix: z.string(), explanation: z.string() })),
});
export type EssayFeedback = z.infer<typeof Feedback>;

export const analyzeEssay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z.object({
      imageBase64: z.string().max(12_000_000).optional(),
      mimeType: z.string().max(50).optional(),
      text: z.string().max(20000).optional(),
      apiKey: z.string().max(4000).optional(),
    }).refine((v) => v.imageBase64 || v.text, "Нужно фото или текст").parse(d),
  )
  .handler(async ({ data }): Promise<{ ok: true; feedback: EssayFeedback } | { ok: false; message: string }> => {
    const key = data.apiKey?.trim() || process.env["GEMINI_API_KEY"];
    if (!key) return { ok: false, message: "Ключ Gemini не задан" };

    const prompt = `Ты — преподаватель английского. Проверь эссе ученика ТОЛЬКО на грамматику, орфографию и стиль (не оценивай содержание и рассуждения).
Если дано фото — сначала распознай текст. Ответь строго JSON:
{"summary": "краткий вывод на русском", "score": число 0-100, "transcript": "распознанный/исходный текст", "issues": [{"type": "grammar|spelling|style", "original": "фрагмент", "fix": "исправление", "explanation": "объяснение на русском"}]}
Не более 15 замечаний.`;
    const parts: unknown[] = [{ text: prompt }];
    if (data.imageBase64) parts.push({ inline_data: { mime_type: data.mimeType || "image/jpeg", data: data.imageBase64 } });
    if (data.text) parts.push({ text: `Текст эссе:\n${data.text}` });

    const res = await fetch(`${BASE}/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(key) },
      body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { responseMimeType: "application/json" } }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("Gemini error", res.status, body.slice(0, 500));
      if (res.status === 429) return { ok: false, message: "Лимит Gemini исчерпан, попробуйте позже" };
      if (res.status === 400 || res.status === 403) return { ok: false, message: "Gemini отклонил запрос — проверьте ключ" };
      return { ok: false, message: `Gemini временно недоступен (${res.status})` };
    }
    const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    try {
      return { ok: true, feedback: Feedback.parse(JSON.parse(text)) };
    } catch {
      return { ok: false, message: "Gemini вернул неожиданный ответ — попробуйте ещё раз" };
    }
  });

const Turn = z.object({
  reply: z.string(),
  reply_ru: z.string(),
  correction: z.string().nullable().optional(),
  explanation: z.string().nullable().optional(),
  hint: z.string(),
});
export type DialogueTurn = z.infer<typeof Turn>;

export const dialogueTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z.object({
      scenario: z.string().max(200),
      role: z.string().max(400),
      block: z.enum(["A", "B", "C"]),
      history: z.array(z.object({ role: z.enum(["user", "ai"]), text: z.string().max(2000) })).max(60),
      apiKey: z.string().max(4000).optional(),
    }).parse(d),
  )
  .handler(async ({ data }): Promise<{ ok: true; turn: DialogueTurn } | { ok: false; message: string }> => {
    const key = data.apiKey?.trim() || process.env["GEMINI_API_KEY"];
    if (!key) return { ok: false, message: "Ключ Gemini не задан — добавьте его в разделе «Интеграция с Gemini»" };
    const level = { A: "A1–A2 (very simple words, short sentences)", B: "B1–B2 (natural everyday English)", C: "C1–C2 (rich, nuanced, idiomatic English)" }[data.block];
    const last = data.history[data.history.length - 1];
    const prompt = `You are a roleplay partner for an English learner. Scenario: "${data.scenario}". Your role: ${data.role}. Learner level: ${level}.
Stay in character, keep replies to 1–3 sentences, and move the conversation forward with a question.
${last?.role === "user" ? `Check the learner's LAST message for grammar/vocabulary mistakes. If there are mistakes, put the corrected sentence in "correction" and a short explanation IN RUSSIAN in "explanation"; otherwise set both to null.` : `This is the start: open the conversation in character. Set correction and explanation to null.`}
"reply_ru" is a Russian translation of your reply. "hint" is one example English sentence the learner could say next (level-appropriate).
Reply strictly as JSON: {"reply":"","reply_ru":"","correction":null,"explanation":null,"hint":""}`;
    const contents = [
      { role: "user", parts: [{ text: prompt }] },
      ...data.history.map((m) => ({ role: m.role === "ai" ? "model" : "user", parts: [{ text: m.text }] })),
    ];
    if (last?.role !== "user") contents.push({ role: "user", parts: [{ text: "(start)" }] });
    const res = await fetch(`${BASE}/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(key) },
      body: JSON.stringify({ contents, generationConfig: { responseMimeType: "application/json" } }),
    });
    if (!res.ok) {
      console.error("Gemini dialogue error", res.status, (await res.text()).slice(0, 500));
      if (res.status === 429) return { ok: false, message: "Лимит Gemini исчерпан, попробуйте позже" };
      if (res.status === 400 || res.status === 403) return { ok: false, message: "Gemini отклонил запрос — проверьте ключ" };
      return { ok: false, message: `Gemini временно недоступен (${res.status})` };
    }
    const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    try {
      return { ok: true, turn: Turn.parse(JSON.parse(text)) };
    } catch {
      return { ok: false, message: "Gemini вернул неожиданный ответ — попробуйте ещё раз" };
    }
  });
