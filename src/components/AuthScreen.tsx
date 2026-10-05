import { useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export function AuthScreen() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        if (!data.session) toast.success("Проверьте почту и подтвердите регистрацию");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось войти");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Не удалось войти через Google");
  };

  return (
    <div className="grid min-h-dvh items-start overflow-y-auto px-3 py-5 sm:place-items-center sm:px-4 sm:py-8">
      <div className="panel rise w-full max-w-sm p-5 sm:p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><GraduationCap className="size-5" /></span>
          <span className="font-display text-3xl font-semibold tracking-[0.12em]">NATIVE</span>
        </div>
        <h1 className="text-2xl font-semibold">{mode === "in" ? "Вход в аккаунт" : "Регистрация"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ваш прогресс сохраняется в аккаунте</p>
        <button onClick={google} className="btn-ghost mt-6 w-full">Продолжить с Google</button>
        <div className="my-5 flex items-center gap-3 text-xs text-faint"><span className="h-px flex-1 bg-border" />или<span className="h-px flex-1 bg-border" /></div>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="field" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" className="field" />
          <button disabled={busy} className="btn-gold w-full">{busy && <Loader2 className="size-4 animate-spin" />}{mode === "in" ? "Войти" : "Создать аккаунт"}</button>
        </form>
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary">
          {mode === "in" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
}
