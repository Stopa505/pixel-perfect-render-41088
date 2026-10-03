import { builderTasks, type Topic } from "./data";

// ─── Level blocks ───────────────────────────────────────────────────────────

export type LevelBlockId = "A" | "B" | "C";

export type LevelInfo = {
  code: string;
  name: string;
  can: string;
};

export type LevelBlock = {
  id: LevelBlockId;
  color: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  levels: LevelInfo[];
  skills: string[];
  roadmap: { phase: string; topics: string[] }[];
};

export const levelBlocks: Record<LevelBlockId, LevelBlock> = {
  A: {
    id: "A",
    color: "#e0654e",
    badge: "🔴",
    title: "Block A — Элементарное владение",
    subtitle: "Basic User · A1–A2",
    description:
      "Для тех, кто начинает с нуля или знает базовые фразы. Вы научитесь представляться, рассказывать о себе, задавать простые вопросы и ориентироваться в повседневных ситуациях.",
    levels: [
      { code: "A1", name: "Beginner", can: "Понимаю и использую знакомые повседневные выражения и простые фразы для удовлетворения конкретных потребностей." },
      { code: "A2", name: "Elementary", can: "Общаюсь в простых типичных ситуациях, описываю семью, обстановку и прошлое простыми словами." },
    ],
    skills: [
      "Глагол to be и базовые местоимения",
      "Present Simple — ежедневные действия",
      "Артикли a / an / the — основы",
      "Порядок слов SVOMPT в простых предложениях",
      "Вопросы ASI (Yes/No) и QUASI (WH)",
      "Past Simple — правильные и частые неправильные глаголы",
      "Числа, даты, время, предлоги места и времени",
    ],
    roadmap: [
      { phase: "Фаза 1 — Знакомство", topics: ["Алфавит и звуки", "To be, местоимения, this/that", "Числа и даты"] },
      { phase: "Фаза 2 — Настоящее", topics: ["Present Simple (утверд., отриц., вопрос)", "SVOMPT — базовый порядок", "ASI / QUASI — вопросы"] },
      { phase: "Фаза 3 — Прошлое и будущее", topics: ["Past Simple (regular / irregular)", "Future (will / going to)", "Повседневные диалоги"] },
    ],
  },
  B: {
    id: "B",
    color: "#dcad76",
    badge: "🟡",
    title: "Block B — Самостоятельное владение",
    subtitle: "Independent User · B1–B2",
    description:
      "Для уверенного общения на знакомые темы. Вы освоите временные группы, условные предложения, модальные глаголы и научитесь писать связные тексты и пересказывать события.",
    levels: [
      { code: "B1", name: "Intermediate", can: "Поддерживаю разговор на знакомые темы, описываю опыт и события, выражаю мнение и планы." },
      { code: "B2", name: "Upper-Intermediate", can: "Свободно общаюсь с носителями, аргументирую точку зрения, понимаю сложные тексты." },
    ],
    skills: [
      "Present Continuous и Present Perfect",
      "Past Continuous и Past Perfect — согласование времён",
      "Modal verbs (can, must, should, have to, might)",
      "Conditionals 0–3 и Mixed Conditionals",
      "Passive Voice — все времена",
      "Reported speech — косвенная речь",
      "Gerund vs Infinitive, phrasal verbs",
      "Сложные SVOMPT-конструкции с обстоятельствами",
    ],
    roadmap: [
      { phase: "Фаза 1 — Временная система", topics: ["Present Perfect vs Past Simple", "Past Continuous / Past Perfect", "Future forms (will / going to / Present Cont.)"] },
      { phase: "Фаза 2 — Сложные конструкции", topics: ["Modal verbs и их эквиваленты", "Conditionals 0–3", "Passive Voice"] },
      { phase: "Фаза 3 — Продвинутые навыки", topics: ["Reported speech", "Gerund / Infinitive", "Написание эссе и рассуждений"] },
    ],
  },
  C: {
    id: "C",
    color: "#5bb074",
    badge: "🟢",
    title: "Block C — Свободное владение",
    subtitle: "Proficient User · C1–C2",
    description:
      "Для свободного и точного выражения мыслей в любой ситуации. Вы будете работать над нюансами стиля, идиоматикой, академическим письмом и пониманием неявных значений.",
    levels: [
      { code: "C1", name: "Advanced", can: "Выражаюсь спонтанно и бегло, понимаю сложные и длинные тексты, использую язык гибко в профессиональном контексте." },
      { code: "C2", name: "Proficiency", can: "Понимаю практически всё, выражаюсь точно и тонко, различаю оттенки смысла в сложных ситуациях." },
    ],
    skills: [
      "Inversion и emphatic structures",
      "Subjunctive mood — сослагательное наклонение",
      "Cleft sentences и fronting",
      "Идиомы, коллокации, фразовые глаголы продвинутого уровня",
      "Академическое письмо — регистр и стиль",
      "Discourse markers и linking devices",
      "Нюансы различения синонимов и коннотаций",
      "Сложные SVOMPT-вариации с fronting и inversion",
    ],
    roadmap: [
      { phase: "Фаза 1 — Точность и стиль", topics: ["Inversion (emphatic, conditional)", "Cleft sentences и fronting", "Subjunctive mood"] },
      { phase: "Фаза 2 — Идиоматика", topics: ["Идиомы и коллокации", "Фразовые глаголы C-level", "Коннотации и регистр"] },
      { phase: "Фаза 3 — Мастерство", topics: ["Академическое письмо", "Discourse markers", "Анализ стиля и прагматики"] },
    ],
  },
};

export const blockList: LevelBlock[] = [levelBlocks.A, levelBlocks.B, levelBlocks.C];

// ─── Placement quiz ─────────────────────────────────────────────────────────

export type PlacementQuestion = {
  q: string;
  options: string[];
  a: number;
  block: LevelBlockId;
};

export const placementQuestions: PlacementQuestion[] = [
  { q: "Выберите правильный вариант: ___ name is Anna.", options: ["I", "My", "Me", "Mine"], a: 1, block: "A" },
  { q: "She ___ coffee every morning.", options: ["drink", "drinks", "drinking", "drank"], a: 1, block: "A" },
  { q: "___ you like tea?", options: ["Are", "Do", "Is", "Does"], a: 1, block: "A" },
  { q: "What time ___ you get up?", options: ["do", "does", "are", "is"], a: 0, block: "A" },
  { q: "Yesterday we ___ to the cinema.", options: ["go", "goed", "went", "going"], a: 2, block: "A" },
  { q: "I ___ my keys. Can you help me find them?", options: ["lost", "have lost", "losing", "was lost"], a: 1, block: "B" },
  { q: "If it ___ tomorrow, we'll stay home.", options: ["rains", "will rain", "rain", "rained"], a: 0, block: "B" },
  { q: "The letter ___ yesterday.", options: ["sent", "was sent", "is sent", "sends"], a: 1, block: "B" },
  { q: "She said she ___ tired.", options: ["is", "was", "be", "being"], a: 1, block: "B" },
  { q: "You ___ smoke here. It's forbidden.", options: ["mustn't", "don't have to", "can't", "shouldn't"], a: 2, block: "B" },
  { q: "He enjoys ___ tennis on weekends.", options: ["play", "to play", "playing", "played"], a: 2, block: "B" },
  { q: "When I arrived, the meeting ___ already started.", options: ["has", "had", "was", "is"], a: 1, block: "B" },
  { q: "Not only ___ the report, but he also presented it brilliantly.", options: ["he wrote", "did he write", "he did write", "wrote he"], a: 1, block: "C" },
  { q: "It ___ John who broke the window, not me.", options: ["was", "is", "had been", "has been"], a: 0, block: "C" },
  { q: "Were he ___, he would have helped us.", options: ["here", "be here", "to be here", "being here"], a: 0, block: "C" },
  { q: "The committee recommended that the policy ___.", options: ["changes", "change", "changed", "is changing"], a: 1, block: "C" },
  { q: "Hardly ___ when the phone rang.", options: ["I had sat down", "had I sat down", "I sat down", "did I sit down"], a: 1, block: "C" },
  { q: "His remarks were ___ tactless; they were downright offensive.", options: ["scarcely", "not only", "barely", "rather"], a: 1, block: "C" },
];

// ─── Block-scoring logic ────────────────────────────────────────────────────

export type PlacementResult = {
  block: LevelBlockId;
  scores: Record<LevelBlockId, number>;
  total: number;
};

export function scorePlacement(answers: Record<number, number>): PlacementResult {
  const scores: Record<LevelBlockId, number> = { A: 0, B: 0, C: 0 };
  for (let i = 0; i < placementQuestions.length; i++) {
    const q = placementQuestions[i]!;
    if (answers[i] === q.a) scores[q.block]++;
  }
  const blockQuestionCounts: Record<LevelBlockId, number> = { A: 0, B: 0, C: 0 };
  placementQuestions.forEach((q) => blockQuestionCounts[q.block]++);
  let assigned: LevelBlockId = "A";
  (["A", "B", "C"] as LevelBlockId[]).forEach((b) => {
    if (scores[b] >= Math.ceil(blockQuestionCounts[b] / 2)) assigned = b;
  });
  return { block: assigned, scores, total: placementQuestions.length };
}

// ─── localStorage persistence ───────────────────────────────────────────────

const STORAGE_KEY = "native_user_level";

export type StoredLevel = {
  block: LevelBlockId;
  placementDone: boolean;
  placementDate: string;
  scores: Record<LevelBlockId, number>;
};

const defaultStored: StoredLevel = {
  block: "A",
  placementDone: false,
  placementDate: "",
  scores: { A: 0, B: 0, C: 0 },
};

export function getStoredLevel(): StoredLevel {
  if (typeof window === "undefined") return defaultStored;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStored;
    return JSON.parse(raw) as StoredLevel;
  } catch {
    return defaultStored;
  }
}

export function setStoredLevel(data: StoredLevel): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function setActiveBlock(block: LevelBlockId): void {
  const prev = getStoredLevel();
  setStoredLevel({ ...prev, block });
}

export function savePlacementResult(result: PlacementResult): void {
  setStoredLevel({
    block: result.block,
    placementDone: true,
    placementDate: new Date().toISOString(),
    scores: result.scores,
  });
}

// ─── Block-adaptive builder tasks ───────────────────────────────────────────

export type BuilderTask = {
  topic: Topic;
  ru: string;
  answer: string;
  block: LevelBlockId;
  hint: string;
};

export const blockBuilderTasks: BuilderTask[] = [
  { topic: "SVOMPT", block: "A", ru: "Она читает книгу каждое утро.", answer: "She reads a book every morning", hint: "Subject + Verb + Object + Time" },
  { topic: "ASI", block: "A", ru: "Ты любишь кофе?", answer: "Do you like coffee", hint: "Auxiliary(do) + Subject + Infinitive" },
  { topic: "QUASI", block: "A", ru: "Где ты живёшь?", answer: "Where do you live", hint: "Question word + Auxiliary + Subject + Infinitive" },
  { topic: "SVOMPT", block: "A", ru: "Мы играем в футбол в парке по субботам.", answer: "We play football in the park on Saturdays", hint: "Subject + Verb + Object + Place + Time" },
  { topic: "ASI", block: "A", ru: "Она закончила проект?", answer: "Did she finish the project", hint: "Past Simple: did + Subject + Infinitive" },
  { topic: "SVOMPT", block: "B", ru: "Они строят новый мост с прошлого года.", answer: "They have been building a new bridge since last year", hint: "Subject + Present Perfect Cont. + Object + Time" },
  { topic: "ASI", block: "B", ru: "Ты когда-нибудь был в Лондоне?", answer: "Have you ever been to London", hint: "Present Perfect: Have + Subject + ever + been" },
  { topic: "QUASI", block: "B", ru: "Почему она не ответила на письмо?", answer: "Why did she not answer the letter", hint: "Question word + did + Subject + not + Infinitive" },
  { topic: "SVOMPT", block: "B", ru: "Книга была написана известным автором в 1995 году.", answer: "The book was written by a famous author in 1995", hint: "Passive Voice: Subject + was + V3 + by + Agent + Time" },
  { topic: "ASI", block: "B", ru: "Ты должен сдать отчёт до пятницы?", answer: "Do you have to submit the report by Friday", hint: "Modal: Do + Subject + have to + Infinitive" },
  { topic: "SVOMPT", block: "C", ru: "Не только он написал отчёт, но и представил его блестяще.", answer: "Not only did he write the report but he also presented it brilliantly", hint: "Inversion: Not only + did + Subject + Infinitive" },
  { topic: "SVOMPT", block: "C", ru: "Именно Джон разбил окно, а не я.", answer: "It was John who broke the window not me", hint: "Cleft sentence: It was + Subject + who + Verb" },
  { topic: "QUASI", block: "C", ru: "Едва я сел, как зазвонил телефон.", answer: "Hardly had I sat down when the phone rang", hint: "Inversion: Hardly + had + Subject + V3" },
  { topic: "ASI", block: "C", ru: "Если бы он был здесь, он бы нам помог?", answer: "Were he here would he help us", hint: "Subjunctive inversion: Were + Subject" },
  { topic: "SVOMPT", block: "C", ru: "Комиссия рекомендовала, чтобы политику изменили.", answer: "The committee recommended that the policy change", hint: "Subjunctive: recommend that + Subject + bare Infinitive" },
];

export function getBuilderTasksForBlock(block: LevelBlockId): BuilderTask[] {
  const tasks = blockBuilderTasks.filter((t) => t.block === block);
  const fallback: BuilderTask[] = builderTasks.map((t) => ({
    topic: t.topic,
    block: "A" as LevelBlockId,
    ru: t.ru,
    answer: t.answer,
    hint: "",
  }));
  const combined = [...tasks, ...fallback];
  const seen = new Set<string>();
  return combined.filter((t) => {
    if (seen.has(t.answer)) return false;
    seen.add(t.answer);
    return true;
  });
}
