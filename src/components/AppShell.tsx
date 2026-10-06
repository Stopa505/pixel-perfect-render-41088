import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logStudySeconds } from "@/lib/api";
import { AuthScreen } from "@/components/AuthScreen";
import { BookOpen, Bug, Film, GraduationCap, LayoutGrid, Layers, LogOut, Menu, MessagesSquare, Puzzle, NotebookText, Sparkles, X } from "lucide-react";

export const nav = [
  { to: "/", label: "Личный кабинет", icon: LayoutGrid },
  { to: "/placement", label: "Placement Test", icon: GraduationCap },
  { to: "/levels", label: "Уровни A · B · C", icon: Layers },
  { to: "/lessons", label: "Уроки и конструктор", icon: BookOpen },
  { to: "/dialogues", label: "ИИ-диалоги", icon: MessagesSquare },
  { to: "/games", label: "Игры со словами", icon: Puzzle },
  { to: "/errors", label: "Мои ошибки", icon: Bug },
  { to: "/reviews", label: "Кино-рецензии", icon: Film },
  { to: "/rules", label: "Справочник правил", icon: NotebookText },
  { to: "/gemini", label: "Настройки Gemini", icon: Sparkles },
] as const;

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
        <GraduationCap className="size-5" />
      </span>
      <span className="font-display text-2xl font-semibold tracking-[0.12em]">NATIVE</span>
    </div>
  );
}

function useStudyTimer(active: boolean) {
  const since = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    const start = () => { since.current = Date.now(); };
    const flush = () => {
      if (since.current) { void logStudySeconds((Date.now() - since.current) / 1000); since.current = null; }
    };
    const onVis = () => (document.visibilityState === "visible" ? start() : flush());
    if (document.visibilityState === "visible") start();
    const t = setInterval(() => { flush(); if (document.visibilityState === "visible") start(); }, 120_000);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", flush);
    return () => { clearInterval(t); flush(); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("pagehide", flush); };
  }, [active]);
}

export function AppShell({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  useStudyTimer(!!session);
  if (loading) return <div className="grid min-h-dvh place-items-center text-faint">Загрузка…</div>;
  if (!session) return <AuthScreen />;
  const email = session.user.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();
  return (
    <div className="min-h-dvh w-full overflow-x-clip">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="border-b px-5 py-5"><Logo /></div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="space-y-3 border-t p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{initials}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{email}</p>
              <p className="text-xs text-faint">Студент</p>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="btn-ghost w-full">
            <LogOut className="size-4" /> Выйти
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 safe-top">
          <Logo />
          <button onClick={() => setMenuOpen(true)} className="grid size-11 shrink-0 place-items-center rounded-lg border bg-surface" aria-label="Открыть меню" aria-expanded={menuOpen}>
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Навигация">
          <button className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню" />
          <div className="absolute inset-y-0 right-0 flex w-[min(88vw,22rem)] flex-col border-l bg-card shadow-2xl">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b px-4 py-3 safe-top">
              <Logo />
              <button onClick={() => setMenuOpen(false)} className="grid size-11 place-items-center rounded-lg border bg-surface" aria-label="Закрыть меню"><X className="size-5" /></button>
            </div>
            <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
              {nav.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} activeOptions={{ exact: true }} onClick={() => setMenuOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground">
                  <Icon className="size-4 shrink-0" /><span className="min-w-0">{label}</span>
                </Link>
              ))}
            </nav>
            <div className="space-y-3 border-t p-4 safe-bottom">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{initials}</span>
                <div className="min-w-0"><p className="truncate text-sm font-medium">{email}</p><p className="text-xs text-faint">Студент</p></div>
              </div>
              <button onClick={() => { setMenuOpen(false); void supabase.auth.signOut(); }} className="btn-ghost min-h-11 w-full"><LogOut className="size-4" />Выйти</button>
            </div>
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto min-w-0 max-w-5xl px-3 py-5 sm:px-6 sm:py-8 xl:px-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ eyebrow, icon: Icon, title, subtitle, right }: {
  eyebrow: string; icon: typeof LayoutGrid; title: string; subtitle: string; right?: ReactNode;
}) {
  return (
    <div className="rise mb-6 grid grid-cols-1 items-end gap-4 sm:mb-8 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <p className="mb-2 flex items-center gap-2 text-sm text-faint"><Icon className="size-4" />{eyebrow}</p>
        <h1 className="break-words text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}
