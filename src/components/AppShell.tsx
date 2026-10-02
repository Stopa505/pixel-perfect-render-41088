import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BookOpen, Bug, Film, GraduationCap, LayoutGrid, LogOut, NotebookText, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const nav = [
  { to: "/", label: "Личный кабинет", icon: LayoutGrid },
  { to: "/lessons", label: "Уроки", icon: BookOpen },
  { to: "/errors", label: "Мои ошибки", icon: Bug },
  { to: "/reviews", label: "Кино-рецензии", icon: Film },
  { to: "/rules", label: "Справочник правил", icon: NotebookText },
  { to: "/gemini", label: "Интеграция с Gemini", icon: Sparkles },
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

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="border-b px-5 py-5"><Logo /></div>
        <nav className="flex-1 space-y-1 p-3">
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
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">SA</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">savinstepan456@gmail.com</p>
              <p className="text-xs text-faint">Студент</p>
            </div>
          </div>
          <button onClick={() => toast("Вы вышли из аккаунта")} className="btn-ghost w-full">
            <LogOut className="size-4" /> Выйти
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur lg:hidden">
        <div className="px-4 py-3"><Logo /></div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: true }}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground">
              <Icon className="size-4" />{label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ eyebrow, icon: Icon, title, subtitle, right }: {
  eyebrow: string; icon: typeof LayoutGrid; title: string; subtitle: string; right?: ReactNode;
}) {
  return (
    <div className="rise mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm text-faint"><Icon className="size-4" />{eyebrow}</p>
        <h1 className="text-4xl font-semibold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}
