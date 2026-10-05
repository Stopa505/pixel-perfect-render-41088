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
