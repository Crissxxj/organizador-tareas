"use client";

import { useCallback, useEffect, useState } from "react";
import type { Subject } from "@/types";
import type { SubjectFormValues } from "@/components/SubjectForm";
import type { SubjectWithStats } from "@/components/SubjectManager";

export function useSubjects() {
  const [subjects, setSubjects] = useState<SubjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/subjects");
    if (res.ok) setSubjects(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const createSubject = useCallback(
    async (values: SubjectFormValues): Promise<Subject | null> => {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo crear la materia");
        return null;
      }
      const created = await res.json();
      await loadSubjects();
      return created;
    },
    [loadSubjects]
  );

  const updateSubject = useCallback(
    async (id: string, values: SubjectFormValues) => {
      const res = await fetch(`/api/subjects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) await loadSubjects();
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo actualizar la materia");
      }
    },
    [loadSubjects]
  );

  const deleteSubject = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
      if (res.ok) await loadSubjects();
    },
    [loadSubjects]
  );

  return {
    subjects,
    loadingSubjects: loading,
    createSubject,
    updateSubject,
    deleteSubject,
  };
}
