export type Topic = "SVOMPT" | "ASI" | "QUASI";

export const svompt = [
  { l: "S", term: "Subject", ru: "Подлежащее", desc: "Кто или что выполняет действие", ex: "She" },
  { l: "V", term: "Verb", ru: "Сказуемое", desc: "Само действие (глагол)", ex: "reads" },
  { l: "O", term: "Object", ru: "Дополнение", desc: "На что направлено действие", ex: "a book" },
  { l: "M", term: "Manner", ru: "Образ действия", desc: "Как выполняется действие (наречие)", ex: "carefully" },
  { l: "P", term: "Place", ru: "Место", desc: "Где происходит действие", ex: "in the library" },
  { l: "T", term: "Time", ru: "Время", desc: "Когда происходит действие", ex: "every morning" },
];

export type Mistake = {
  id: number; topic: Topic; date: string; prompt: string; yours: string; correct: string; rule: string;
};

export const initialMistakes: Mistake[] = [
  { id: 1, topic: "ASI", date: "02.10.2026", prompt: "Are you coming to the party tonight?", yours: "Ты идёшь вечеринка сегодня?", correct: "Ты придёшь на вечеринку сегодня вечером?", rule: "ASI: Вспом. глагол + Подлежащее + Глагол. На русский переводится обычным порядком слов." },
  { id: 2, topic: "SVOMPT", date: "02.10.2026", prompt: "Учитель быстро объясняет урок в школе в понедельник.", yours: "The teacher explains quickly the lesson on Monday at school", correct: "The teacher explains the lesson quickly at school on Monday", rule: "Subject + Verb + Object + Manner + Place + Time. Образ действия (quickly) перед местом (at school)." },
  { id: 3, topic: "QUASI", date: "01.10.2026", prompt: "Куда ты идёшь?", yours: "Where you are going?", correct: "Where are you going?", rule: "QUASI: Вопросительное слово + Вспом. глагол + Подлежащее + Глагол." },
  { id: 4, topic: "SVOMPT", date: "01.10.2026", prompt: "Она читает книгу в библиотеке каждое утро.", yours: "She reads every morning a book in the library", correct: "She reads a book in the library every morning", rule: "Время (every morning) всегда стоит в конце предложения." },
  { id: 5, topic: "ASI", date: "30.09.2026", prompt: "Она закончила проект?", yours: "She finished the project?", correct: "Did she finish the project?", rule: "В Past Simple используется вспомогательный глагол did, основной глагол — в инфинитиве." },
];

export const builderTasks = [
  { ru: "Она читает книгу внимательно в библиотеке каждое утро.", answer: "She reads a book carefully in the library every morning" },
  { ru: "Ты любишь кофе?", answer: "Do you like coffee" },
  { ru: "Почему она ушла?", answer: "Why did she leave" },
  { ru: "Мы играем в футбол в парке по субботам.", answer: "We play football in the park on Saturdays" },
];

export const testQuestions = [
  { q: "Выберите правильный порядок слов:", options: ["She sings beautifully every day at home", "She sings beautifully at home every day", "She every day sings at home beautifully"], a: 1, topic: "SVOMPT" },
  { q: "Как образовать вопрос «Он любит кофе?»", options: ["He likes coffee?", "Does he likes coffee?", "Does he like coffee?"], a: 2, topic: "ASI" },
  { q: "Выберите правильный WH-вопрос:", options: ["What does he want?", "What he wants?", "What does he wants?"], a: 0, topic: "QUASI" },
  { q: "Что означает буква M в SVOMPT?", options: ["Moment", "Manner", "Method"], a: 1, topic: "SVOMPT" },
  { q: "Выберите правильный вариант:", options: ["Are you coming tonight?", "You are coming tonight?", "Coming you are tonight?"], a: 0, topic: "ASI" },
];

export const rules = [
  { topic: "SVOMPT", title: "Порядок слов в утверждении", formula: "Subject + Verb + Object + Manner + Place + Time", body: "Строгий порядок членов предложения в повествовательных предложениях. Обстоятельство времени ставится в конец, образ действия — перед местом.", ex: ["She reads a book carefully in the library every morning.", "We play football in the park on Saturdays."] },
  { topic: "ASI", title: "Общие вопросы (Yes/No)", formula: "Auxiliary + Subject + Infinitive", body: "Вспомогательный глагол (do/does/did, be, have, модальные) выносится перед подлежащим. Основной глагол стоит в начальной форме.", ex: ["Are you coming tonight?", "Did she finish the project?", "Does he like coffee?"] },
  { topic: "QUASI", title: "Специальные вопросы (WH)", formula: "Question word + Auxiliary + Subject + Infinitive", body: "Вопросительное слово (what, where, why, when, how) ставится в начало, затем идёт схема ASI.", ex: ["Where are you going?", "Why did she leave?", "What does he want?"] },
  { topic: "Present Simple", title: "Окончание -s в 3-м лице", formula: "He / She / It + V-s", body: "В утвердительных предложениях Present Simple к глаголу добавляется -s/-es для he, she, it. В вопросах и отрицаниях окончание переходит на does.", ex: ["She works every day.", "Does she work every day?"] },
  { topic: "Past Simple", title: "Прошедшее время", formula: "Subject + V2 / did + V1", body: "Правильные глаголы получают -ed, неправильные — вторую форму. В вопросах и отрицаниях используется did и инфинитив.", ex: ["They visited London.", "Did they visit London?"] },
];
