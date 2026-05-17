import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db/client"
import { verifyPassword } from "@/lib/crypto/hash"
import { loginSchema } from "@/lib/validation/auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findFirst({
          where: {
            email: parsed.data.email,
            deleted_at: null,
            active: true,
          },
          include: {
            user_roles: {
              include: { role: true },
            },
          },
        })

        if (!user) return null

        const valid = await verifyPassword(
          parsed.data.password,
          user.password_hash
        )
        if (!valid) return null

        await prisma.user.update({
          where: { id: user.id },
          data: { last_login_at: new Date() },
        })

        const role = user.user_roles[0]?.role.name ?? "READONLY"

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role: string }).role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
})
