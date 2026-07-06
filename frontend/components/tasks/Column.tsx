"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import type { Task } from "@/stores/taskStore";
import { clsx } from "clsx";

interface ColConfig {
  status: string;
  label: string;
  accent: string;
  icon: React.ReactNode;
}

const colConfig: ColConfig = {
  status: "",
  label: "",
  accent: "",
  icon: null,
};

const columnMeta: Record<string, { accent: string; icon: React.ReactNode }> = {
  todo: {
    accent: "#94a3b8",
    icon: (
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  in_progress: {
    accent: "#4f8ef7",
    icon: (
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  done: {
    accent: "#34d399",
    icon: (
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
};

interface Props {
  status: string;
  label: string;
  color: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddClick: () => void;
}

export default function Column({ status, label, tasks, onTaskClick, onAddClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = columnMeta[status] || { accent: "#94a3b8", icon: null };

  return (
    <div
      ref={setNodeRef}
      className={clsx("kanban-column flex-1 min-w-[280px] flex flex-col", isOver && "is-over")}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ color: meta.accent }}>{meta.icon}</span>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {label}
          </h3>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
            style={{
              background: `${meta.accent}20`,
              color: meta.accent,
            }}
          >
            {tasks.length}
          </span>
        </div>
        <button
          id={`add-task-${status}`}
          onClick={onAddClick}
          className="flex items-center gap-1 text-xs font-medium transition-colors px-2 py-1 rounded-md"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = meta.accent;
            (e.currentTarget as HTMLButtonElement).style.background = `${meta.accent}10`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add
        </button>
      </div>

      {/* Accent line */}
      <div className="h-0.5 rounded-full mb-3 opacity-60" style={{ background: meta.accent }} />

      {/* Tasks */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 flex-1 min-h-[120px]">
          {tasks.length === 0 && (
            <div className="empty-state">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ opacity: 0.4 }}>
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
              <span>No tasks here</span>
            </div>
          )}
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
