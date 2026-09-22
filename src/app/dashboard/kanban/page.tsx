"use client";

import { useEffect, useState } from "react";
import type { Task, TaskStatus } from "@/types";
import { TaskCard } from "@/components/TaskCard";
import { SubjectSummary } from "@/components/SubjectSummary";
import { useSubjects } from "@/hooks/useSubjects";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "PENDING", label: "Pendiente" },
  { status: "IN_PROGRESS", label: "En progreso" },
  { status: "DONE", label: "Hecha" },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string | "ALL">("ALL");
  const { subjects, createSubject } = useSubjects();

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

  const visibleTasks = tasks.filter(
    (t) => subjectFilter === "ALL" || t.subjectId === subjectFilter
  );

  if (loading) return <p className="text-sm opacity-60">Cargando…</p>;

  return (
    <div className="flex flex-col gap-4">
      <SubjectSummary
        subjects={subjects}
        activeSubjectId={subjectFilter}
        onSelect={setSubjectFilter}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.status} className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold opacity-70">
              {col.label}
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                {visibleTasks.filter((t) => t.status === col.status).length}
              </span>
            </h2>
            {visibleTasks
              .filter((t) => t.status === col.status)
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  subjects={subjects}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onQuickCreateSubject={createSubject}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
