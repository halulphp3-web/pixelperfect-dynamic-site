import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Lang = string;

export const SUPPORTED_LANGS: { code: string; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "zh-CN", label: "Chinese", native: "中文" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ur", label: "Urdu", native: "اردو" },
];

type SiteCtx = {
  currency: string;
  setCurrency: (v: string) => void;
  supportedCurrencies: string[];
  lang: Lang;
  setLang: (v: Lang) => void;
  supportedLangs: typeof SUPPORTED_LANGS;
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const Ctx = createContext<SiteCtx | null>(null);

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

function setGoogTransCookie(target: string) {
  const value = target === "en" ? "" : `/en/${target}`;
  const domain = window.location.hostname;
  const parts = domain.split(".");
  const rootDomain = parts.length > 1 ? "." + parts.slice(-2).join(".") : domain;
  document.cookie = `googtrans=${value};path=/`;
  document.cookie = `googtrans=${value};path=/;domain=${domain}`;
  document.cookie = `googtrans=${value};path=/;domain=${rootDomain}`;
}

function loadGoogleTranslate() {
  if (document.getElementById("google-translate-script")) return;
  const container = document.createElement("div");
  container.id = "google_translate_element";
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  window.googleTranslateElementInit = () => {
    if (!window.google?.translate) return;
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: SUPPORTED_LANGS.map((l) => l.code).join(","),
        autoDisplay: false,
      },
      "google_translate_element",
    );
  };

  const s = document.createElement("script");
  s.id = "google-translate-script";
  s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.body.appendChild(s);

  // Hide the top bar Google Translate injects
  const style = document.createElement("style");
  style.textContent = `
    .goog-te-banner-frame.skiptranslate, .goog-te-gadget { display: none !important; }
    body { top: 0 !important; }
    .goog-tooltip, .goog-tooltip:hover { display: none !important; }
    .goog-text-highlight { background: transparent !important; box-shadow: none !important; }
  `;
  document.head.appendChild(style);
}

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
      const l = localStorage.getItem("site.lang");
      if (l) setLangState(l);
      const t = (localStorage.getItem("site.theme") as "light" | "dark" | null) ||
        (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      setTheme(t);
    } catch {}
    loadGoogleTranslate();
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
    root.setAttribute("dir", lang === "ar" || lang === "ur" ? "rtl" : "ltr");
    try { localStorage.setItem("site.lang", lang); } catch {}
  }, [lang]);

  const setCurrency = useCallback((v: string) => {
    setCurrencyState(v);
    try { localStorage.setItem("site.currency", v); } catch {}
  }, []);

  const setLang = useCallback((v: Lang) => {
    setLangState(v);
    try { localStorage.setItem("site.lang", v); } catch {}
    setGoogTransCookie(v);
    // Reload so Google Translate re-applies to the entire tree
    setTimeout(() => window.location.reload(), 50);
  }, []);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const value = useMemo(
    () => ({ currency, setCurrency, supportedCurrencies, lang, setLang, supportedLangs: SUPPORTED_LANGS, theme, toggleTheme }),
    [currency, setCurrency, supportedCurrencies, lang, setLang, theme, toggleTheme],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSite() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSite must be used inside SiteProvider");
  return v;
}
