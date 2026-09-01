import { create } from 'zustand'
import type { Sale } from '@/lib/types/sale'

export interface ProductCartItem {
  kind: 'product'
  productId: number
  variantId: number | null
  productName: string
  variantName: string | null
  unitPrice: number
  originalPrice: number   // retail effective price — never changes
  wholesalePrice: number  // wholesale effective price — never changes
  personalization: string | null
  quantity: number
  maxStock: number
  discountId: number | null       // written only by applyServerPricing, after checkout confirms
  discountName: string | null     // written only by applyServerPricing, after checkout confirms
  discountedPrice: number | null  // server-confirmed final price when a discount matched
}

export type CartItem = ProductCartItem

export const itemKey = (item: CartItem): string =>
  [
    'product',
    item.productId,
    item.variantId ?? '',
    item.personalization ?? '',
  ].join(':')

interface CartState {
  items: CartItem[]
  isWholesale: boolean
}

interface CartActions {
  addItem: (item: CartItem) => void
  updateQty: (key: string, qty: number) => void
  updateUnitPrice: (key: string, price: number) => void
  removeItem: (key: string) => void
  clear: () => void
  setWholesale: (v: boolean) => void
  applyServerPricing: (sale: Sale) => void
}

const clampQty = (qty: number, max: number): number => {
  if (!Number.isFinite(qty) || qty < 1) return 1
  if (max > 0 && qty > max) return max
  return Math.floor(qty)
}

export const useCartStore = create<CartState & CartActions>((set) => ({
  items: [],
  isWholesale: false,
  addItem: (incoming) =>
    set((state) => {
      const key = itemKey(incoming)
      const existingIndex = state.items.findIndex((it) => itemKey(it) === key)
      if (existingIndex === -1) {
        return {
          items: [
            ...state.items,
            { ...incoming, quantity: clampQty(incoming.quantity, incoming.maxStock) },
          ],
        }
      }
      const items = state.items.slice()
      const existing = items[existingIndex]
      const merged = {
        ...existing,
        quantity: clampQty(
          existing.quantity + incoming.quantity,
          incoming.maxStock,
        ),
        maxStock: incoming.maxStock,
      } as CartItem
      items[existingIndex] = merged
      return { items }
    }),
  updateQty: (key, qty) =>
    set((state) => ({
      items: state.items.map((it) =>
        itemKey(it) === key
          ? ({ ...it, quantity: clampQty(qty, it.maxStock) } as CartItem)
          : it,
      ),
    })),
  updateUnitPrice: (key, price) =>
    set((state) => ({
      items: state.items.map((it) =>
        itemKey(it) === key
          ? ({
              ...it,
              unitPrice:
                Number.isFinite(price) && price >= 0 ? price : it.unitPrice,
            } as CartItem)
          : it,
      ),
    })),
  removeItem: (key) =>
    set((state) => ({
      items: state.items.filter((it) => itemKey(it) !== key),
    })),
  clear: () => set({ items: [] }),
  setWholesale: (v) =>
    set((state) => ({
      isWholesale: v,
      items: state.items.map((it) => ({
        ...it,
        unitPrice: v ? it.wholesalePrice : it.originalPrice,
      })),
    })),
  applyServerPricing: (sale) =>
    set((state) => ({
      items: state.items.map((it) => {
        const match = sale.items.find(
          (si) =>
            si.productId === it.productId &&
            (si.variantId ?? null) === it.variantId &&
            (si.personalization ?? null) === it.personalization,
        )
        if (!match) return it
        return {
          ...it,
          unitPrice: match.unitPrice,
          discountId: match.discountId,
          discountName: match.discountName,
          discountedPrice: match.discountId !== null ? match.unitPrice : null,
        }
      }),
    })),
}))

export const selectCartTotal = (state: CartState): number =>
  state.items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0)

export const selectCartCount = (state: CartState): number =>
  state.items.reduce((acc, it) => acc + it.quantity, 0)

export const selectQuantityForProduct =
  (productId: number) =>
  (state: CartState): number =>
    state.items.reduce(
      (acc, it) =>
        it.kind === 'product' && it.productId === productId
          ? acc + it.quantity
          : acc,
      0,
    )

export const selectIsWholesale = (state: CartState): boolean => state.isWholesale
