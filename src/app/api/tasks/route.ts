import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const subjectId = searchParams.get("subjectId");

  const tasks = await prisma.task.findMany({
    where: {
      userId: (session.user as { id: string }).id,
      ...(status ? { status: status as "PENDING" | "IN_PROGRESS" | "DONE" } : {}),
      ...(subjectId ? { subjectId } : {}),
    },
    orderBy: { endDate: "asc" },
    include: { subject: true },
  });

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.title || !body.endDate) {
    return NextResponse.json(
      { error: "Título y fecha de finalización son obligatorios" },
      { status: 400 }
    );
  }

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description || null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: new Date(body.endDate),
      priority: body.priority || "MEDIUM",
      subjectId: body.subjectId || null,
      reminderMinutesBefore:
        typeof body.reminderMinutesBefore === "number"
          ? body.reminderMinutesBefore
          : 60,
      source: body.source || "manual",
      sourceUrl: body.sourceUrl || null,
      userId: (session.user as { id: string }).id,
    },
    include: { subject: true },
  });

  return NextResponse.json(task, { status: 201 });
}
