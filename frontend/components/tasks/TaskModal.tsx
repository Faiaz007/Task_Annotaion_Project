"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/stores/taskStore";

interface Props {
  task?: Task | null;
  onSave: (data: Partial<Task>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const priorityOptions = [
  { value: "low", label: "Low", color: "#34d399" },
  { value: "medium", label: "Medium", color: "#fbbf24" },
  { value: "high", label: "High", color: "#f87171" },
];

export default function TaskModal({ task, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<string>(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  const [tagsInput, setTagsInput] = useState(task?.tags?.join(", ") || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await onSave({
      title,
      description,
      priority: priority as Task["priority"],
      due_date: dueDate || null,
      tags,
    });
    setSaving(false);
  };

  const selectedPriority = priorityOptions.find((p) => p.value === priority);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: task ? "rgba(79,142,247,0.15)" : "rgba(52,211,153,0.15)" }}
            >
              {task ? (
                <svg width="15" height="15" fill="none" stroke="#4f8ef7" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ) : (
                <svg width="15" height="15" fill="none" stroke="#34d399" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </div>
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              {task ? "Edit Task" : "New Task"}
            </h2>
          </div>
          <button
            id="modal-close"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Title <span style={{ color: "#f87171" }}>*</span>
            </label>
            <input
              id="task-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="input-dark"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add more details…"
              className="input-dark resize-none"
            />
          </div>

          {/* Priority + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                Priority
              </label>
              <div className="relative">
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="input-dark select-dark"
                  style={{
                    paddingLeft: "36px",
                    color: selectedPriority?.color || "var(--text-primary)",
                  }}
                >
                  {priorityOptions.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      style={{ background: "var(--bg-card)", color: opt.color }}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{ background: selectedPriority?.color }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-dark"
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Tags
              <span className="ml-1.5 font-normal" style={{ color: "var(--text-muted)" }}>
                (comma-separated)
              </span>
            </label>
            <input
              id="task-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. backend, urgent, v2"
              className="input-dark"
            />
            {tagsInput && (
              <div className="flex flex-wrap gap-1 pt-1">
                {tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                  <span key={tag} className="tag-chip">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {task && onDelete && (
              <button
                type="button"
                id="task-delete"
                onClick={onDelete}
                className="btn-danger"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              id="task-cancel"
              onClick={onClose}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="task-save"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "spin 0.7s linear infinite" }} />
                  Saving…
                </>
              ) : task ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
