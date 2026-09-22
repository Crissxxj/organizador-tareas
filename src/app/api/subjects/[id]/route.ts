import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOwnedSubject(subjectId: string, userId: string) {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject || subject.userId !== userId) return null;
  return subject;
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
  const existing = await getOwnedSubject(params.id, userId);
  if (!existing) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json();

  try {
    const subject = await prisma.subject.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
        ...(body.color !== undefined ? { color: body.color } : {}),
        ...(body.icon !== undefined ? { icon: body.icon } : {}),
        ...(body.professor !== undefined
          ? { professor: body.professor?.trim() || null }
          : {}),
      },
    });
    return NextResponse.json(subject);
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

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const existing = await getOwnedSubject(params.id, userId);
  if (!existing) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  // Las tareas de esta materia no se borran: simplemente se quedan sin
  // materia asignada (subjectId => null), gracias a onDelete: SetNull.
  await prisma.subject.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
