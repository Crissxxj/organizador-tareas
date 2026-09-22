"use client";

import { useEffect, useState } from "react";
import type { GithubIssue } from "@/types";

export default function SettingsPage() {
  const [issues, setIssues] = useState<GithubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<Set<number>>(new Set());

  async function loadIssues() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/github/issues");
    if (res.ok) {
      setIssues(await res.json());
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudieron cargar los issues de GitHub");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadIssues();
  }, []);

  async function importIssue(issue: GithubIssue) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // por defecto, vence en una semana

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: issue.title,
        category: issue.repository,
        endDate: endDate.toISOString(),
        source: "github",
        sourceUrl: issue.html_url,
      }),
    });

    if (res.ok) {
      setImportedIds((prev) => new Set(prev).add(issue.id));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="card rounded-lg p-4">
        <h2 className="mb-1 font-semibold">Issues asignados en GitHub</h2>
        <p className="mb-3 text-sm opacity-60">
          Al importar un issue se crea una tarea con fecha de vencimiento a 7
          días (puedes editarla después desde la lista).
        </p>

        {loading && <p className="text-sm opacity-60">Cargando…</p>}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        {!loading && !error && issues.length === 0 && (
          <p className="text-sm opacity-60">No tienes issues abiertos asignados.</p>
        )}

        <ul className="flex flex-col gap-2">
          {issues.map((issue) => (
            <li
              key={issue.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800"
            >
              <div>
                <a
                  href={issue.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline"
                >
                  {issue.title}
                </a>
                <p className="text-xs opacity-60">{issue.repository}</p>
              </div>

              <button
                disabled={importedIds.has(issue.id)}
                onClick={() => importIssue(issue)}
                className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
              >
                {importedIds.has(issue.id) ? "Importada ✓" : "Importar como tarea"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card rounded-lg p-4 text-sm opacity-70">
        <h2 className="mb-1 font-semibold opacity-100">Notificaciones</h2>
        <p>
          Los recordatorios se envían como notificaciones del navegador mientras
          tengas la app abierta en una pestaña. Actívalas desde el banner que
          aparece en la vista de Lista.
        </p>
      </section>
    </div>
  );
}
