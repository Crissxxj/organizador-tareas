"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
    >
      {isDark ? "☀️ Claro" : "🌙 Oscuro"}
    </button>
  );
}
