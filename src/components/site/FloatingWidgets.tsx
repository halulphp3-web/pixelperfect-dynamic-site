import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle, Bot, X } from "lucide-react";
import type { FeatureFlags } from "@/lib/public-content.functions";

export function FloatingWidgets({
  whatsapp,
  flags,
}: {
  whatsapp?: string | null;
  flags: FeatureFlags;
}) {
  const [show, setShow] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
        {flags.widgets.ai_chat && (
          <button
            onClick={() => setChatOpen((v) => !v)}
            className="grid h-12 w-12 place-items-center rounded-full bg-foreground text-background shadow-lg hover:scale-105 transition"
            aria-label="Open chat"
          >
            <Bot className="h-5 w-5" />
          </button>
        )}
        {flags.widgets.whatsapp && whatsapp && (
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
        {flags.widgets.back_to_top && show && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>

      {flags.widgets.ai_chat && chatOpen && (
        <div className="fixed bottom-24 right-5 z-40 w-80 max-w-[calc(100vw-2.5rem)] rounded-xl border border-border bg-card p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">Concierge</div>
            <button onClick={() => setChatOpen(false)} aria-label="Close" className="p-1 hover:bg-accent rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Hi! Ask about stays, availability, or the neighbourhood — a host will reply shortly.
          </p>
          <div className="mt-3 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
            Live chat is being set up. In the meantime, message us on WhatsApp for a fast reply.
          </div>
        </div>
      )}
    </>
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
        <button onClick={() => setShow(false)} className="rounded-md px-3 py-1.5 text-sm hover:bg-accent">
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
