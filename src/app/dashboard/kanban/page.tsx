"use client";

import { useEffect, useState } from "react";
import type { Task, TaskStatus } from "@/types";
import { TaskCard } from "@/components/TaskCard";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "PENDING", label: "Pendiente" },
  { status: "IN_PROGRESS", label: "En progreso" },
  { status: "DONE", label: "Hecha" },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    setLoading(true);
    const res = await fetch("/api/tasks");
    if (res.ok) setTasks(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleUpdate(id: string, values: Record<string, unknown>) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) loadTasks();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta tarea?")) return;
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  if (loading) return <p className="text-sm opacity-60">Cargando…</p>;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => (
        <div key={col.status} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold opacity-70">
            {col.label} ({tasks.filter((t) => t.status === col.status).length})
          </h2>
          {tasks
            .filter((t) => t.status === col.status)
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
        </div>
      ))}
    </div>
  );
}
