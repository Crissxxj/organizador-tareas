"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/dashboard", label: "Lista" },
  { href: "/dashboard/kanban", label: "Kanban" },
  { href: "/dashboard/calendar", label: "Calendario" },
  { href: "/dashboard/settings", label: "Ajustes" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="card sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
      <div className="flex items-center gap-4">
        <span className="font-bold">📋 Organizador</span>
        <div className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm ${
                pathname === link.href
                  ? "bg-brand text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
