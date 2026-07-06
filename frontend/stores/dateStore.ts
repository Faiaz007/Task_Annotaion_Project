import { create } from "zustand";

interface DateState {
  selectedDate: string | null; // YYYY-MM-DD
  setSelectedDate: (date: string | null) => void;
}

function todayISO() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export const useDateStore = create<DateState>()((set) => ({
  selectedDate: todayISO(),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
