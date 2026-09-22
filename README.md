# Organizador de Tareas

App personal para organizar tareas con fecha de inicio/fin, recordatorios,
vista de lista, Kanban y calendario, más integración con GitHub (importar
issues asignados como tareas). Hecha con Next.js 14, TypeScript, Tailwind,
Prisma + PostgreSQL y NextAuth (login con GitHub).

## 1. Requisitos previos

- Node.js 18 o superior instalado.
- Una base de datos PostgreSQL. La forma más rápida y gratuita es crear una
  en [Neon](https://neon.tech) o [Supabase](https://supabase.com) — ambos
  dan un plan gratuito y una cadena de conexión lista para copiar.
- Una cuenta de GitHub (para crear la OAuth App).

## 2. Crear la base de datos

1. Crea un proyecto en Neon o Supabase.
2. Copia la cadena de conexión (connection string), algo como:
   `postgresql://usuario:password@host/basededatos?sslmode=require`

## 3. Crear la OAuth App de GitHub

1. Ve a <https://github.com/settings/developers> → **New OAuth App**.
2. Rellena:
   - **Application name**: Organizador de Tareas (o el que quieras)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Al crearla, copia el **Client ID** y genera un **Client Secret**.

> Nota: el scope pedido por defecto es `read:user repo`, para poder leer
> también issues de repos privados. Si prefieres que la app solo vea
> repos públicos, cambia la línea `scope` en `src/lib/auth.ts` por
> `"read:user public_repo"`.

## 4. Configurar variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

Para generar `NEXTAUTH_SECRET`:

- En Mac/Linux: `openssl rand -base64 32`
- En Windows (PowerShell): `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`

## 5. Instalar dependencias y preparar la base de datos

```bash
npm install
npx prisma migrate dev --name init
```

Esto crea todas las tablas (usuarios, sesiones, tareas, materias) en tu base
de datos. Si ya tenías la base de datos creada de antes (sin materias),
`prisma migrate dev` va a pedirte aplicar la migración `add_subjects`, que de
paso convierte automáticamente cualquier categoría de texto que ya tuvieras
en tareas antiguas en materias reales, sin perder datos.

## 6. Levantar la app

```bash
npm run dev
```

Abre <http://localhost:3000>, entra con "Iniciar sesión con GitHub" y ya
puedes empezar a agregar tareas.

## Estructura del proyecto

```
src/
  app/
    api/            → rutas de API (tareas, categorías, issues de GitHub, auth)
    dashboard/       → lista, kanban, calendario, ajustes (protegidas por login)
    login/           → pantalla de login con GitHub
  components/        → TaskCard, TaskForm, Navbar, ReminderWatcher, etc.
  lib/                → prisma.ts (cliente de base de datos), auth.ts (NextAuth)
  types/              → tipos compartidos de TypeScript
prisma/schema.prisma  → modelos de base de datos
public/manifest.json  → configuración de PWA (para poder "instalar" la app)
public/sw.js           → service worker mínimo (hace la app instalable)
```

## Funcionalidades incluidas

- **Materias**: crea tus materias con nombre, color, ícono y profesor opcional,
y clasifica cada tarea en una de ellas (desde el propio formulario de tarea,
con alta rápida sin salir de él). La vista de Lista y Kanban muestran un
resumen por materia con barra de progreso y filtro rápido. Se gestionan desde
**Ajustes**.
- Tareas con fecha de inicio, fecha de finalización, prioridad, materia y estado.
- Recordatorios configurables (15 min a 2 días antes) vía notificaciones del navegador,
  mientras la app esté abierta en una pestaña.
- Tres vistas: **Lista** (con filtros), **Kanban** (Pendiente/En progreso/Hecha) y
  **Calendario** mensual.
- Login con GitHub y opción de **importar issues asignados** como tareas.
- Modo oscuro/claro con preferencia guardada.
- Instalable como PWA (ícono en escritorio, se abre en su propia ventana).

## Próximos pasos sugeridos (no incluidos todavía)

- Reemplazar los íconos de `public/icons/` (agrega tus propios `icon-192.png`
  y `icon-512.png`; ahora mismo esa carpeta está vacía).
- Notificaciones aunque la app esté cerrada (requeriría Web Push + un
  servidor de notificaciones, es un paso más avanzado).
- Drag and drop en el Kanban (hoy el cambio de estado es con un selector).
- Desplegar en Render, igual que hiciste con Papel & Tinta: sube el repo a
  GitHub, conéctalo en Render, agrega las mismas variables de entorno
  (actualizando `NEXTAUTH_URL` y la Authorization callback URL de GitHub a
  tu dominio de producción).
