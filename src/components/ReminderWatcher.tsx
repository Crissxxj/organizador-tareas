"use client";

import { useEffect, useRef, useState } from "react";
import type { Task } from "@/types";

const CHECK_INTERVAL_MS = 30_000;

export function ReminderWatcher() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  );
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;

    async function checkReminders() {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) return;
        const tasks: Task[] = await res.json();
        const now = Date.now();

        for (const task of tasks) {
          if (task.status === "DONE" || task.reminderSent) continue;
          if (notifiedRef.current.has(task.id)) continue;

          const dueAt = new Date(task.endDate).getTime();
          const reminderAt = dueAt - task.reminderMinutesBefore * 60_000;

          if (now >= reminderAt) {
            new Notification("Tarea próxima a vencer", {
              body: `${task.title} — vence ${new Date(task.endDate).toLocaleString(
                "es-EC",
                { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }
              )}`,
              tag: task.id,
            });

            notifiedRef.current.add(task.id);
            fetch(`/api/tasks/${task.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reminderSent: true }),
            }).catch(() => {});
          }
        }
      } catch {
        // silencioso: si falla una revisión, se reintenta en el próximo ciclo
      }
    }

    checkReminders();
    const interval = setInterval(checkReminders, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [permission]);

  if (permission === "default") {
    return (
      <button
        onClick={() => Notification.requestPermission().then(setPermission)}
        className="card w-full rounded-lg px-4 py-2 text-left text-sm"
      >
        🔔 Activar notificaciones para avisos de tareas próximas a vencer
      </button>
    );
  }

  return null;
}
