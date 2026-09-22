"use client";

import { useEffect, useMemo, useState } from "react";
import type { Task, TaskStatus } from "@/types";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm, TaskFormValues } from "@/components/TaskForm";
import { ReminderWatcher } from "@/components/ReminderWatcher";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  async function loadTasks() {
    setLoading(true);
    const res = await fetch("/api/tasks");
    if (res.ok) setTasks(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(tasks.map((t) => t.category).filter(Boolean) as string[]);
    return Array.from(set);
  }, [tasks]);

  const visibleTasks = tasks.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
    return true;
  });

  async function handleCreate(values: TaskFormValues) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      setShowForm(false);
      loadTasks();
    }
  }

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

  return (
    <div className="flex flex-col gap-4">
      <ReminderWatcher />

      {showForm ? (
        <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="card rounded-lg px-4 py-3 text-left text-sm opacity-70 hover:opacity-100"
        >
          ➕ Agregar una nueva tarea…
        </button>
      )}

      <div className="flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "ALL")}
          className="rounded-md border border-gray-300 bg-transparent px-3 py-1.5 text-sm dark:border-gray-700"
        >
          <option value="ALL">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="IN_PROGRESS">En progreso</option>
          <option value="DONE">Hecha</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-gray-300 bg-transparent px-3 py-1.5 text-sm dark:border-gray-700"
        >
          <option value="ALL">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm opacity-60">Cargando tareas…</p>
      ) : visibleTasks.length === 0 ? (
        <p className="text-sm opacity-60">No tienes tareas aquí. ¡Agrega una!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
