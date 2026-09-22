"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import type { Task } from "@/types";

const PRIORITY_DOT: Record<string, string> = {
  LOW: "bg-gray-400",
  MEDIUM: "bg-amber-500",
  HIGH: "bg-red-500",
};

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => (res.ok ? res.json() : []))
      .then(setTasks);
  }, []);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const result: Date[] = [];
    let day = start;
    while (day <= end) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [cursor]);

  const tasksByDay = (day: Date) =>
    tasks.filter((t) => isSameDay(new Date(t.endDate), day));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCursor(subMonths(cursor, 1))}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
        >
          ← Anterior
        </button>
        <h2 className="text-lg font-semibold capitalize">
          {format(cursor, "MMMM yyyy", { locale: es })}
        </h2>
        <button
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
        >
          Siguiente →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium opacity-60">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayTasks = tasksByDay(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`card flex min-h-[64px] flex-col items-start gap-1 rounded-md p-1.5 text-left text-xs ${
                !isSameMonth(day, cursor) ? "opacity-30" : ""
              } ${isSameDay(day, new Date()) ? "border-brand" : ""}`}
            >
              <span>{format(day, "d")}</span>
              <div className="flex flex-wrap gap-0.5">
                {dayTasks.slice(0, 4).map((t) => (
                  <span
                    key={t.id}
                    className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[t.priority]}`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className="card rounded-lg p-4">
          <h3 className="mb-2 font-medium">
            {format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}
          </h3>
          {tasksByDay(selectedDay).length === 0 ? (
            <p className="text-sm opacity-60">No hay tareas ese día.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {tasksByDay(selectedDay).map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[t.priority]}`} />
                  {t.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
