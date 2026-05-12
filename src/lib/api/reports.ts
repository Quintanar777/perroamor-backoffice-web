import { apiGet } from '@/lib/api/client'
import { useAuthStore } from '@/lib/auth/store'
import { env } from '@/lib/env'
import type { SalesReport, SalesReportFilters } from '@/lib/types/report'

export const reportsApi = {
  salesReport: (filters: SalesReportFilters): Promise<SalesReport> =>
    apiGet<SalesReport>('/reports/sales', {
      query: filters as Record<string, unknown>,
    }),
}

export const reportsKeys = {
  salesReport: (filters: SalesReportFilters) =>
    ['reports', 'sales', filters] as const,
}

export async function downloadSalesReportCsv(
  filters: SalesReportFilters,
): Promise<void> {
  const token = useAuthStore.getState().accessToken

  const url = new URL(`${env.apiBaseUrl}/reports/sales/export`)
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url.toString(), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) throw new Error('Error al exportar el reporte')

  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)

  const disposition = response.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="([^"]+)"/)
  const filename = match?.[1] ?? 'reporte-ventas.csv'

  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}
