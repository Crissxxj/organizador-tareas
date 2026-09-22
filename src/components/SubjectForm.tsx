"use client";

import { useState } from "react";
import type { Subject } from "@/types";

export interface SubjectFormValues {
  name: string;
  color: string;
  icon: string;
  professor: string;
}

export const SUBJECT_COLORS = [
  "#6366f1", // índigo
  "#ec4899", // rosa
  "#f97316", // naranja
  "#eab308", // amarillo
  "#22c55e", // verde
  "#14b8a6", // teal
  "#0ea5e9", // celeste
  "#8b5cf6", // violeta
  "#ef4444", // rojo
  "#64748b", // gris
];

export const SUBJECT_ICONS = [
  "📘",
  "🧮",
  "🧪",
  "🧬",
  "🌍",
  "🎨",
  "💻",
  "📐",
  "🏛️",
  "🗣️",
  "⚖️",
  "🎵",
];

export function SubjectForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Agregar materia",
}: {
  initial?: Partial<Subject>;
  onSubmit: (values: SubjectFormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<SubjectFormValues>({
    name: initial?.name || "",
    color: initial?.color || SUBJECT_COLORS[0],
    icon: initial?.icon || SUBJECT_ICONS[0],
    professor: initial?.professor || "",
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!values.name.trim()) return;
        onSubmit(values);
      }}
      className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          required
          autoFocus
          placeholder="Nombre de la materia (ej. Cálculo II)"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
        />
        <input
          placeholder="Profesor (opcional)"
          value={values.professor}
          onChange={(e) => setValues({ ...values, professor: e.target.value })}
          className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
        />
      </div>

      <div>
        <p className="mb-1 text-xs opacity-70">Color</p>
        <div className="flex flex-wrap gap-1.5">
          {SUBJECT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValues({ ...values, color })}
              aria-label={`Color ${color}`}
              className={`h-6 w-6 rounded-full transition ${
                values.color === color
                  ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-offset-gray-900 dark:ring-gray-100"
                  : ""
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={values.color}
            onChange={(e) => setValues({ ...values, color: e.target.value })}
            className="h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent p-0"
            title="Color personalizado"
          />
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs opacity-70">Ícono</p>
        <div className="flex flex-wrap gap-1.5">
          {SUBJECT_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setValues({ ...values, icon })}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-lg transition ${
                values.icon === icon
                  ? "bg-gray-200 dark:bg-gray-700"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
          style={{ backgroundColor: `${values.color}22`, color: values.color }}
        >
          {values.icon} {values.name || "Vista previa"}
        </span>

        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs dark:border-gray-700"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
