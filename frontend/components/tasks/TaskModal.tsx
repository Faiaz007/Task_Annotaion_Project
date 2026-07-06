"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/stores/taskStore";

interface Props {
  task?: Task | null;
  onSave: (data: Partial<Task>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function TaskModal({ task, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<string>(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  const [tagsInput, setTagsInput] = useState(task?.tags?.join(", ") || "");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({
      title,
      description,
      priority: priority as Task["priority"],
      due_date: dueDate || null,
      tags,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-800">
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Tags (comma-separated)
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. backend, urgent"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
          <div className="flex gap-2 pt-2">
            {task && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors"
            >
              {task ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
