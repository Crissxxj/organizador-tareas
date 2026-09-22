import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const subjects = await prisma.subject.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      tasks: {
        select: { status: true, endDate: true },
      },
    },
  });

  const withStats = subjects.map((subject) => {
    const { tasks, ...rest } = subject;
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    const pending = tasks.filter((t) => t.status !== "DONE").length;
    const nextDue = tasks
      .filter((t) => t.status !== "DONE")
      .map((t) => t.endDate)
      .sort((a, b) => a.getTime() - b.getTime())[0];

    return {
      ...rest,
      taskCount: total,
      doneCount: done,
      pendingCount: pending,
      nextDue: nextDue ?? null,
    };
  });

  return NextResponse.json(withStats);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const body = await request.json();

  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json(
      { error: "El nombre de la materia es obligatorio" },
      { status: 400 }
    );
  }

  try {
    const subject = await prisma.subject.create({
      data: {
        name: String(body.name).trim(),
        color: body.color || "#6366f1",
        icon: body.icon || "📘",
        professor: body.professor?.trim() || null,
        userId,
      },
    });
    return NextResponse.json(subject, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Ya tienes una materia con ese nombre" },
        { status: 409 }
      );
    }
    throw err;
  }
}
