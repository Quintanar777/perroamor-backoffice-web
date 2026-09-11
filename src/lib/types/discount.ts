export type DiscountSlotType = 'FIXED' | 'GROUP'

export interface DiscountSlotOption {
  id: number
  productId: number
  productName: string
  finalUnitPrice: number
}

export interface DiscountSlot {
  id: number
  position: number
  slotType: DiscountSlotType
  quantity: number
  options: DiscountSlotOption[]
}

export interface Discount {
  id: number
  name: string
  description: string | null
  totalPrice: number
  isActive: boolean
  createdAt: string
  slots: DiscountSlot[]
}

export interface DiscountSlotOptionInput {
  productId: number
  finalUnitPrice: number
}

export interface DiscountSlotInput {
  position: number
  slotType: DiscountSlotType
  quantity: number
  options: DiscountSlotOptionInput[]
}

export interface DiscountInput {
  name: string
  description?: string | null
  totalPrice: number
  isActive?: boolean
  slots: DiscountSlotInput[]
}

export interface DiscountFilters {
  page?: number
  size?: number
  q?: string
  isActive?: boolean
}
