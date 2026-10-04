const K = "native.geminiKey";
export const getGeminiKey = () => (typeof window === "undefined" ? "" : localStorage.getItem(K) ?? "");
export const setGeminiKey = (v: string) => (v ? localStorage.setItem(K, v) : localStorage.removeItem(K));
