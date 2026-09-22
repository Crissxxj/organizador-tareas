"use client";

import type { SubjectWithStats } from "./SubjectManager";

function formatShortDate(value: string) {
  const d = new Date(value);
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
}

export function SubjectSummary({
  subjects,
  activeSubjectId,
  onSelect,
}: {
  subjects: SubjectWithStats[];
  activeSubjectId: string | "ALL";
  onSelect: (subjectId: string | "ALL") => void;
}) {
  if (subjects.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onSelect("ALL")}
        className={`flex shrink-0 flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left text-xs transition ${
          activeSubjectId === "ALL"
            ? "border-brand bg-brand/10"
            : "border-gray-200 dark:border-gray-800"
        }`}
      >
        <span className="font-medium">Todas</span>
        <span className="opacity-60">
          {subjects.reduce((sum, s) => sum + s.pendingCount, 0)} pendientes
        </span>
      </button>

      {subjects.map((subject) => {
        const progress =
          subject.taskCount === 0
            ? 0
            : Math.round((subject.doneCount / subject.taskCount) * 100);
        const active = activeSubjectId === subject.id;

        return (
          <button
            key={subject.id}
            onClick={() => onSelect(subject.id)}
            className={`flex w-44 shrink-0 flex-col gap-1.5 rounded-lg border px-3 py-2 text-left text-xs transition ${
              active ? "ring-2 ring-offset-1 dark:ring-offset-gray-900" : ""
            }`}
            style={
              {
                borderColor: active ? subject.color : undefined,
                "--tw-ring-color": subject.color,
              } as React.CSSProperties
            }
          >
            <span className="flex items-center gap-1.5 font-medium">
              <span aria-hidden>{subject.icon}</span>
              {subject.name}
            </span>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: subject.color }}
              />
            </div>

            <span className="opacity-60">
              {subject.pendingCount} pendiente{subject.pendingCount === 1 ? "" : "s"}
              {subject.nextDue ? ` · próx. ${formatShortDate(subject.nextDue)}` : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
