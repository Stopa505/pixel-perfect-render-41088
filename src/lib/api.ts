import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const TOPICS = ["SVOMPT", "ASI", "QUASI"] as const;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export function useUserId() {
  return useAuth().session?.user.id ?? null;
}

export function useStats() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["stats", uid],
    enabled: !!uid,
    queryFn: async () => {
      const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
      const [att, ses, ess, prof] = await Promise.all([
        supabase.from("attempts").select("topic, correct, created_at").order("created_at", { ascending: false }).limit(5000),
        supabase.from("study_sessions").select("seconds, created_at").gte("created_at", weekAgo),
        supabase.from("essays").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("*").eq("id", uid!).maybeSingle(),
      ]);
      if (att.error) throw att.error;
      const attempts = att.data ?? [];
      const correct = attempts.filter((a) => a.correct).length;
      const topics = TOPICS.map((t) => {
        const list = attempts.filter((a) => a.topic === t);
        const ok = list.filter((a) => a.correct).length;
        return { topic: t, score: ok * 10, accuracy: list.length ? Math.round((ok / list.length) * 100) : 0 };
      });
      // streak: consecutive days with activity, ending today or yesterday
      const days = new Set(attempts.map((a) => dayKey(new Date(a.created_at))));
      let streak = 0;
      const cur = new Date();
      if (!days.has(dayKey(cur))) cur.setDate(cur.getDate() - 1);
      while (days.has(dayKey(cur))) { streak++; cur.setDate(cur.getDate() - 1); }
      const today = dayKey(new Date());
      const sessions = ses.data ?? [];
      const todaySec = sessions.filter((s) => dayKey(new Date(s.created_at)) === today).reduce((n, s) => n + s.seconds, 0);
      const weekSec = sessions.reduce((n, s) => n + s.seconds, 0);
      const weekDays = new Set(sessions.map((s) => dayKey(new Date(s.created_at)))).size;
      return {
        score: correct * 10,
        accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : 0,
        total: attempts.length,
        essays: ess.count ?? 0,
        streak,
        activeToday: days.has(today),
        topics,
        todayMin: Math.round(todaySec / 60),
        weekMin: Math.round(weekSec / 60),
        weekDays,
        profile: prof.data,
      };
    },
  });
}

export function useRecordAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: { topic: string; correct: boolean; mistake?: { prompt: string; yours: string; correct: string; rule: string } }) => {
      const { error } = await supabase.from("attempts").insert({ topic: a.topic, correct: a.correct });
      if (error) throw error;
      if (!a.correct && a.mistake) {
        const r = await supabase.from("mistakes").insert({ topic: a.topic, ...a.mistake });
        if (r.error) throw r.error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stats"] }); qc.invalidateQueries({ queryKey: ["mistakes"] }); },
  });
}

export function useMistakes() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["mistakes", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from("mistakes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useDeleteMistake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mistakes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mistakes"] }),
  });
}

export function useEssays() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["essays", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from("essays").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveEssay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (e: { title: string; intro: string; plot: string; chars: string; themes: string; word_count: number }) => {
      const { error } = await supabase.from("essays").insert(e);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["essays"] }); qc.invalidateQueries({ queryKey: ["stats"] }); },
  });
}

export async function saveStudyTime(uid: string, time: string) {
  const { error } = await supabase.from("profiles").update({ study_time: time }).eq("id", uid);
  if (error) throw error;
}

export async function logStudySeconds(seconds: number) {
  if (seconds < 10) return;
  await supabase.from("study_sessions").insert({ seconds: Math.round(seconds) });
}
