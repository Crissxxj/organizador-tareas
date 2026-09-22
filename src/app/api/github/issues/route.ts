import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface GithubApiIssue {
  id: number;
  title: string;
  html_url: string;
  repository_url: string;
  pull_request?: unknown;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as { accessToken?: string | null } | null)
    ?.accessToken;

  if (!session?.user || !accessToken) {
    return NextResponse.json(
      { error: "No hay una sesión de GitHub válida. Vuelve a iniciar sesión." },
      { status: 401 }
    );
  }

  const res = await fetch(
    "https://api.github.com/issues?filter=assigned&state=open&per_page=30",
    {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
      // Evita cachear resultados desactualizados de issues
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "No se pudo consultar la API de GitHub" },
      { status: res.status }
    );
  }

  const data: GithubApiIssue[] = await res.json();

  const issues = data
    .filter((issue) => !issue.pull_request) // solo issues, no PRs
    .map((issue) => ({
      id: issue.id,
      title: issue.title,
      html_url: issue.html_url,
      repository: issue.repository_url.replace(
        "https://api.github.com/repos/",
        ""
      ),
    }));

  return NextResponse.json(issues);
}
