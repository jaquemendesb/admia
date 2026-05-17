import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-semibold text-brand-navy">404</h1>
        <p className="text-muted-foreground">Página não encontrada</p>
        <Link
          href="/dashboard"
          className="inline-block text-sm text-brand-navy underline underline-offset-4"
        >
          Voltar ao dashboard
        </Link>
      </div>
    </div>
  )
}
