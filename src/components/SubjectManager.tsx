"use client";

import { useState } from "react";
import type { Subject } from "@/types";
import { SubjectForm, SubjectFormValues } from "./SubjectForm";

export interface SubjectWithStats extends Subject {
  taskCount: number;
  doneCount: number;
  pendingCount: number;
  nextDue: string | null;
}

export function SubjectManager({
  subjects,
  onCreate,
  onUpdate,
  onDelete,
}: {
  subjects: SubjectWithStats[];
  onCreate: (values: SubjectFormValues) => Promise<void> | void;
  onUpdate: (id: string, values: SubjectFormValues) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {subjects.length === 0 && !showForm && (
        <p className="text-sm opacity-60">
          Aún no tienes materias. Agrega una para empezar a clasificar tus
          tareas.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {subjects.map((subject) =>
          editingId === subject.id ? (
            <li key={subject.id}>
              <SubjectForm
                initial={subject}
                submitLabel="Guardar cambios"
                onCancel={() => setEditingId(null)}
                onSubmit={async (values) => {
                  await onUpdate(subject.id, values);
                  setEditingId(null);
                }}
              />
            </li>
          ) : (
            <li
              key={subject.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: `${subject.color}22` }}
                >
                  {subject.icon}
                </span>
                <div>
                  <p className="font-medium">{subject.name}</p>
                  <p className="text-xs opacity-60">
                    {subject.professor ? `${subject.professor} · ` : ""}
                    {subject.pendingCount} pendiente
                    {subject.pendingCount === 1 ? "" : "s"} de {subject.taskCount}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 text-xs">
                <button
                  onClick={() => setEditingId(subject.id)}
                  className="underline opacity-70 hover:opacity-100"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `¿Eliminar "${subject.name}"? Las tareas no se borran, solo se quedan sin materia.`
                      )
                    ) {
                      onDelete(subject.id);
                    }
                  }}
                  className="text-red-600 underline hover:opacity-100 dark:text-red-400"
                >
                  Eliminar
                </button>
              </div>
            </li>
          )
        )}
      </ul>

      {showForm ? (
        <SubjectForm
          onCancel={() => setShowForm(false)}
          onSubmit={async (values) => {
            await onCreate(values);
            setShowForm(false);
          }}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md border border-dashed border-gray-300 px-3 py-2 text-left text-sm opacity-70 hover:opacity-100 dark:border-gray-700"
        >
          ➕ Agregar materia…
        </button>
      )}
    </div>
  );
}
