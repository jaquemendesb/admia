import { auth } from "@/lib/auth/config"
import { can } from "@/lib/rbac/check"
import type { RoleName } from "@/types/rbac"
import { listOffers } from "@/lib/services/offers.service"
import { PageHeader } from "@/components/layout/page-header"
import { OffersClient } from "@/components/commerce/offers-client"

export default async function OffersPage() {
  const session = await auth()
  const role = (session?.user?.role ?? "READONLY") as RoleName
  const offers = await listOffers()

  return (
    <div className="space-y-6">
      <PageHeader title="Ofertas" description="Pacotes e composições de produtos e cursos." />
      <OffersClient
        offers={offers as Parameters<typeof OffersClient>[0]["offers"]}
        canCreate={can(role, "offers", "CREATE")}
        canEdit={can(role, "offers", "UPDATE")}
        canDelete={can(role, "offers", "DELETE")}
      />
    </div>
  )
}
