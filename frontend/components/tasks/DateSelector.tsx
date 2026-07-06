"use client";

import { useDateStore } from "@/stores/dateStore";
import { format, addDays, subDays } from "date-fns";

export default function DateSelector() {
  const { selectedDate, setSelectedDate } = useDateStore();

  const today = format(new Date(), "yyyy-MM-dd");

  const handlePrev = () => {
    const d = selectedDate || today;
    setSelectedDate(format(subDays(new Date(d + "T00:00:00"), 1), "yyyy-MM-dd"));
  };

  const handleNext = () => {
    const d = selectedDate || today;
    setSelectedDate(format(addDays(new Date(d + "T00:00:00"), 1), "yyyy-MM-dd"));
  };

  const handleToday = () => {
    setSelectedDate(today);
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(e.target.value);
    }
  };

  const isToday = selectedDate === today;

  return (
    <div className="flex items-center gap-2">
      {/* Prev button */}
      <button
        id="date-prev"
        onClick={handlePrev}
        className="btn-ghost"
        style={{ padding: "7px 10px" }}
        title="Previous day"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Date input (hidden, triggered by label) */}
      <label
        className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--border-medium)",
          fontSize: "13px",
          fontWeight: "600",
          color: "var(--text-primary)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLLabelElement).style.background = "rgba(255,255,255,0.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLLabelElement).style.background = "rgba(255,255,255,0.05)";
        }}
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="min-w-[110px] text-center">
          {selectedDate
            ? format(new Date(selectedDate + "T00:00:00"), "MMM d, yyyy")
            : "Pick a date"}
        </span>
        <input
          id="date-input"
          type="date"
          value={selectedDate || ""}
          onChange={handleDateInput}
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
          style={{ zIndex: 1 }}
        />
      </label>

      {/* Next button */}
      <button
        id="date-next"
        onClick={handleNext}
        className="btn-ghost"
        style={{ padding: "7px 10px" }}
        title="Next day"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Today button */}
      {!isToday && (
        <button
          id="date-today"
          onClick={handleToday}
          className="btn-ghost"
          style={{ fontSize: "12px", padding: "7px 12px" }}
        >
          Today
        </button>
      )}
    </div>
  );
}
