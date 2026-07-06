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

  const display = selectedDate
    ? format(new Date(selectedDate + "T00:00:00"), "MMM d, yyyy")
    : "No date selected";

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handlePrev}
        className="px-3 py-1.5 text-sm rounded-md border border-zinc-300 hover:bg-zinc-100 transition-colors"
      >
        &larr;
      </button>
      <span className="text-sm font-medium text-zinc-700 min-w-[120px] text-center">
        {display}
      </span>
      <button
        onClick={handleNext}
        className="px-3 py-1.5 text-sm rounded-md border border-zinc-300 hover:bg-zinc-100 transition-colors"
      >
        &rarr;
      </button>
      <button
        onClick={handleToday}
        className="px-3 py-1.5 text-sm rounded-md border border-zinc-300 hover:bg-zinc-100 transition-colors"
      >
        Today
      </button>
    </div>
  );
}
