import type { PaymentMethod } from '@/lib/types/sale'

export interface SalesReportRow {
  brandId: number
  brandName: string
  productId: number
  productName: string
  totalQuantity: number
  totalRevenue: number
  salesCount: number
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
  brandId?: number
  productId?: number
  paymentMethod?: PaymentMethod
  startDate?: string
  endDate?: string
}
