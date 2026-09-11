import type { CartItem } from '@/features/sales/store'
import type { SaleItemInput } from '@/lib/types/sale'

// An explicit unitPrice is a full override the backend honors verbatim.
// Omitting it lets the backend price the line (matching a discount, or
// applying the wholesale/retail rate) — only send it when the vendor
// manually edited the line away from what the server would compute.
//
// Shared by checkout (useCreateSale via NewSalePage) and the live quote
// preview (useSaleQuote) so the two requests can never diverge in how they
// build a line's payload.
export function buildItemPayload(item: CartItem, isWholesale: boolean): SaleItemInput {
  const expectedPrice =
    item.discountedPrice ?? (isWholesale ? item.wholesalePrice : item.originalPrice)
  const manuallyEdited = item.unitPrice !== expectedPrice
  return {
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
    unitPrice: manuallyEdited ? item.unitPrice : undefined,
    personalization: item.personalization ?? undefined,
  }
}
