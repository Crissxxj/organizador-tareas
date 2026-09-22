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
    <nav className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/80 bg-white/80 px-4 py-3 backdrop-blur dark:border-gray-800/80 dark:bg-[#0d0f14]/80">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-fuchsia-500 text-sm text-white shadow-sm">
            📋
          </span>
          Organizador
        </span>
        <div className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                pathname === link.href
                  ? "bg-brand text-white shadow-sm"
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
          className="rounded-full border border-gray-300 px-3 py-1.5 text-sm transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
