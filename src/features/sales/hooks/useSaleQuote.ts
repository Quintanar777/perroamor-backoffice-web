import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { buildItemPayload } from '@/features/sales/lib/buildItemPayload'
import type { CartItem } from '@/features/sales/store'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import { salesApi } from '@/lib/api/sales'
import type { SaleQuoteRequest } from '@/lib/types/sale'

// Live discount preview for the cart being built — computed by the backend's
// non-persisting POST /sales/quote so the vendor sees, while adding items,
// whether a combo/discount will apply and what the real total will be.
//
// This is advisory only: it must fail silently and never gate checkout.
// Checkout always uses the authoritative createSale response
// (applyServerPricing), independent of what this preview showed.
export function useSaleQuote(items: CartItem[], isWholesale: boolean) {
  // TanStack Query doesn't deep-compare object query keys, so serialize the
  // payload into a stable string for the key (same approach as filter-object
  // query keys elsewhere in this codebase, e.g. catalogKeys.products).
  const payload = useMemo<SaleQuoteRequest>(
    () => ({
      isWholesale,
      items: items.map((item) => buildItemPayload(item, isWholesale)),
    }),
    [items, isWholesale],
  )
  const payloadKey = useMemo(() => JSON.stringify(payload), [payload])
  const debouncedPayloadKey = useDebouncedValue(payloadKey, 300)
  const debouncedPayload = useMemo<SaleQuoteRequest>(
    () => JSON.parse(debouncedPayloadKey) as SaleQuoteRequest,
    [debouncedPayloadKey],
  )

  return useQuery({
    queryKey: ['sales', 'quote', debouncedPayloadKey] as const,
    queryFn: () => salesApi.quote(debouncedPayload),
    enabled: items.length > 0,
    retry: 0,
    staleTime: 0,
  })
}
