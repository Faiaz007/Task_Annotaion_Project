"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useTaskStore } from "@/stores/taskStore";
import { useDateStore } from "@/stores/dateStore";
import Column from "./Column";
import TaskModal from "./TaskModal";
import type { Task } from "@/stores/taskStore";

const columns = [
  { status: "todo", label: "To Do", color: "#6b7280" },
  { status: "in_progress", label: "In Progress", color: "#3b82f6" },
  { status: "done", label: "Done", color: "#22c55e" },
];

export default function Board() {
  const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask, reorder } =
    useTaskStore();
  const { selectedDate } = useDateStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addToStatus, setAddToStatus] = useState<string>("todo");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    fetchTasks(selectedDate);
  }, [selectedDate, fetchTasks]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const taskId = Number(active.id);
      const targetStatus = String(over.id);
      const colTasks = tasks
        .filter((t) => t.status === targetStatus)
        .map((t) => t.id);
      if (!colTasks.includes(taskId)) {
        colTasks.push(taskId);
      }
      const filtered = colTasks.filter(
        (id) => id !== taskId || tasks.find((t) => t.id === id)
      );
      const idx = filtered.indexOf(taskId);
      if (idx === -1) filtered.push(taskId);
      reorder(filtered, targetStatus);
    },
    [tasks, reorder]
  );

  const handleSave = async (data: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask({ ...data, status: addToStatus as Task["status"] });
    }
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleDelete = async () => {
    if (editingTask) {
      await deleteTask(editingTask.id);
      setModalOpen(false);
      setEditingTask(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <Column
              key={col.status}
              status={col.status}
              label={col.label}
              color={col.color}
              tasks={tasks.filter((t) => t.status === col.status)}
              onTaskClick={(task) => {
                setEditingTask(task);
                setModalOpen(true);
              }}
              onAddClick={() => {
                setAddToStatus(col.status);
                setEditingTask(null);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
      </DndContext>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onDelete={editingTask ? handleDelete : undefined}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
        />
      )}
    </>
  );
}
