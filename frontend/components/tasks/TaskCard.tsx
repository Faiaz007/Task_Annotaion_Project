"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/stores/taskStore";
import { clsx } from "clsx";
import { format } from "date-fns";

interface Props {
  task: Task;
  onClick: () => void;
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  high: { label: "High", className: "badge-high" },
  medium: { label: "Med", className: "badge-medium" },
  low: { label: "Low", className: "badge-low" },
};

export default function TaskCard({ task, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx("task-card", isDragging && "is-dragging")}
    >
      {/* Priority + Title row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
          {task.title}
        </h4>
        <span
          className={clsx(
            "shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
            priority.className
          )}
        >
          {priority.label}
        </span>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs mb-2 line-clamp-2" style={{ color: "var(--text-muted)" }}>
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Due date */}
      {task.due_date && (
        <div className="flex items-center gap-1 mt-1">
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "var(--text-muted)" }}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {format(new Date(task.due_date + "T00:00:00"), "MMM d")}
          </span>
        </div>
      )}
    </div>
  );
}
