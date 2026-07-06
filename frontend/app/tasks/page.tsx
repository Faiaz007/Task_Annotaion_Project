"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DateSelector from "@/components/tasks/DateSelector";
import Board from "@/components/tasks/Board";
import Link from "next/link";

export default function TasksPage() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("auth-storage");
    if (!stored) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex-1 flex flex-col p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-zinc-800">Tasks</h1>
        <Link
          href="/annotate"
          className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          Annotation Tool &rarr;
        </Link>
      </div>
      <div className="mb-6">
        <DateSelector />
      </div>
      <Board />
    </div>
  );
}
