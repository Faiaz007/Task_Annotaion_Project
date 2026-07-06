"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DateSelector from "@/components/tasks/DateSelector";
import Board from "@/components/tasks/Board";
import Sidebar from "@/components/Sidebar";
import { useDateStore } from "@/stores/dateStore";
import { format } from "date-fns";

export default function TasksPage() {
  const router = useRouter();
  const { selectedDate } = useDateStore();

  useEffect(() => {
    const stored = localStorage.getItem("auth-storage");
    if (!stored) {
      router.push("/login");
    }
  }, [router]);

  const displayDate = selectedDate
    ? format(new Date(selectedDate + "T00:00:00"), "EEEE, MMMM d, yyyy")
    : "All Tasks";

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(15,17,23,0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Kanban Board</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {displayDate}
            </p>
          </div>
          <DateSelector />
        </header>

        {/* Board area */}
        <div className="flex-1 p-6 overflow-x-auto">
          <Board />
        </div>
      </main>
    </div>
  );
}
