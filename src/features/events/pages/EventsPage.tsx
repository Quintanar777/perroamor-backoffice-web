import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { EventFormDialog } from '@/features/events/components/EventFormDialog'
import { EventStatusBadge } from '@/features/events/components/EventStatusBadge'
import {
  useDeleteEvent,
  useEventsQuery,
} from '@/features/events/hooks/useEvents'
import { formatDateRange } from '@/lib/format'
import type { AppEvent, EventStatus } from '@/lib/types/event'

const PAGE_SIZE = 10
const ALL = '__all__'

type ActiveFilter = 'all' | 'active' | 'inactive'

export default function EventsPage() {
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>(ALL)
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active')

  const filters = {
    page,
    size: PAGE_SIZE,
    status: statusFilter === ALL ? undefined : (statusFilter as EventStatus),
    isActive:
      activeFilter === 'all'
        ? undefined
        : activeFilter === 'active'
          ? true
          : false,
  }

  const eventsQuery = useEventsQuery(filters)
  const deleteEvent = useDeleteEvent()

  const [editing, setEditing] = useState<AppEvent | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<AppEvent | null>(null)

  const formOpen = creating || editing !== null
  const closeForm = () => {
    setCreating(false)
    setEditing(null)
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteEvent.mutateAsync(deleting)
      setDeleting(null)
    } catch {
      // toast handled
    }
  }

  const events = eventsQuery.data?.content ?? []
  const totalElements = eventsQuery.data?.totalElements ?? 0
  const totalPages = eventsQuery.data?.totalPages ?? 0
  const noFilters = statusFilter === ALL && activeFilter === 'active'
  const showEmpty =
    !eventsQuery.isLoading && events.length === 0 && noFilters

  const columns: DataTableColumn<AppEvent>[] = [
    {
      key: 'name',
      header: 'Nombre',
      cell: (e) => (
        <div className="flex flex-col">
          <span className="font-medium">{e.name}</span>
          {e.description && (
            <span className="text-muted-foreground line-clamp-1 text-xs">
              {e.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Lugar',
      cell: (e) => <span className="text-muted-foreground">{e.location}</span>,
    },
    {
      key: 'dates',
      header: 'Fechas',
      headerClassName: 'w-56',
      cell: (e) => (
        <div className="flex flex-col">
          <span className="tabular-nums">
            {formatDateRange(e.startDate, e.endDate)}
          </span>
          <span className="text-muted-foreground text-xs">
            {e.durationDays} {e.durationDays === 1 ? 'día' : 'días'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      headerClassName: 'w-32',
      cell: (e) => <EventStatusBadge status={e.status} />,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Acciones</span>,
      headerClassName: 'w-24 text-right',
      className: 'text-right',
      cell: (e) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Editar ${e.name}`}
            onClick={() => setEditing(e)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Eliminar ${e.name}`}
            onClick={() => setDeleting(e)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eventos"
        description="Expos, ferias y pop-ups donde Perro Amor vende."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Nuevo evento
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v)
            setPage(0)
          }}
        >
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los estados</SelectItem>
            <SelectItem value="UPCOMING">Próximos</SelectItem>
            <SelectItem value="IN_PROGRESS">En curso</SelectItem>
            <SelectItem value="FINISHED">Finalizados</SelectItem>
          </SelectContent>
        </Select>

        <ToggleGroup
          type="single"
          value={activeFilter}
          onValueChange={(v) => {
            if (!v) return
            setActiveFilter(v as ActiveFilter)
            setPage(0)
          }}
          variant="outline"
        >
          <ToggleGroupItem value="active">Activos</ToggleGroupItem>
          <ToggleGroupItem value="inactive">Inactivos</ToggleGroupItem>
          <ToggleGroupItem value="all">Todos</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {showEmpty ? (
        <EmptyState
          icon={<span className="text-4xl">📅</span>}
          title="Aún no hay eventos"
          description="Creá el primero para empezar a registrar ventas asociadas."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Nuevo evento
            </Button>
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={events}
            rowKey={(e) => e.id}
            loading={eventsQuery.isLoading}
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

      <EventFormDialog
        open={formOpen}
        onOpenChange={(open) => (open ? null : closeForm())}
        event={editing}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Eliminar "${deleting?.name ?? ''}"?`}
        description="El evento se desactiva (soft delete). Las ventas asociadas se conservan."
        confirmLabel="Eliminar"
        destructive
        loading={deleteEvent.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
