import { useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Money } from '@/components/shared/Money'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { DiscountFormDialog } from '@/features/discounts/components/DiscountFormDialog'
import {
  useDeleteDiscount,
  useDiscountsQuery,
} from '@/features/discounts/hooks/useDiscounts'
import { useAuthStore } from '@/lib/auth/store'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import type { Discount } from '@/lib/types/discount'

const PAGE_SIZE = 10

type ActiveFilter = 'all' | 'active' | 'inactive'

export default function DiscountsPage() {
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active')
  const search = useDebouncedValue(searchInput, 300)

  // DELETE /discounts/{id} is ADMIN-only server-side; hide/disable the
  // action for MANAGER even though MANAGER can otherwise reach this page.
  const role = useAuthStore((s) => s.user?.role)
  const canDelete = role === 'ADMIN'

  const filters = {
    page,
    size: PAGE_SIZE,
    q: search.trim().length > 0 ? search.trim() : undefined,
    isActive:
      activeFilter === 'all'
        ? undefined
        : activeFilter === 'active'
          ? true
          : false,
  }

  const discountsQuery = useDiscountsQuery(filters)
  const deleteDiscount = useDeleteDiscount()

  const [editing, setEditing] = useState<Discount | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Discount | null>(null)

  const formOpen = creating || editing !== null
  const closeForm = () => {
    setCreating(false)
    setEditing(null)
  }

  const resetPage = () => setPage(0)

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteDiscount.mutateAsync(deleting)
      setDeleting(null)
    } catch {
      // toast handled in hook
    }
  }

  const discounts = discountsQuery.data?.content ?? []
  const totalElements = discountsQuery.data?.totalElements ?? 0
  const totalPages = discountsQuery.data?.totalPages ?? 0
  const noFilters = search.trim().length === 0 && activeFilter === 'active'
  const showEmpty = !discountsQuery.isLoading && discounts.length === 0 && noFilters

  return (
    <div className="space-y-6">
      <PageHeader
        title="Descuentos"
        description="Combinaciones de productos con un precio final fijo, aplicadas automáticamente al armar una venta."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Nuevo descuento
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_auto]">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              resetPage()
            }}
            placeholder="Buscar por nombre..."
            className="pl-9"
          />
        </div>

        <ToggleGroup
          type="single"
          value={activeFilter}
          onValueChange={(v) => {
            if (!v) return
            setActiveFilter(v as ActiveFilter)
            resetPage()
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
          icon={<span className="text-4xl">🏷️</span>}
          title="Aún no hay descuentos"
          description="Creá el primero combinando productos existentes."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Nuevo descuento
            </Button>
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-28 text-right">Precio</TableHead>
                  <TableHead className="w-24 text-right">Slots</TableHead>
                  <TableHead className="w-24">Estado</TableHead>
                  <TableHead className="w-24 text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discountsQuery.isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={`s-${idx}`}>
                      {Array.from({ length: 5 }).map((__, i) => (
                        <TableCell key={i}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : discounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <span className="text-muted-foreground text-sm">
                        Sin resultados.
                      </span>
                    </TableCell>
                  </TableRow>
                ) : (
                  discounts.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{d.name}</span>
                          {d.description && (
                            <span className="text-muted-foreground line-clamp-1 text-xs">
                              {d.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Money value={d.totalPrice} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {d.slots.length}
                      </TableCell>
                      <TableCell>
                        <Badge variant={d.isActive ? 'default' : 'secondary'}>
                          {d.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Editar ${d.name}`}
                            onClick={() => setEditing(d)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Eliminar ${d.name}`}
                              onClick={() => setDeleting(d)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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

      <DiscountFormDialog
        open={formOpen}
        onOpenChange={(open) => (open ? null : closeForm())}
        discount={editing}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Eliminar "${deleting?.name ?? ''}"?`}
        description="El descuento se desactiva (soft delete) y deja de aplicarse a nuevas ventas."
        confirmLabel="Eliminar"
        destructive
        loading={deleteDiscount.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
