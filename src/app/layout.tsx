import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Providers } from "./providers";
import { RegisterServiceWorker } from "./register-sw";
import "./globals.css";

export const metadata: Metadata = {
  title: "Organizador de Tareas",
  description: "Organiza tus tareas, fechas y recordatorios en un solo lugar",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
};

// Script inline para aplicar el tema guardado ANTES de pintar la página,
// así se evita el parpadeo de modo claro -> oscuro.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <RegisterServiceWorker />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
