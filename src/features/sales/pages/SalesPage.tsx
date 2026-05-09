import { useState } from 'react'
import { Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
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
} from '@/lib/types/sale'

const PAGE_SIZE = 10
const ALL = '__all__'

type CancelFilter = 'all' | 'active' | 'cancelled'

export default function SalesPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(0)
  const [eventId, setEventId] = useState<string>(ALL)
  const [paymentMethod, setPaymentMethod] = useState<string>(ALL)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [cancelFilter, setCancelFilter] = useState<CancelFilter>('active')

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

  const resetPage = () => setPage(0)

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

  const columns: DataTableColumn<Sale>[] = [
    {
      key: 'id',
      header: 'ID',
      headerClassName: 'w-16',
      cell: (s) => <span className="text-muted-foreground tabular-nums">#{s.id}</span>,
    },
    {
      key: 'date',
      header: 'Fecha',
      headerClassName: 'w-44',
      cell: (s) => (
        <span className="text-muted-foreground tabular-nums">
          {formatDateTime(s.saleDate)}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Cliente',
      cell: (s) => (
        <span className="font-medium">
          {s.customerName ?? <span className="text-muted-foreground italic">—</span>}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      headerClassName: 'w-20 text-right',
      className: 'text-right tabular-nums',
      cell: (s) => s.items.reduce((acc, it) => acc + it.quantity, 0),
    },
    {
      key: 'total',
      header: <span className="block text-right">Total</span>,
      headerClassName: 'w-28 text-right',
      className: 'text-right',
      cell: (s) => <Money value={s.totalAmount} />,
    },
    {
      key: 'payment',
      header: 'Pago',
      headerClassName: 'w-32',
      cell: (s) => PAYMENT_METHOD_LABEL[s.paymentMethod],
    },
    {
      key: 'status',
      header: 'Estado',
      headerClassName: 'w-24',
      cell: (s) => <SaleStatusBadge isCancelled={s.isCancelled} isPaid={s.isPaid} />,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Acciones</span>,
      headerClassName: 'w-16 text-right',
      className: 'text-right',
      cell: (s) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Ver venta #${s.id}`}
          onClick={() => navigate(`/sales/${s.id}`)}
        >
          <Eye className="size-4" />
        </Button>
      ),
    },
  ]

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
          <DataTable
            columns={columns}
            data={sales}
            rowKey={(s) => s.id}
            loading={salesQuery.isLoading}
          />
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
