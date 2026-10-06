import type { LevelBlockId } from "@/lib/placement";

export type Word = { en: string; ru: string; ex: string };

export const vocab: Record<LevelBlockId, Word[]> = {
  A: [
    { en: "apple", ru: "яблоко", ex: "I eat an apple every day." },
    { en: "ticket", ru: "билет", ex: "Can I see your ticket?" },
    { en: "family", ru: "семья", ex: "My family lives in Moscow." },
    { en: "weather", ru: "погода", ex: "The weather is nice today." },
    { en: "kitchen", ru: "кухня", ex: "She is in the kitchen." },
    { en: "friend", ru: "друг", ex: "He is my best friend." },
    { en: "morning", ru: "утро", ex: "I run every morning." },
    { en: "street", ru: "улица", ex: "Turn left on this street." },
    { en: "hungry", ru: "голодный", ex: "Are you hungry?" },
    { en: "cheap", ru: "дешёвый", ex: "This coffee is cheap." },
    { en: "window", ru: "окно", ex: "Open the window, please." },
    { en: "travel", ru: "путешествовать", ex: "I like to travel." },
  ],
  B: [
    { en: "achieve", ru: "достигать", ex: "She achieved her goals." },
    { en: "reliable", ru: "надёжный", ex: "He is a reliable colleague." },
    { en: "landlord", ru: "арендодатель", ex: "The landlord fixed the heater." },
    { en: "deadline", ru: "крайний срок", ex: "The deadline is on Friday." },
    { en: "itinerary", ru: "маршрут поездки", ex: "Let's plan our itinerary." },
    { en: "improve", ru: "улучшать", ex: "I want to improve my English." },
    { en: "convenient", ru: "удобный", ex: "Is Monday convenient for you?" },
    { en: "experience", ru: "опыт", ex: "I have five years of experience." },
    { en: "neighbourhood", ru: "район", ex: "It's a quiet neighbourhood." },
    { en: "afford", ru: "позволить себе", ex: "We can't afford a new car." },
    { en: "suggest", ru: "предлагать", ex: "I suggest we leave early." },
    { en: "obviously", ru: "очевидно", ex: "Obviously, he was late." },
  ],
  C: [
    { en: "ubiquitous", ru: "вездесущий", ex: "Smartphones are ubiquitous." },
    { en: "leverage", ru: "использовать преимущество", ex: "We can leverage our data." },
    { en: "nuance", ru: "нюанс", ex: "He missed the nuance." },
    { en: "compelling", ru: "убедительный", ex: "She made a compelling case." },
    { en: "concession", ru: "уступка", ex: "Both sides made concessions." },
    { en: "detrimental", ru: "пагубный", ex: "Stress is detrimental to health." },
    { en: "scrutiny", ru: "тщательная проверка", ex: "The plan is under scrutiny." },
    { en: "advocate", ru: "выступать за", ex: "They advocate reform." },
    { en: "inevitable", ru: "неизбежный", ex: "Change is inevitable." },
    { en: "elaborate", ru: "подробно излагать", ex: "Could you elaborate on that?" },
    { en: "pragmatic", ru: "прагматичный", ex: "We need a pragmatic solution." },
    { en: "mitigate", ru: "смягчать", ex: "How can we mitigate the risks?" },
  ],
};

export type Scenario = { id: string; title: string; ru: string; role: string; emoji: string };

export const scenarios: Record<LevelBlockId, Scenario[]> = {
  A: [
    { id: "coffee", emoji: "☕", title: "Ordering Coffee", ru: "Заказ кофе", role: "a friendly barista in a café" },
    { id: "airport", emoji: "✈️", title: "Airport Check-in", ru: "Регистрация в аэропорту", role: "an airline check-in agent" },
    { id: "directions", emoji: "🧭", title: "Asking for Directions", ru: "Как пройти", role: "a helpful local on the street" },
  ],
  B: [
    { id: "interview", emoji: "💼", title: "Job Interview", ru: "Собеседование", role: "an HR manager interviewing the learner" },
    { id: "trip", emoji: "🗺️", title: "Planning a Trip with a Friend", ru: "Планируем поездку", role: "the learner's friend planning a trip together" },
    { id: "apartment", emoji: "🏠", title: "Renting an Apartment", ru: "Аренда квартиры", role: "a landlord showing an apartment" },
  ],
  C: [
    { id: "tech", emoji: "🤖", title: "Debating Technology", ru: "Дебаты о технологиях", role: "a debate partner with the opposite view on AI and society" },
    { id: "negotiation", emoji: "🤝", title: "Business Negotiation", ru: "Деловые переговоры", role: "a business partner negotiating a contract" },
    { id: "opinions", emoji: "💭", title: "Expressing Complex Opinions", ru: "Сложные мнения", role: "a thoughtful interviewer on social issues" },
  ],
};

const SK = "native.games";
export type GameStats = Record<string, number>;
export function getGameStats(): GameStats {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(SK) ?? "{}") as GameStats; } catch { return {}; }
}
export function bumpStat(key: string, value: number, mode: "max" | "add" = "max"): GameStats {
  const s = getGameStats();
  s[key] = mode === "add" ? (s[key] ?? 0) + value : Math.max(s[key] ?? 0, value);
  try { localStorage.setItem(SK, JSON.stringify(s)); } catch { /* noop */ }
  return s;
}

export function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
