import { Fragment, useState } from 'react'
import { ChevronDown, ChevronRight, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import { DatePicker } from '@/components/shared/DatePicker'
import { EmptyState } from '@/components/shared/EmptyState'
import { Money } from '@/components/shared/Money'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { SaleStatusBadge } from '@/features/sales/components/SaleStatusBadge'
import { useEventsQuery } from '@/features/events/hooks/useEvents'
import { useSalesQuery } from '@/features/sales/hooks/useSales'
import { formatDateTime } from '@/lib/format'
import {
  PAYMENT_METHOD_LABEL,
  type PaymentMethod,
  type Sale,
  type SaleItem,
} from '@/lib/types/sale'

const PAGE_SIZE = 10
const ALL = '__all__'
const COL_COUNT = 8

type CancelFilter = 'all' | 'active' | 'cancelled'

function itemLabel(item: SaleItem): string {
  if (item.comboName) return item.comboName
  const parts = [item.productName ?? '—']
  if (item.variantName) parts.push(item.variantName)
  return parts.join(' · ')
}

function SaleItemsDetail({ items }: { items: SaleItem[] }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((it) => (
        <li key={it.id} className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{itemLabel(it)}</span>
            {it.personalization && (
              <span className="text-muted-foreground text-xs">{it.personalization}</span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-4 tabular-nums">
            <span className="text-muted-foreground">× {it.quantity}</span>
            <span className="w-20 text-right"><Money value={it.lineTotal} /></span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function SalesPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(0)
  const [eventId, setEventId] = useState<string>(ALL)
  const [paymentMethod, setPaymentMethod] = useState<string>(ALL)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [cancelFilter, setCancelFilter] = useState<CancelFilter>('active')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const filters = {
    page,
    size: PAGE_SIZE,
    eventId: eventId === ALL ? undefined : Number(eventId),
    paymentMethod:
      paymentMethod === ALL ? undefined : (paymentMethod as PaymentMethod),
    startDate: startDate.length > 0 ? startDate : undefined,
    endDate: endDate.length > 0 ? endDate : undefined,
    isCancelled:
      cancelFilter === 'all'
        ? undefined
        : cancelFilter === 'cancelled'
          ? true
          : false,
  }

  const salesQuery = useSalesQuery(filters)
  const eventsQuery = useEventsQuery({ size: 100 })

  const resetPage = () => {
    setPage(0)
    setExpandedId(null)
  }

  const sales = salesQuery.data?.content ?? []
  const totalElements = salesQuery.data?.totalElements ?? 0
  const totalPages = salesQuery.data?.totalPages ?? 0
  const noFilters =
    eventId === ALL &&
    paymentMethod === ALL &&
    startDate.length === 0 &&
    endDate.length === 0 &&
    cancelFilter === 'active'
  const showEmpty =
    !salesQuery.isLoading && sales.length === 0 && noFilters

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ventas"
        description="Historial de ventas registradas con filtros."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Select
          value={eventId}
          onValueChange={(v) => {
            setEventId(v)
            resetPage()
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los eventos</SelectItem>
            {(eventsQuery.data?.content ?? []).map((e) => (
              <SelectItem key={e.id} value={String(e.id)}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={paymentMethod}
          onValueChange={(v) => {
            setPaymentMethod(v)
            resetPage()
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Método de pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los métodos</SelectItem>
            <SelectItem value="CASH">Efectivo</SelectItem>
            <SelectItem value="CARD">Tarjeta</SelectItem>
            <SelectItem value="TRANSFER">Transferencia</SelectItem>
          </SelectContent>
        </Select>

        <DatePicker
          value={startDate}
          onChange={(v) => {
            setStartDate(v)
            resetPage()
          }}
          placeholder="Desde"
        />

        <DatePicker
          value={endDate}
          onChange={(v) => {
            setEndDate(v)
            resetPage()
          }}
          placeholder="Hasta"
        />
      </div>

      <ToggleGroup
        type="single"
        value={cancelFilter}
        onValueChange={(v) => {
          if (!v) return
          setCancelFilter(v as CancelFilter)
          resetPage()
        }}
        variant="outline"
      >
        <ToggleGroupItem value="active">Activas</ToggleGroupItem>
        <ToggleGroupItem value="cancelled">Canceladas</ToggleGroupItem>
        <ToggleGroupItem value="all">Todas</ToggleGroupItem>
      </ToggleGroup>

      {showEmpty ? (
        <EmptyState
          icon={<span className="text-4xl">🧾</span>}
          title="Aún no hay ventas"
          description="Registra una venta desde el POS para empezar a verlas aquí."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead className="w-44">Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="w-20 text-right">Items</TableHead>
                  <TableHead className="w-28 text-right">Total</TableHead>
                  <TableHead className="w-32">Pago</TableHead>
                  <TableHead className="w-24">Estado</TableHead>
                  <TableHead className="w-16 text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesQuery.isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={`s-${idx}`}>
                      {Array.from({ length: COL_COUNT + 1 }).map((__, i) => (
                        <TableCell key={i}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={COL_COUNT + 1} className="h-24 text-center">
                      <span className="text-muted-foreground text-sm">Sin resultados.</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((s: Sale) => {
                    const expanded = expandedId === s.id
                    return (
                      <Fragment key={s.id}>
                        <TableRow>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={expanded ? `Contraer venta #${s.id}` : `Expandir venta #${s.id}`}
                              onClick={() => setExpandedId(expanded ? null : s.id)}
                            >
                              {expanded ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground tabular-nums">#{s.id}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground tabular-nums">
                              {formatDateTime(s.saleDate)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {s.customerName ?? <span className="text-muted-foreground italic">—</span>}
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {s.items.reduce((acc, it) => acc + it.quantity, 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Money value={s.totalAmount} />
                          </TableCell>
                          <TableCell>{PAYMENT_METHOD_LABEL[s.paymentMethod]}</TableCell>
                          <TableCell>
                            <SaleStatusBadge isCancelled={s.isCancelled} isPaid={s.isPaid} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Ver venta #${s.id}`}
                              onClick={() => navigate(`/sales/${s.id}`)}
                            >
                              <Eye className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expanded && (
                          <TableRow className="bg-muted/40">
                            <TableCell colSpan={COL_COUNT + 1} className="px-12 py-4">
                              <SaleItemsDetail items={s.items} />
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
