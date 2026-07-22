import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Lang = "en" | "ar";

type SiteCtx = {
  currency: string;
  setCurrency: (v: string) => void;
  supportedCurrencies: string[];
  lang: Lang;
  setLang: (v: Lang) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const Ctx = createContext<SiteCtx | null>(null);

export function SiteProvider({
  children,
  defaultCurrency = "AED",
  supportedCurrencies = ["AED", "USD", "EUR", "GBP"],
}: {
  children: ReactNode;
  defaultCurrency?: string;
  supportedCurrencies?: string[];
}) {
  const [currency, setCurrencyState] = useState(defaultCurrency);
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const c = localStorage.getItem("site.currency");
      if (c && supportedCurrencies.includes(c)) setCurrencyState(c);
      const l = localStorage.getItem("site.lang") as Lang | null;
      if (l === "en" || l === "ar") setLangState(l);
      const t = (localStorage.getItem("site.theme") as "light" | "dark" | null) ||
        (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      setTheme(t);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    try { localStorage.setItem("site.theme", theme); } catch {}
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("lang", lang);
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    try { localStorage.setItem("site.lang", lang); } catch {}
  }, [lang]);

  const setCurrency = useCallback((v: string) => {
    setCurrencyState(v);
    try { localStorage.setItem("site.currency", v); } catch {}
  }, []);

  const setLang = useCallback((v: Lang) => setLangState(v), []);
  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const value = useMemo(
    () => ({ currency, setCurrency, supportedCurrencies, lang, setLang, theme, toggleTheme }),
    [currency, setCurrency, supportedCurrencies, lang, setLang, theme, toggleTheme],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSite() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSite must be used inside SiteProvider");
  return v;
}
