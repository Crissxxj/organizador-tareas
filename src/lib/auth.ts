import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

// Campos que sí existen en el modelo Account de nuestro schema.prisma.
const ALLOWED_ACCOUNT_FIELDS = [
  "userId",
  "type",
  "provider",
  "providerAccountId",
  "refresh_token",
  "access_token",
  "expires_at",
  "token_type",
  "scope",
  "id_token",
  "session_state",
];

// Envolvemos el adapter de Prisma para filtrar, ANTES de guardar, cualquier
// campo que un provider mande y que nuestra tabla no tenga (por ejemplo,
// GitHub ahora manda `refresh_token_expires_in`, que rompía el insert).
// Esto funciona sin importar si la versión de next-auth instalada soporta
// o no el hook `account()` de cada provider.
function buildAdapter(): Adapter {
  const base = PrismaAdapter(prisma) as Adapter;

  return {
    ...base,
    async linkAccount(account) {
      const sanitized = Object.fromEntries(
        Object.entries(account).filter(([key]) =>
          ALLOWED_ACCOUNT_FIELDS.includes(key)
        )
      );
      return base.linkAccount!(sanitized as typeof account);
    },
  };
}

export const authOptions: NextAuthOptions = {
  adapter: buildAdapter(),
  session: {
    strategy: "database",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      // Arregla el error "issuer must be configured on the issuer": desde
      // abril de 2026 GitHub envía un parámetro `iss` (RFC 9207) que
      // next-auth necesita poder validar contra un issuer explícito.
      issuer: "https://github.com/login/oauth",
      // "repo" te da acceso a issues de repos privados también.
      // Si solo quieres repos públicos, cambia a "read:user public_repo".
      authorization: {
        params: { scope: "read:user repo" },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as { id?: string }).id = user.id;
      }

      // Adjuntamos el access_token de GitHub a la sesión para poder
      // llamar a la API de GitHub desde el servidor.
      const account = await prisma.account.findFirst({
        where: { userId: user.id, provider: "github" },
        select: { access_token: true },
      });

      (session as { accessToken?: string | null }).accessToken =
        account?.access_token ?? null;

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
