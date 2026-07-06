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

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx(
        "bg-white rounded-lg border border-zinc-200 p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="text-sm font-medium text-zinc-800 leading-snug">
          {task.title}
        </h4>
        <span
          className={clsx(
            "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border shrink-0",
            priorityColors[task.priority]
          )}
        >
          {task.priority}
        </span>
      </div>
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {task.due_date && (
        <p className="text-[11px] text-zinc-400 mt-1.5">
          {format(new Date(task.due_date + "T00:00:00"), "MMM d")}
        </p>
      )}
    </div>
  );
}
