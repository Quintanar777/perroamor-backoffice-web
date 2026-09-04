export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'MP_NATHALY'

export interface SaleItem {
  id: number
  productId: number | null
  productName: string | null
  variantId: number | null
  variantName: string | null
  comboId: number | null
  comboName: string | null
  discountId: number | null
  discountName: string | null
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
  isWholesale: boolean
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
  isWholesale?: boolean
  items: SaleItemInput[]
}

export interface SaleQuoteItem {
  productId: number | null
  productName: string | null
  variantId: number | null
  variantName: string | null
  discountId: number | null
  discountName: string | null
  quantity: number
  unitPrice: number
  personalization: string | null
  lineTotal: number
}

export interface SaleQuote {
  itemsTotal: number
  discountId: number | null
  discountName: string | null
  items: SaleQuoteItem[]
}

export interface SaleQuoteRequest {
  isWholesale?: boolean
  items: SaleItemInput[]
}

export interface SaleFilters {
  page?: number
  size?: number
  eventId?: number
  paymentMethod?: PaymentMethod
  isCancelled?: boolean    // null/omit=all, false=only active, true=only cancelled
  from?: string            // ISO datetime e.g. 2025-05-14T00:00:00
  to?: string
}

export interface SaleStatsFilters {
  eventId: number
  from?: string
  to?: string
  paymentMethod?: PaymentMethod
  isCancelled?: boolean
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
  MP_NATHALY: 'MP Nathaly',
}
