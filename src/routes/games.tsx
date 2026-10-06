import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Puzzle, RotateCcw, Shuffle, Timer, Trophy, Volume2, X } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { getStoredLevel, type LevelBlockId } from "@/lib/placement";
import { bumpStat, getGameStats, shuffle, vocab, type GameStats, type Word } from "@/lib/vocab";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "Игры со словами — NATIVE" },
      { name: "description", content: "Мини-игры для словарного запаса: пары слов, карточки с произношением и анаграммы на скорость." },
      { property: "og:title", content: "Игры со словами — NATIVE" },
      { property: "og:description", content: "Мини-игры для словарного запаса: пары слов, карточки с произношением и анаграммы на скорость." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Games,
});

type Game = "match" | "cards" | "anagram";
const GAMES: { id: Game; title: string; sub: string }[] = [
  { id: "match", title: "Пары слов", sub: "Word Match" },
  { id: "cards", title: "Карточки", sub: "Flashcards" },
  { id: "anagram", title: "Анаграммы", sub: "Speed Run" },
];

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function Games() {
  const [block, setBlock] = useState<LevelBlockId>("A");
  const [game, setGame] = useState<Game>("match");
  const [stats, setStats] = useState<GameStats>({});
  useEffect(() => { setBlock(getStoredLevel().block); setStats(getGameStats()); }, []);
  const words = vocab[block];
  const save = (k: string, v: number, mode?: "max" | "add") => setStats(bumpStat(`${block}.${k}`, v, mode));

  return (
    <>
      <PageHeader eyebrow="Словарь" icon={Puzzle} title="Игры со словами" subtitle="Закрепляйте слова своего уровня в коротких играх. Рекорды сохраняются в этом браузере." />
      <div className="mb-4 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
        {(["A", "B", "C"] as const).map((b) => (
          <button key={b} onClick={() => setBlock(b)} className={`min-h-11 rounded-lg border px-4 text-sm ${block === b ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground"}`}>Блок {b}</button>
        ))}
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {GAMES.map((g) => {
          const best = g.id === "match" ? stats[`${block}.match`] : g.id === "cards" ? stats[`${block}.known`] : stats[`${block}.anagram`];
          return (
            <button key={g.id} onClick={() => setGame(g.id)} className={`panel min-w-0 p-4 text-left transition-colors ${game === g.id ? "border-primary" : "hover:border-primary/50"}`}>
              <p className="font-semibold">{g.title}</p>
              <p className="text-xs text-muted-foreground">{g.sub}</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-primary"><Trophy className="size-3.5" />{g.id === "cards" ? "Выучено" : "Рекорд"}: {best ?? 0}</p>
            </button>
          );
        })}
      </div>
      {game === "match" && <Match key={block + "m"} words={words} onWin={(s) => save("match", s)} />}
      {game === "cards" && <Cards key={block + "c"} words={words} onKnow={() => save("known", 1, "add")} />}
      {game === "anagram" && <Anagram key={block + "a"} words={words} onEnd={(s) => save("anagram", s)} />}
    </>
  );
}

function Match({ words, onWin }: { words: Word[]; onWin: (score: number) => void }) {
  const [round, setRound] = useState(0);
  const set = useMemo(() => shuffle(words).slice(0, 6), [words, round]);
  const left = useMemo(() => shuffle(set), [set]);
  const right = useMemo(() => shuffle(set), [set]);
  const [selL, setSelL] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [miss, setMiss] = useState(0);
  const finished = done.length === set.length;
  const score = Math.max(0, 60 - miss * 10);

  useEffect(() => { if (finished) onWin(score); }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickR = (en: string) => {
    if (!selL) return;
    if (selL === en) { setDone((d) => [...d, en]); setSelL(null); }
    else { setMiss((m) => m + 1); setWrong(en); setTimeout(() => setWrong(null), 500); }
  };
  const reset = () => { setRound((r) => r + 1); setDone([]); setMiss(0); setSelL(null); };
  const cls = (on: boolean, ok: boolean, bad: boolean) =>
    `min-h-12 w-full break-words rounded-lg border px-3 py-2 text-sm transition-colors ${ok ? "fb-correct opacity-60" : bad ? "fb-wrong" : on ? "border-primary bg-accent text-accent-foreground" : "bg-surface hover:border-primary/50"}`;

  return (
    <div className="panel p-4 sm:p-6">
      <p className="mb-4 text-sm text-muted-foreground">Выберите английское слово, затем его перевод. Ошибок: {miss}</p>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="space-y-2">{left.map((w) => <button key={w.en} disabled={done.includes(w.en)} onClick={() => setSelL(w.en)} className={cls(selL === w.en, done.includes(w.en), false)}>{w.en}</button>)}</div>
        <div className="space-y-2">{right.map((w) => <button key={w.en} disabled={done.includes(w.en)} onClick={() => pickR(w.en)} className={cls(false, done.includes(w.en), wrong === w.en)}>{w.ru}</button>)}</div>
      </div>
      {finished && (
        <div className="fb-correct mt-5 flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold">Готово! Очки: {score}</p>
          <button onClick={reset} className="btn-gold min-h-11"><RotateCcw className="size-4" />Ещё раунд</button>
        </div>
      )}
    </div>
  );
}

function Cards({ words, onKnow }: { words: Word[]; onKnow: () => void }) {
  const [deck, setDeck] = useState(() => shuffle(words));
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState(0);
  const card = deck[0];
  const next = (know: boolean) => {
    if (know) { onKnow(); setKnown((k) => k + 1); setDeck((d) => d.slice(1)); }
    else setDeck((d) => [...d.slice(1), d[0]]);
    setFlip(false);
  };
  if (!card) return (
    <div className="panel p-6 text-center">
      <p className="text-lg font-semibold">Все карточки выучены! 🎉</p>
      <button onClick={() => { setDeck(shuffle(words)); setKnown(0); }} className="btn-gold mt-4 min-h-11"><Shuffle className="size-4" />Начать заново</button>
    </div>
  );
  return (
    <div className="panel p-4 sm:p-6">
      <p className="mb-3 text-sm text-muted-foreground">Осталось: {deck.length} · Знаю: {known}</p>
      <button onClick={() => setFlip(!flip)} className="grid min-h-56 w-full place-items-center rounded-xl border bg-surface p-6 text-center transition-colors hover:border-primary/50">
        {flip ? (
          <div><p className="text-2xl font-semibold text-primary">{card.ru}</p><p className="mt-3 text-sm italic text-muted-foreground">{card.ex}</p></div>
        ) : (
          <div><p className="font-display text-4xl font-semibold">{card.en}</p><p className="mt-3 text-xs text-faint">Нажмите, чтобы перевернуть</p></div>
        )}
      </button>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button onClick={() => speak(card.en)} className="btn-ghost min-h-11"><Volume2 className="size-4" />Произношение</button>
        <button onClick={() => next(false)} className="btn-ghost min-h-11 sm:ml-auto"><X className="size-4" />Нужно повторить</button>
        <button onClick={() => next(true)} className="btn-gold min-h-11"><Check className="size-4" />Знаю</button>
      </div>
    </div>
  );
}

const ROUND = 60;
function Anagram({ words, onEnd }: { words: Word[]; onEnd: (score: number) => void }) {
  const [state, setState] = useState<"idle" | "play" | "end">("idle");
  const [time, setTime] = useState(ROUND);
  const [score, setScore] = useState(0);
  const [word, setWord] = useState<Word>(words[0]);
  const [letters, setLetters] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const scoreRef = useRef(0);

  const nextWord = () => {
    const w = words[Math.floor(Math.random() * words.length)];
    let l = shuffle(w.en.split(""));
    if (l.join("") === w.en && w.en.length > 1) l = [...l.slice(1), l[0]];
    setWord(w); setLetters(l); setInput("");
  };
  const start = () => { scoreRef.current = 0; setScore(0); setTime(ROUND); nextWord(); setState("play"); };

  useEffect(() => {
    if (state !== "play") return;
    const id = setInterval(() => setTime((t) => {
      if (t <= 1) { clearInterval(id); setState("end"); onEnd(scoreRef.current); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().toLowerCase() === word.en) {
      scoreRef.current += word.en.length; setScore(scoreRef.current); setFlash("ok"); nextWord();
    } else setFlash("bad");
    setTimeout(() => setFlash(null), 400);
  };

  if (state !== "play") return (
    <div className="panel p-6 text-center">
      {state === "end" && <p className="mb-2 text-lg font-semibold">Время вышло! Очки: {score}</p>}
      <p className="text-sm text-muted-foreground">Соберите как можно больше слов из перемешанных букв за {ROUND} секунд.</p>
      <button onClick={start} className="btn-gold mt-4 min-h-11"><Timer className="size-4" />{state === "end" ? "Ещё раз" : "Старт"}</button>
    </div>
  );
  return (
    <div className="panel p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-primary"><Timer className="size-4" />{time} с</span>
        <span>Очки: <b>{score}</b></span>
      </div>
      <div className="mb-2 flex flex-wrap justify-center gap-1.5">
        {letters.map((l, i) => <span key={i} className="grid size-10 place-items-center rounded-lg border bg-surface font-display text-xl font-semibold uppercase sm:size-12">{l}</span>)}
      </div>
      <p className="mb-4 text-center text-sm text-muted-foreground">Подсказка: {word.ru}</p>
      <form onSubmit={check} className="flex flex-col gap-2 sm:flex-row">
        <input autoFocus autoCapitalize="off" autoCorrect="off" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Введите слово…" className={`field min-w-0 flex-1 ${flash === "ok" ? "fb-correct" : flash === "bad" ? "fb-wrong" : ""}`} />
        <div className="flex gap-2">
          <button type="button" onClick={nextWord} className="btn-ghost min-h-11 flex-1">Пропустить</button>
          <button className="btn-gold min-h-11 flex-1">Проверить</button>
        </div>
      </form>
    </div>
  );
}
