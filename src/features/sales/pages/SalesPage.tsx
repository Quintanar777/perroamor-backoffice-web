import { Fragment, useEffect, useState } from 'react'
import { Banknote, ChevronDown, ChevronRight, CreditCard, Eye, Smartphone, Wallet } from 'lucide-react'
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
import { EmptyState } from '@/components/shared/EmptyState'
import { Money } from '@/components/shared/Money'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { SaleStatusBadge } from '@/features/sales/components/SaleStatusBadge'
import { useEventsQuery } from '@/features/events/hooks/useEvents'
import { useSalesQuery, useSaleStatsQuery } from '@/features/sales/hooks/useSales'
import { formatDate, formatDateTime } from '@/lib/format'
import {
  PAYMENT_METHOD_LABEL,
  type PaymentMethod,
  type Sale,
  type SaleItem,
  type SaleStatsFilters,
} from '@/lib/types/sale'
import type { AppEvent } from '@/lib/types/event'

const PAGE_SIZE = 10
const ALL = '__all__'
const COL_COUNT = 8

type CancelFilter = 'all' | 'active' | 'cancelled'

const METHOD_ICONS: Record<PaymentMethod, typeof Banknote> = {
  CASH: Banknote,
  CARD: CreditCard,
  MP_NATHALY: Smartphone,
  TRANSFER: Wallet,
}

function enumerateEventDays(event: AppEvent): string[] {
  const days: string[] = []
  const [sy, sm, sd] = event.startDate.split('-').map(Number)
  const [ey, em, ed] = event.endDate.split('-').map(Number)
  const cur = new Date(sy, sm - 1, sd)
  const end = new Date(ey, em - 1, ed)
  while (cur <= end) {
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    const d = String(cur.getDate()).padStart(2, '0')
    days.push(`${y}-${m}-${d}`)
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

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

function StatsSummary({ filters }: { filters: SaleStatsFilters }) {
  const statsQuery = useSaleStatsQuery(filters)

  if (statsQuery.isLoading) {
    return (
      <div className="bg-muted/40 rounded-lg border p-4">
        <Skeleton className="h-5 w-48" />
      </div>
    )
  }

  const stats = statsQuery.data
  if (!stats) return null

  return (
    <div className="bg-muted/40 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tabular-nums">
            <Money value={stats.totalAmount} />
          </span>
          <span className="text-muted-foreground text-sm">
            · {stats.totalSales} {stats.totalSales === 1 ? 'venta' : 'ventas'}
          </span>
        </div>

        {stats.byPaymentMethod.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stats.byPaymentMethod.map((row) => {
              const Icon = METHOD_ICONS[row.paymentMethod]
              return (
                <div
                  key={row.paymentMethod}
                  className="bg-background flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm"
                >
                  <Icon className="text-muted-foreground size-3.5" />
                  <span className="font-medium">{PAYMENT_METHOD_LABEL[row.paymentMethod]}</span>
                  <span className="text-muted-foreground tabular-nums">
                    <Money value={row.amount} />
                  </span>
                  <span className="text-muted-foreground tabular-nums text-xs">({row.count})</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SalesPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(0)
  const [eventId, setEventId] = useState<string>(ALL)
  const [paymentMethod, setPaymentMethod] = useState<string>(ALL)
  const [selectedDay, setSelectedDay] = useState<string>(ALL)
  const [cancelFilter, setCancelFilter] = useState<CancelFilter>('active')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const eventsQuery = useEventsQuery({ size: 100 })
  const events = eventsQuery.data?.content ?? []

  // Auto-select: prefer IN_PROGRESS event, else first in list
  useEffect(() => {
    if (events.length === 0 || eventId !== ALL) return
    const current = events.find((e) => e.status === 'IN_PROGRESS') ?? events[0]
    if (current) setEventId(String(current.id))
  }, [events])  // eslint-disable-line react-hooks/exhaustive-deps

  const selectedEvent = events.find((e) => String(e.id) === eventId) ?? null
  const eventDays = selectedEvent ? enumerateEventDays(selectedEvent) : []

  const isCancelled =
    cancelFilter === 'all' ? undefined : cancelFilter === 'cancelled' ? true : false

  const from = selectedDay !== ALL ? `${selectedDay}T00:00:00` : undefined
  const to = selectedDay !== ALL ? `${selectedDay}T23:59:59` : undefined

  const listFilters = {
    page,
    size: PAGE_SIZE,
    eventId: eventId === ALL ? undefined : Number(eventId),
    paymentMethod: paymentMethod === ALL ? undefined : (paymentMethod as PaymentMethod),
    isCancelled,
    from,
    to,
  }

  const statsFilters: SaleStatsFilters | null =
    eventId !== ALL
      ? {
          eventId: Number(eventId),
          from,
          to,
          paymentMethod: paymentMethod === ALL ? undefined : (paymentMethod as PaymentMethod),
          isCancelled,
        }
      : null

  const salesQuery = useSalesQuery(listFilters)

  const resetPage = () => {
    setPage(0)
    setExpandedId(null)
  }

  // Reset day selector when event changes
  const handleEventChange = (v: string) => {
    setEventId(v)
    setSelectedDay(ALL)
    resetPage()
  }

  const sales = salesQuery.data?.content ?? []
  const totalElements = salesQuery.data?.totalElements ?? 0
  const totalPages = salesQuery.data?.totalPages ?? 0
  const noFilters =
    eventId === ALL &&
    paymentMethod === ALL &&
    selectedDay === ALL &&
    cancelFilter === 'active'
  const showEmpty = !salesQuery.isLoading && sales.length === 0 && noFilters

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ventas"
        description="Historial de ventas registradas con filtros."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Select value={eventId} onValueChange={handleEventChange}>
          <SelectTrigger>
            <SelectValue placeholder="Evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los eventos</SelectItem>
            {events.map((e) => (
              <SelectItem key={e.id} value={String(e.id)}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={paymentMethod}
          onValueChange={(v) => { setPaymentMethod(v); resetPage() }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Método de pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los métodos</SelectItem>
            <SelectItem value="CASH">Efectivo</SelectItem>
            <SelectItem value="CARD">Tarjeta (Terminal)</SelectItem>
            <SelectItem value="MP_NATHALY">MP Nathaly</SelectItem>
            <SelectItem value="TRANSFER">Transferencia</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedDay}
          onValueChange={(v) => { setSelectedDay(v); resetPage() }}
          disabled={eventDays.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Día del evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los días</SelectItem>
            {eventDays.map((d) => (
              <SelectItem key={d} value={d}>
                {formatDate(d)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ToggleGroup
          type="single"
          value={cancelFilter}
          onValueChange={(v) => {
            if (!v) return
            setCancelFilter(v as CancelFilter)
            resetPage()
          }}
          variant="outline"
          className="justify-start"
        >
          <ToggleGroupItem value="active">Activas</ToggleGroupItem>
          <ToggleGroupItem value="cancelled">Canceladas</ToggleGroupItem>
          <ToggleGroupItem value="all">Todas</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {statsFilters && <StatsSummary filters={statsFilters} />}

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
