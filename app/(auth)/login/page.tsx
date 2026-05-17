import type { Metadata } from "next"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Entrar",
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-brand-navy tracking-tight">
          ADMIA
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Plataforma de Governança Administrativa
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
