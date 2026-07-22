import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";

export function FloatingWidgets({ whatsapp }: { whatsapp?: string | null }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      )}
      {show && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function CookieConsent() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("cookie-consent")) setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 rounded-lg border border-border bg-background p-4 shadow-lg animate-fade-in">
      <p className="text-sm text-muted-foreground">
        We use cookies to improve your experience. By continuing you agree to our use of cookies.
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={() => setShow(false)}
          className="rounded-md px-3 py-1.5 text-sm hover:bg-accent"
        >
          Decline
        </button>
        <button
          onClick={() => {
            localStorage.setItem("cookie-consent", "1");
            setShow(false);
          }}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
