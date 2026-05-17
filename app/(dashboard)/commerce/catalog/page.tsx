import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { listCatalogItems } from "@/lib/services/catalog.service"
import { PageHeader } from "@/components/layout/page-header"
import { CatalogClient } from "@/components/commerce/catalog-client"

export default async function CatalogPage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName
  const items = await listCatalogItems()

  return (
    <div className="space-y-6">
      <PageHeader title="Catálogo" description="Produtos, cursos e recursos disponíveis." />
      <CatalogClient
        items={items as Parameters<typeof CatalogClient>[0]["items"]}
        canCreate={can(role, "catalog", "CREATE")}
        canEdit={can(role, "catalog", "UPDATE")}
        canDelete={can(role, "catalog", "DELETE")}
      />
    </div>
  )
}
