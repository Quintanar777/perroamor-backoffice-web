export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER'

export interface SaleItem {
  id: number
  productId: number | null
  variantId: number | null
  comboId: number | null
  comboName: string | null
  quantity: number
  unitPrice: number
  personalization: string | null
  lineTotal: number
}

export interface Sale {
  id: number
  eventId: number
  soldByUserId: number
  soldByUsername: string
  saleDate: string
  paymentMethod: PaymentMethod
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  notes: string | null
  discountAmount: number
  taxAmount: number
  totalAmount: number
  subtotal: number
  isPaid: boolean
  isCancelled: boolean
  cancelledAt: string | null
  createdAt: string
  items: SaleItem[]
}

export interface SaleItemInput {
  productId?: number
  variantId?: number | null
  comboId?: number
  quantity: number
  unitPrice?: number
  personalization?: string | null
}

export interface SaleInput {
  eventId: number
  paymentMethod: PaymentMethod
  customerName?: string | null
  customerPhone?: string | null
  customerEmail?: string | null
  notes?: string | null
  discountAmount?: number
  items: SaleItemInput[]
}

export interface SaleFilters {
  page?: number
  size?: number
  eventId?: number
  paymentMethod?: PaymentMethod
  isCancelled?: boolean
  startDate?: string
  endDate?: string
}

export interface PaymentMethodStat {
  paymentMethod: PaymentMethod
  count: number
  amount: number
}

export interface SaleStats {
  eventId: number
  totalSales: number
  totalAmount: number
  byPaymentMethod: PaymentMethodStat[]
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
}
