import Link from "next/link"
import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { listAllActivePolicies } from "@/lib/services/contacts.service"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { POLICY_TYPE_LABELS, POLICY_SOURCE_LABELS } from "@/lib/validation/contacts"

export default async function PoliciesPage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName

  if (!can(role, "contact_policies", "VIEW")) {
    return <div className="text-muted-foreground p-8">Sem permissão para visualizar políticas.</div>
  }

  const policies = await listAllActivePolicies()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Políticas de Contato"
        description="Visão global de todas as políticas ativas nos contatos."
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contato</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead>Criada em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma política ativa.
                </TableCell>
              </TableRow>
            )}
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>
                  <Link
                    href={`/contacts/${policy.contact.id}`}
                    className="font-medium hover:underline"
                  >
                    {policy.contact.name ?? policy.contact.phone ?? "—"}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={policy.policy_type === "BLACKLIST" ? "destructive" : policy.policy_type === "WHITELIST" ? "success" : "secondary"}
                  >
                    {POLICY_TYPE_LABELS[policy.policy_type as keyof typeof POLICY_TYPE_LABELS]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {POLICY_SOURCE_LABELS[policy.source_type as keyof typeof POLICY_SOURCE_LABELS]}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground line-clamp-1">{policy.notes ?? "—"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {new Date(policy.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
