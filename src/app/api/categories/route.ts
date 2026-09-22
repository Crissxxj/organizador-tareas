import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rows = await prisma.task.findMany({
    where: {
      userId: (session.user as { id: string }).id,
      category: { not: null },
    },
    select: { category: true },
    distinct: ["category"],
  });

  const categories = rows.map((r) => r.category).filter(Boolean);
  return NextResponse.json(categories);
}
