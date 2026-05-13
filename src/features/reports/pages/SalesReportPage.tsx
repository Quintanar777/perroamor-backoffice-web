import { useState } from 'react'
import { ChevronDown, ChevronRight, Download, X } from 'lucide-react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePicker } from '@/components/shared/DatePicker'
import { EmptyState } from '@/components/shared/EmptyState'
import { Money } from '@/components/shared/Money'
import { PageHeader } from '@/components/shared/PageHeader'
import { useBrandsQuery } from '@/features/catalog/hooks/useBrands'
import { useSalesReportQuery } from '@/features/reports/hooks/useSalesReport'
import { catalogKeys, productsApi } from '@/lib/api/catalog'
import { downloadSalesReportCsv } from '@/lib/api/reports'
import { ApiError, NetworkError } from '@/lib/types/api'
import type {
  SalesReportFilters,
  SalesReportRow,
  SalesReportVariantRow,
} from '@/lib/types/report'
import type { PaymentMethod } from '@/lib/types/sale'
import { PAYMENT_METHOD_LABEL } from '@/lib/types/sale'
import { cn } from '@/lib/utils'

const ALL = '__all__'

const toDateTimeStart = (date: string) =>
  date.length > 0 ? `${date}T00:00:00` : undefined
const toDateTimeEnd = (date: string) =>
  date.length > 0 ? `${date}T23:59:59` : undefined

export default function SalesReportPage() {
  const [brandId, setBrandId] = useState<string>(ALL)
  const [productId, setProductId] = useState<string>(ALL)
  const [paymentMethod, setPaymentMethod] = useState<string>(ALL)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const brandsQuery = useBrandsQuery()
  const productsQuery = useQuery({
    queryKey: catalogKeys.products({ brandId: Number(brandId), size: 200 }),
    queryFn: () => productsApi.list({ brandId: Number(brandId), size: 200 }),
    enabled: brandId !== ALL,
    placeholderData: keepPreviousData,
  })

  const filters: SalesReportFilters = {
    brandId: brandId !== ALL ? Number(brandId) : undefined,
    productId: productId !== ALL ? Number(productId) : undefined,
    paymentMethod: paymentMethod !== ALL ? (paymentMethod as PaymentMethod) : undefined,
    startDate: toDateTimeStart(startDate),
    endDate: toDateTimeEnd(endDate),
  }

  const reportQuery = useSalesReportQuery(filters)

  const handleBrandChange = (value: string) => {
    setBrandId(value)
    setProductId(ALL)
  }

  const handleReset = () => {
    setBrandId(ALL)
    setProductId(ALL)
    setPaymentMethod(ALL)
    setStartDate('')
    setEndDate('')
  }

  const hasFilters =
    brandId !== ALL ||
    productId !== ALL ||
    paymentMethod !== ALL ||
    startDate.length > 0 ||
    endDate.length > 0

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await downloadSalesReportCsv(filters)
    } catch (err) {
      if (err instanceof NetworkError) {
        toast.error('Sin conexión', { description: 'No se pudo exportar el reporte.' })
      } else if (err instanceof ApiError) {
        toast.error(err.title, { description: err.detail })
      } else {
        toast.error('Error al exportar', { description: 'Intentá de nuevo más tarde.' })
      }
    } finally {
      setIsExporting(false)
    }
  }

  const toggleExpand = (productId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  const report = reportQuery.data
  const rows = report?.rows ?? []
  const summary = report?.summary
  const isLoading = reportQuery.isLoading

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporte de Ventas"
        description="Analiza las ventas por marca, producto y método de pago."
        actions={
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || isLoading || rows.length === 0}
          >
            <Download className="size-4" />
            {isExporting ? 'Exportando…' : 'Exportar CSV'}
          </Button>
        }
      />

      {/* Filters */}
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={brandId} onValueChange={handleBrandChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las marcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas las marcas</SelectItem>
              {(brandsQuery.data ?? [])
                .filter((b) => b.isActive)
                .map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select
            value={productId}
            onValueChange={setProductId}
            disabled={brandId === ALL}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  brandId === ALL ? 'Elige una marca primero' : 'Todos los productos'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos los productos</SelectItem>
              {(productsQuery.data?.content ?? [])
                .filter((p) => p.isActive)
                .map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los métodos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos los métodos</SelectItem>
              <SelectItem value="CASH">{PAYMENT_METHOD_LABEL.CASH}</SelectItem>
              <SelectItem value="CARD">{PAYMENT_METHOD_LABEL.CARD}</SelectItem>
              <SelectItem value="TRANSFER">{PAYMENT_METHOD_LABEL.TRANSFER}</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" onClick={handleReset} className="gap-2">
              <X className="size-4" />
              Limpiar filtros
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DatePicker
            value={startDate}
            onChange={setStartDate}
            placeholder="Desde"
          />
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            placeholder="Hasta"
            fromDate={startDate ? new Date(startDate) : undefined}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Num. Ventas"
          value={summary?.totalSalesCount}
          loading={isLoading}
          format="number"
        />
        <SummaryCard
          title="Unidades vendidas"
          value={summary?.totalQuantity}
          loading={isLoading}
          format="number"
        />
        <SummaryCard
          title="Ingresos totales"
          value={summary?.totalRevenue}
          loading={isLoading}
          format="money"
        />
      </div>

      {/* Table */}
      {!isLoading && rows.length === 0 ? (
        <EmptyState
          icon={<span className="text-4xl">📊</span>}
          title="Sin datos para los filtros aplicados"
          description="Ajustá los filtros o registrá ventas para ver resultados aquí."
        />
      ) : (
        <ReportTable
          rows={rows}
          loading={isLoading}
          expanded={expanded}
          onToggle={toggleExpand}
        />
      )}
    </div>
  )
}

function ReportTable({
  rows,
  loading,
  expanded,
  onToggle,
}: {
  rows: SalesReportRow[]
  loading: boolean
  expanded: Set<number>
  onToggle: (productId: number) => void
}) {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="w-10 px-3 py-3" />
            <th className="px-4 py-3 text-left font-medium">Marca</th>
            <th className="px-4 py-3 text-left font-medium">Producto</th>
            <th className="w-28 px-4 py-3 text-right font-medium">Stock</th>
            <th className="w-28 px-4 py-3 text-right font-medium">Unidades</th>
            <th className="w-36 px-4 py-3 text-right font-medium">Ingresos</th>
            <th className="w-24 px-4 py-3 text-right font-medium">Ventas</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-3 py-3" />
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <ProductRows
                  key={row.productId}
                  row={row}
                  isExpanded={expanded.has(row.productId)}
                  onToggle={() => onToggle(row.productId)}
                />
              ))}
        </tbody>
      </table>
    </div>
  )
}

function ProductRows({
  row,
  isExpanded,
  onToggle,
}: {
  row: SalesReportRow
  isExpanded: boolean
  onToggle: () => void
}) {
  const hasVariants = row.variants.length > 0
  const displayStock = hasVariants
    ? row.variants.reduce((sum, v) => sum + v.currentStock, 0)
    : row.currentStock

  return (
    <>
      <tr
        className={cn(
          'border-b transition-colors',
          hasVariants && 'cursor-pointer hover:bg-muted/40',
          isExpanded && 'bg-muted/20',
        )}
        onClick={hasVariants ? onToggle : undefined}
      >
        <td className="px-3 py-3 text-center text-muted-foreground">
          {hasVariants &&
            (isExpanded ? (
              <ChevronDown className="mx-auto size-4" />
            ) : (
              <ChevronRight className="mx-auto size-4" />
            ))}
        </td>
        <td className="px-4 py-3 font-medium">{row.brandName}</td>
        <td className="px-4 py-3">{row.productName}</td>
        <td className="px-4 py-3 text-right tabular-nums">{displayStock}</td>
        <td className="px-4 py-3 text-right tabular-nums">{row.totalQuantity}</td>
        <td className="px-4 py-3 text-right">
          <Money value={row.totalRevenue} />
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
          {row.salesCount}
        </td>
      </tr>

      {isExpanded &&
        row.variants.map((v) => (
          <VariantRow key={v.variantId} variant={v} />
        ))}
    </>
  )
}

function VariantRow({ variant }: { variant: SalesReportVariantRow }) {
  return (
    <tr className="border-b bg-muted/10 text-muted-foreground">
      <td className="px-3 py-2" />
      <td className="px-4 py-2" />
      <td className="px-4 py-2">
        <span className="flex items-center gap-1.5">
          <span className="text-border select-none">↳</span>
          <span className="text-foreground">{variant.variantName}</span>
        </span>
      </td>
      <td
        className={cn(
          'px-4 py-2 text-right tabular-nums',
          variant.currentStock === 0
            ? 'text-destructive'
            : variant.currentStock <= 3
              ? 'text-orange-500'
              : '',
        )}
      >
        {variant.currentStock}
      </td>
      <td className="px-4 py-2 text-right tabular-nums">{variant.totalQuantity}</td>
      <td className="px-4 py-2 text-right">
        <Money value={variant.totalRevenue} />
      </td>
      <td className="px-4 py-2 text-right tabular-nums">{variant.salesCount}</td>
    </tr>
  )
}

function SummaryCard({
  title,
  value,
  loading,
  format,
}: {
  title: string
  value: number | undefined
  loading: boolean
  format: 'number' | 'money'
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <p className="text-3xl font-bold tabular-nums">
            {format === 'money' ? (
              <Money value={value ?? 0} />
            ) : (
              (value ?? 0).toLocaleString('es-MX')
            )}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
