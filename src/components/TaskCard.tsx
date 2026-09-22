"use client";

import { useState } from "react";
import type { Task, TaskStatus, Subject } from "@/types";
import { TaskForm, TaskFormValues } from "./TaskForm";
import { SubjectBadge } from "./SubjectBadge";
import type { SubjectFormValues } from "./SubjectForm";

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  MEDIUM: "bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  HIGH: "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En progreso",
  DONE: "Hecha",
};

function formatDate(value: string) {
  const d = new Date(value);
  return d.toLocaleString("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(task: Task) {
  return task.status !== "DONE" && new Date(task.endDate).getTime() < Date.now();
}

export function TaskCard({
  task,
  subjects,
  onUpdate,
  onDelete,
  onQuickCreateSubject,
}: {
  task: Task;
  subjects: Subject[];
  onUpdate: (id: string, values: Partial<TaskFormValues> | { status: TaskStatus }) => void;
  onDelete: (id: string) => void;
  onQuickCreateSubject: (values: SubjectFormValues) => Promise<Subject | null>;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <TaskForm
        initial={task}
        subjects={subjects}
        onQuickCreateSubject={onQuickCreateSubject}
        submitLabel="Guardar cambios"
        onCancel={() => setEditing(false)}
        onSubmit={(values) => {
          onUpdate(task.id, values);
          setEditing(false);
        }}
      />
    );
  }

  const accentColor = task.subject?.color;

  return (
    <div
      className={`card flex flex-col gap-2 rounded-xl p-4 shadow-sm transition hover:shadow-md ${
        isOverdue(task) ? "border-red-400 dark:border-red-700" : ""
      }`}
      style={accentColor ? { borderLeft: `4px solid ${accentColor}` } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className={`font-medium ${
            task.status === "DONE" ? "line-through opacity-50" : ""
          }`}
        >
          {task.title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}
        >
          {PRIORITY_LABEL[task.priority]}
        </span>
      </div>

      {task.description && (
        <p className="text-sm opacity-70">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs opacity-70">
        <span>📅 {formatDate(task.endDate)}</span>
        <SubjectBadge subject={task.subject} />
        {task.source === "github" && (
          <a
            href={task.sourceUrl || "#"}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-gray-900 px-2 py-0.5 text-white dark:bg-gray-100 dark:text-gray-900"
          >
            GitHub
          </a>
        )}
        {isOverdue(task) && (
          <span className="font-semibold text-red-600 dark:text-red-400">
            Vencida
          </span>
        )}
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <select
          value={task.status}
          onChange={(e) =>
            onUpdate(task.id, { status: e.target.value as TaskStatus })
          }
          className="rounded-md border border-gray-300 bg-transparent px-2 py-1 text-xs dark:border-gray-700"
        >
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="text-xs underline opacity-70 hover:opacity-100"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs text-red-600 underline hover:opacity-100 dark:text-red-400"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
