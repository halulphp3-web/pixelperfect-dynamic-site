import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MapPin, CalendarDays, Users, Search } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export function SearchBar({
  locations = [],
  className,
  variant = "solid",
}: {
  locations?: string[];
  className?: string;
  variant?: "solid" | "overlay";
}) {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [openDates, setOpenDates] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);

  const uniqueLocations = useMemo(
    () => Array.from(new Set(locations.filter(Boolean))).sort(),
    [locations],
  );

  const dateLabel = range?.from
    ? range.to
      ? `${format(range.from, "MMM dd, yyyy")} → ${format(range.to, "MMM dd, yyyy")}`
      : format(range.from, "MMM dd, yyyy")
    : "Add dates";

  const submit = () => {
    navigate({
      to: "/properties",
      search: { search: destination || undefined, guests: guests || undefined } as any,
    });
  };

  const shell =
    variant === "overlay"
      ? "bg-background/95 backdrop-blur-md shadow-2xl ring-1 ring-border"
      : "bg-card border border-border shadow-sm";

  return (
    <div
      className={cn(
        "w-full rounded-2xl p-2 grid gap-2 md:grid-cols-[1.4fr_1.6fr_1fr_auto] items-stretch",
        shell,
        className,
      )}
    >
      {/* Destination */}
      <label className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-accent/40 transition cursor-text">
        <MapPin className="h-4 w-4 text-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Destination</div>
          <input
            list="sb-locations"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Choose a location"
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
          />
          <datalist id="sb-locations">
            {uniqueLocations.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </div>
      </label>

      {/* Dates */}
      <Popover open={openDates} onOpenChange={setOpenDates}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-accent/40 transition"
          >
            <CalendarDays className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Check-in / Check-out
              </div>
              <div className="truncate text-sm font-medium">{dateLabel}</div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
          <div className="p-2">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={range}
              onSelect={setRange}
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
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-accent/40 transition"
          >
            <Users className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Guests</div>
              <div className="truncate text-sm font-medium">
                {guests} guest{guests === 1 ? "" : "s"}
              </div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3 pointer-events-auto" align="start">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Guests</div>
              <div className="text-xs text-muted-foreground">Max 16</div>
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
              <span className="w-6 text-center text-sm font-medium">{guests}</span>
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
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
      >
        <Search className="h-4 w-4" /> Search
      </button>
    </div>
  );
}
