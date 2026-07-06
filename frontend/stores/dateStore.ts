import { create } from "zustand";

interface DateState {
  selectedDate: string | null; // YYYY-MM-DD
  setSelectedDate: (date: string | null) => void;
}

export const useDateStore = create<DateState>()((set) => ({
  selectedDate: null,
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
