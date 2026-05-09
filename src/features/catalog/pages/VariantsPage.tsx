import { useState } from 'react'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { VariantFormDialog } from '@/features/catalog/components/VariantFormDialog'
import {
  useDeleteVariant,
  useProductQuery,
  useVariantsQuery,
} from '@/features/catalog/hooks/useVariants'
import { formatMoney } from '@/lib/format'
import type { ProductVariant } from '@/lib/types/catalog'

export default function VariantsPage() {
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)

  if (!Number.isFinite(productId) || productId <= 0) {
    return <Navigate to="/products" replace />
  }

  return <VariantsPageInner productId={productId} />
}

function VariantsPageInner({ productId }: { productId: number }) {
  const productQuery = useProductQuery(productId)
  const variantsQuery = useVariantsQuery(productId)
  const deleteVariant = useDeleteVariant(productId)

  const [editing, setEditing] = useState<ProductVariant | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<ProductVariant | null>(null)

  const formOpen = creating || editing !== null
  const closeForm = () => {
    setCreating(false)
    setEditing(null)
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteVariant.mutateAsync(deleting)
      setDeleting(null)
    } catch {
      // toast handled
    }
  }

  const columns: DataTableColumn<ProductVariant>[] = [
    {
      key: 'name',
      header: 'Variante',
      cell: (v) => <span className="font-medium">{v.variantName}</span>,
    },
    {
      key: 'sku',
      header: 'SKU',
      headerClassName: 'w-32',
      cell: (v) => <code className="bg-muted rounded px-2 py-0.5 text-xs">{v.sku}</code>,
    },
    {
      key: 'attrs',
      header: 'Atributos',
      cell: (v) => (
        <div className="flex flex-wrap gap-1">
          {v.color && <Badge variant="outline">{v.color}</Badge>}
          {v.size && <Badge variant="outline">Talla {v.size}</Badge>}
          {v.design && <Badge variant="outline">{v.design}</Badge>}
          {v.material && <Badge variant="outline">{v.material}</Badge>}
        </div>
      ),
    },
    {
      key: 'stock',
      header: <span className="block text-right">Stock</span>,
      headerClassName: 'w-20 text-right',
      className: 'text-right tabular-nums',
      cell: (v) => v.stock,
    },
    {
      key: 'priceAdjustment',
      header: <span className="block text-right">Ajuste</span>,
      headerClassName: 'w-28 text-right',
      className: 'text-right tabular-nums',
      cell: (v) =>
        v.priceAdjustment === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className={v.priceAdjustment < 0 ? 'text-destructive' : ''}>
            {v.priceAdjustment > 0 ? '+' : ''}
            {formatMoney(v.priceAdjustment)}
          </span>
        ),
    },
    {
      key: 'status',
      header: 'Estado',
      headerClassName: 'w-24',
      cell: (v) => (
        <Badge variant={v.isActive ? 'default' : 'secondary'}>
          {v.isActive ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Acciones</span>,
      headerClassName: 'w-24 text-right',
      className: 'text-right',
      cell: (v) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Editar ${v.variantName}`}
            onClick={() => setEditing(v)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Eliminar ${v.variantName}`}
            onClick={() => setDeleting(v)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ]

  const variants = variantsQuery.data ?? []
  const product = productQuery.data

  return (
    <div className="space-y-6">
      <PageHeader
        title={product?.name ?? 'Variantes'}
        description={
          product
            ? `${product.brandName} · ${product.category} · ${formatMoney(product.price)}`
            : 'Gestión de variantes del producto.'
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/products">
                <ArrowLeft className="size-4" />
                Volver
              </Link>
            </Button>
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Nueva variante
            </Button>
          </div>
        }
      />

      {productQuery.isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-64" />
          </CardContent>
        </Card>
      ) : product ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              <Badge variant="outline">{product.brandName}</Badge>
              <span>{product.category}</span>
              <span className="text-muted-foreground">·</span>
              <span>Precio base {formatMoney(product.price)}</span>
            </CardTitle>
          </CardHeader>
          {product.description && (
            <CardContent className="text-muted-foreground text-sm">
              {product.description}
            </CardContent>
          )}
        </Card>
      ) : null}

      {!variantsQuery.isLoading && variants.length === 0 ? (
        <EmptyState
          icon={<span className="text-4xl">🎨</span>}
          title="Este producto no tiene variantes"
          description="Agrega la primera con color, talla, diseño o SKU específico."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Nueva variante
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={variants}
          rowKey={(v) => v.id}
          loading={variantsQuery.isLoading}
        />
      )}

      <VariantFormDialog
        open={formOpen}
        onOpenChange={(open) => (open ? null : closeForm())}
        productId={productId}
        variant={editing}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Eliminar "${deleting?.variantName ?? ''}"?`}
        description="La variante se eliminará permanentemente del producto."
        confirmLabel="Eliminar"
        destructive
        loading={deleteVariant.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
