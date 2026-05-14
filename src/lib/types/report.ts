import type { PaymentMethod } from '@/lib/types/sale'

export interface SalesReportVariantRow {
  variantId: number
  variantName: string
  currentStock: number
  totalQuantity: number
  totalRevenue: number
  salesCount: number
}

export interface SalesReportRow {
  brandId: number
  brandName: string
  productId: number
  productName: string
  currentStock: number
  totalQuantity: number
  totalRevenue: number
  salesCount: number
  variants: SalesReportVariantRow[]
}

export interface SalesReportSummary {
  totalSalesCount: number
  totalQuantity: number
  totalRevenue: number
}

export interface SalesReport {
  summary: SalesReportSummary
  rows: SalesReportRow[]
}

export interface SalesReportFilters {
  eventId?: number
  brandId?: number
  productId?: number
  paymentMethod?: PaymentMethod
  startDate?: string
  endDate?: string
}
