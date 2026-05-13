import { create } from 'zustand'

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
}

export interface ComboCartItem {
  kind: 'combo'
  comboId: number
  comboName: string
  unitPrice: number
  originalPrice: number
  quantity: number
  maxStock: number
}

export type CartItem = ProductCartItem | ComboCartItem

export const itemKey = (item: CartItem): string => {
  if (item.kind === 'product') {
    return [
      'product',
      item.productId,
      item.variantId ?? '',
      item.personalization ?? '',
    ].join(':')
  }
  return ['combo', item.comboId].join(':')
}

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
      items: state.items.map((it) => {
        if (it.kind !== 'product') return it
        return { ...it, unitPrice: v ? it.wholesalePrice : it.originalPrice }
      }) as CartItem[],
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

export const selectQuantityForCombo =
  (comboId: number) =>
  (state: CartState): number =>
    state.items.reduce(
      (acc, it) =>
        it.kind === 'combo' && it.comboId === comboId ? acc + it.quantity : acc,
      0,
    )

export const selectIsWholesale = (state: CartState): boolean => state.isWholesale
