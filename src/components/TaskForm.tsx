"use client";

import { useState } from "react";
import type { Task, Priority, Subject } from "@/types";
import { SubjectForm, SubjectFormValues } from "./SubjectForm";

export interface TaskFormValues {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: Priority;
  subjectId: string;
  reminderMinutesBefore: number;
}

const REMINDER_OPTIONS = [
  { value: 15, label: "15 minutos antes" },
  { value: 30, label: "30 minutos antes" },
  { value: 60, label: "1 hora antes" },
  { value: 180, label: "3 horas antes" },
  { value: 1440, label: "1 día antes" },
  { value: 2880, label: "2 días antes" },
];

const NEW_SUBJECT_VALUE = "__new__";

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TaskForm({
  initial,
  subjects,
  onSubmit,
  onCancel,
  onQuickCreateSubject,
  submitLabel = "Agregar tarea",
}: {
  initial?: Partial<Task>;
  subjects: Subject[];
  onSubmit: (values: TaskFormValues) => void;
  onCancel?: () => void;
  onQuickCreateSubject: (values: SubjectFormValues) => Promise<Subject | null>;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<TaskFormValues>({
    title: initial?.title || "",
    description: initial?.description || "",
    startDate: toDatetimeLocal(initial?.startDate),
    endDate: toDatetimeLocal(initial?.endDate) || "",
    priority: (initial?.priority as Priority) || "MEDIUM",
    subjectId: initial?.subjectId || "",
    reminderMinutesBefore: initial?.reminderMinutesBefore ?? 60,
  });
  const [showNewSubject, setShowNewSubject] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!values.title.trim() || !values.endDate) return;
        onSubmit(values);
      }}
      className="card flex flex-col gap-3 rounded-xl p-4 shadow-sm"
    >
      <input
        required
        placeholder="¿Qué tienes que hacer?"
        value={values.title}
        onChange={(e) => setValues({ ...values, title: e.target.value })}
        className="rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
      />

      <textarea
        placeholder="Descripción (opcional)"
        value={values.description}
        onChange={(e) => setValues({ ...values, description: e.target.value })}
        className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
        rows={2}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs opacity-70">
          Fecha de inicio
          <input
            type="datetime-local"
            value={values.startDate}
            onChange={(e) => setValues({ ...values, startDate: e.target.value })}
            className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs opacity-70">
          Fecha de finalización *
          <input
            required
            type="datetime-local"
            value={values.endDate}
            onChange={(e) => setValues({ ...values, endDate: e.target.value })}
            className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs opacity-70">
          Prioridad
          <select
            value={values.priority}
            onChange={(e) =>
              setValues({ ...values, priority: e.target.value as Priority })
            }
            className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
          >
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs opacity-70">
          Materia
          <select
            value={values.subjectId}
            onChange={(e) => {
              if (e.target.value === NEW_SUBJECT_VALUE) {
                setShowNewSubject(true);
                return;
              }
              setValues({ ...values, subjectId: e.target.value });
            }}
            className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
          >
            <option value="">Sin materia</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
            <option value={NEW_SUBJECT_VALUE}>➕ Nueva materia…</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs opacity-70">
          Recordatorio
          <select
            value={values.reminderMinutesBefore}
            onChange={(e) =>
              setValues({
                ...values,
                reminderMinutesBefore: Number(e.target.value),
              })
            }
            className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
          >
            {REMINDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {showNewSubject && (
        <SubjectForm
          submitLabel="Crear y usar"
          onCancel={() => setShowNewSubject(false)}
          onSubmit={async (subjectValues) => {
            const created = await onQuickCreateSubject(subjectValues);
            if (created) {
              setValues((v) => ({ ...v, subjectId: created.id }));
            }
            setShowNewSubject(false);
          }}
        />
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-700"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
