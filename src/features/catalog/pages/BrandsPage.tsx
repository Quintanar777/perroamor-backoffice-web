import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { BrandFormDialog } from '@/features/catalog/components/BrandFormDialog'
import { useBrandsQuery, useDeleteBrand } from '@/features/catalog/hooks/useBrands'
import { formatDateTime } from '@/lib/format'
import type { Brand } from '@/lib/types/catalog'

export default function BrandsPage() {
  const brandsQuery = useBrandsQuery()
  const deleteBrand = useDeleteBrand()

  const [editing, setEditing] = useState<Brand | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Brand | null>(null)

  const formOpen = creating || editing !== null
  const closeForm = () => {
    setCreating(false)
    setEditing(null)
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteBrand.mutateAsync(deleting)
      setDeleting(null)
    } catch {
      // toast handled by mutation; keep dialog open for retry
    }
  }

  const columns: DataTableColumn<Brand>[] = [
    {
      key: 'name',
      header: 'Nombre',
      cell: (b) => <span className="font-medium">{b.name}</span>,
    },
    {
      key: 'color',
      header: 'Color',
      headerClassName: 'w-32',
      cell: (b) =>
        b.baseColor ? (
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-4 rounded-sm border"
              style={{ backgroundColor: b.baseColor }}
            />
            <span className="text-muted-foreground tabular-nums text-xs">
              {b.baseColor.toUpperCase()}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'description',
      header: 'Descripción',
      cell: (b) => (
        <span className="text-muted-foreground line-clamp-1">{b.description ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      headerClassName: 'w-28',
      cell: (b) => (
        <Badge variant={b.isActive ? 'default' : 'secondary'}>
          {b.isActive ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Creada',
      headerClassName: 'w-44',
      cell: (b) => (
        <span className="text-muted-foreground tabular-nums">
          {formatDateTime(b.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Acciones</span>,
      headerClassName: 'w-28 text-right',
      className: 'text-right',
      cell: (b) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Editar ${b.name}`}
            onClick={() => setEditing(b)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Eliminar ${b.name}`}
            onClick={() => setDeleting(b)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ]

  const data = brandsQuery.data ?? []
  const isEmpty = !brandsQuery.isLoading && data.length === 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marcas"
        description="Perro Amor, Perra Madre y otras marcas del catálogo."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Nueva marca
          </Button>
        }
      />

      {isEmpty ? (
        <EmptyState
          icon={<span className="text-4xl">🏷️</span>}
          title="Todavía no hay marcas"
          description="Creá la primera para empezar a cargar productos."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Nueva marca
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          rowKey={(b) => b.id}
          loading={brandsQuery.isLoading}
        />
      )}

      <BrandFormDialog
        open={formOpen}
        onOpenChange={(open) => (open ? null : closeForm())}
        brand={editing}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Eliminar "${deleting?.name ?? ''}"?`}
        description="La marca dejará de estar disponible para nuevos productos. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        loading={deleteBrand.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
