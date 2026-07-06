"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import type { Task } from "@/stores/taskStore";
import { clsx } from "clsx";

interface Props {
  status: string;
  label: string;
  color: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddClick: () => void;
}

export default function Column({
  status,
  label,
  color,
  tasks,
  onTaskClick,
  onAddClick,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex-1 min-w-[280px] bg-zinc-50 rounded-lg p-3 border border-zinc-200 transition-colors",
        isOver && "bg-zinc-100 border-zinc-400"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="text-sm font-semibold text-zinc-700">{label}</h3>
          <span className="text-xs text-zinc-400 ml-1">({tasks.length})</span>
        </div>
        <button
          onClick={onAddClick}
          className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          + Add
        </button>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 min-h-[100px]">
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-20 border-2 border-dashed border-zinc-200 rounded-lg">
              <span className="text-xs text-zinc-400">No tasks</span>
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
