import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MapPin, CalendarDays, Users, Search, Check } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";


export function SearchBar({
  locations = [],
  className,
  variant = "solid",
  onSubmit,
}: {
  locations?: string[];
  className?: string;
  variant?: "solid" | "overlay" | "header";
  onSubmit?: (v: { destination: string; range: DateRange | undefined; guests: number }) => void;
}) {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [openDest, setOpenDest] = useState(false);
  const [openDates, setOpenDates] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);
  const [months, setMonths] = useState(2);
  useEffect(() => {
    const update = () => setMonths(window.innerWidth < 640 ? 1 : 2);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);


  const uniqueLocations = useMemo(
    () => Array.from(new Set(locations.filter(Boolean))).sort(),
    [locations],
  );

  const dateLabel = range?.from
    ? range.to
      ? `${format(range.from, "MMM dd")} → ${format(range.to, "MMM dd")}`
      : format(range.from, "MMM dd, yyyy")
    : "Choose the date";

  const submit = () => {
    if (onSubmit) {
      onSubmit({ destination, range, guests });
      return;
    }
    navigate({
      to: "/properties",
      search: { search: destination || undefined, guests: guests || undefined } as any,
    });
  };

  const shell =
    variant === "overlay"
      ? "bg-background/95 backdrop-blur-md shadow-2xl ring-1 ring-border rounded-2xl p-2"
      : variant === "header"
      ? "bg-transparent rounded-xl p-0"
      : "bg-card border border-border shadow-sm rounded-2xl p-2";

  // white input cells (works in dark mode too since user asked white bg)
  const cell =
    "flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-2.5 text-left text-slate-900 transition hover:border-primary/60";

  return (
    <div
      className={cn(
        "w-full grid gap-2 items-stretch",
        variant === "header"
          ? "grid-cols-1 md:grid-cols-[1.3fr_1.4fr_1fr_auto]"
          : "md:grid-cols-[1.4fr_1.6fr_1fr_auto]",
        shell,
        className,
      )}
    >
      {/* Destination */}
      <Popover open={openDest} onOpenChange={setOpenDest}>
        <PopoverTrigger asChild>
          <button type="button" className={cn(cell, "w-full")}>
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Destination</div>
              <div className={cn("truncate text-sm font-medium", !destination && "text-slate-400")}>
                {destination || "Choose a location"}
              </div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="p-0 pointer-events-auto bg-white"
          style={{ width: "var(--radix-popover-trigger-width)", minWidth: 260 }}
        >
          <div className="p-2">
            <input
              autoFocus
              value={destQuery}
              onChange={(e) => setDestQuery(e.target.value)}
              placeholder="Search a location…"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary"
            />
          </div>
          <div className="max-h-64 overflow-y-auto pb-2">
            <button
              type="button"
              onClick={() => { setDestination(""); setOpenDest(false); }}
              className="flex w-full items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Any destination
              {!destination && <Check className="h-4 w-4 text-primary" />}
            </button>
            {uniqueLocations
              .filter((l) => l.toLowerCase().includes(destQuery.toLowerCase()))
              .map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => { setDestination(l); setOpenDest(false); setDestQuery(""); }}
                  className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2 truncate">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {l}
                  </span>
                  {destination === l && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            {uniqueLocations.filter((l) => l.toLowerCase().includes(destQuery.toLowerCase())).length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-slate-400">No matches</div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Dates */}
      <Popover open={openDates} onOpenChange={setOpenDates}>
        <PopoverTrigger asChild>
          <button type="button" className={cell}>
            <CalendarDays className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Check-in / Check-out
              </div>
              <div className="truncate text-sm font-medium">{dateLabel}</div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto bg-white" align="start">
          <div className="p-2">
            <Calendar
              mode="range"
              numberOfMonths={months}
              selected={range}
              onSelect={(r) => {
                setRange(r);
                if (r?.from && r?.to) {
                  setOpenDates(false);
                }
              }}
              disabled={{ before: new Date() }}
              className={cn("p-3 pointer-events-auto")}
            />
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <button
                type="button"
                onClick={() => setRange(undefined)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpenDates(false)}
                className="rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Guests */}
      <Popover open={openGuests} onOpenChange={setOpenGuests}>
        <PopoverTrigger asChild>
          <button type="button" className={cell}>
            <Users className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Guests</div>
              <div className="truncate text-sm font-medium">
                {guests} guest{guests === 1 ? "" : "s"}
              </div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3 pointer-events-auto bg-white" align="start">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Guests</div>
              <div className="text-xs text-slate-500">Max 16</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                className="h-8 w-8 rounded-full border border-border text-lg leading-none hover:bg-accent"
                aria-label="Decrease guests"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-medium text-slate-900">{guests}</span>
              <button
                type="button"
                onClick={() => setGuests((g) => Math.min(16, g + 1))}
                className="h-8 w-8 rounded-full border border-border text-lg leading-none hover:bg-accent"
                aria-label="Increase guests"
              >
                +
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <button
        type="button"
        onClick={submit}
        style={{ backgroundColor: "#c9a15a" }}
        className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-110 transition"
      >
        <Search className="h-4 w-4" /> Search
      </button>
    </div>
  );
}
