const K = "native.geminiKey";

export function getGeminiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(K) ?? "";
  } catch {
    return "";
  }
}

export function setGeminiKey(v: string): void {
  if (typeof window === "undefined") return;
  try {
    if (v) localStorage.setItem(K, v);
    else localStorage.removeItem(K);
  } catch {
    /* noop */
  }
}
