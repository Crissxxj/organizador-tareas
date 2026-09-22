import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOwnedTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.userId !== userId) return null;
  return task;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const existing = await getOwnedTask(params.id, userId);
  if (!existing) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json();

  const task = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.startDate !== undefined
        ? { startDate: body.startDate ? new Date(body.startDate) : null }
        : {}),
      ...(body.endDate !== undefined ? { endDate: new Date(body.endDate) } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(body.subjectId !== undefined ? { subjectId: body.subjectId || null } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.reminderMinutesBefore !== undefined
        ? { reminderMinutesBefore: body.reminderMinutesBefore }
        : {}),
      ...(body.reminderSent !== undefined ? { reminderSent: body.reminderSent } : {}),
    },
    include: { subject: true },
  });

  return NextResponse.json(task);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const existing = await getOwnedTask(params.id, userId);
  if (!existing) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
