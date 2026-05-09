const moneyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatMoney = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return moneyFormatter.format(value)
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const dateFormatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })

const parseDateOnly = (iso: string): Date | null => {
  // Treat YYYY-MM-DD as local date to avoid timezone shifts
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  const fallback = new Date(iso)
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

export const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return dateTimeFormatter.format(date)
}

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  const date = parseDateOnly(iso)
  if (!date) return iso
  return dateFormatter.format(date)
}

export const formatDateRange = (
  startIso: string | null | undefined,
  endIso: string | null | undefined,
): string => {
  if (!startIso || !endIso) return formatDate(startIso ?? endIso)
  if (startIso === endIso) return formatDate(startIso)
  return `${formatDate(startIso)} – ${formatDate(endIso)}`
}
