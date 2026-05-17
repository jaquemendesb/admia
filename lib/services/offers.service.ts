import { prisma } from "@/lib/db/client"
import type { CreateOfferInput, UpdateOfferInput, AddOfferItemInput } from "@/lib/validation/offers"

export async function listOffers() {
  return prisma.offer.findMany({
    where: { deleted_at: null },
    include: { offer_items: { include: { catalog_item: { select: { id: true, title: true } } } } },
    orderBy: { title: "asc" },
  })
}

export async function getOffer(id: string) {
  return prisma.offer.findFirst({
    where: { id, deleted_at: null },
    include: {
      offer_items: {
        include: { catalog_item: { select: { id: true, title: true, item_type: true } } },
        orderBy: { id: "asc" },
      },
    },
  })
}

export async function createOffer(data: CreateOfferInput) {
  return prisma.offer.create({
    data: {
      ...data,
      base_price: data.base_price != null ? data.base_price : undefined,
      sale_price: data.sale_price != null ? data.sale_price : undefined,
    },
  })
}

export async function updateOffer(id: string, data: UpdateOfferInput) {
  return prisma.offer.update({
    where: { id },
    data: {
      ...data,
      base_price: data.base_price != null ? data.base_price : undefined,
      sale_price: data.sale_price != null ? data.sale_price : undefined,
    },
  })
}

export async function deleteOffer(id: string) {
  return prisma.offer.update({
    where: { id },
    data: { deleted_at: new Date() },
  })
}

export async function addOfferItem(offerId: string, data: AddOfferItemInput) {
  return prisma.offerItem.create({
    data: { offer_id: offerId, ...data },
  })
}

export async function removeOfferItem(offerItemId: string) {
  return prisma.offerItem.delete({ where: { id: offerItemId } })
}
