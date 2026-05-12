import { useEffect, useState } from 'react'
import { Check, Layers, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BrandBadge } from '@/components/shared/BrandBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { ProductFormDialog } from '@/features/catalog/components/ProductFormDialog'
import { useBrandsQuery } from '@/features/catalog/hooks/useBrands'
import {
  useDeleteProduct,
  useProductCategoriesQuery,
  useProductsQuery,
  useUpdateProduct,
} from '@/features/catalog/hooks/useProducts'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import { ApiError, NetworkError } from '@/lib/types/api'
import type { Product } from '@/lib/types/catalog'

const PAGE_SIZE = 10
const ALL = '__all__'

type RowEdit = {
  price?: number
  wholesalePrice?: number
  stock?: number
}

export default function ProductsPage() {
  const [page, setPage] = useState(0)
  const [brandId, setBrandId] = useState<string>(ALL)
  const [category, setCategory] = useState<string>(ALL)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 300)

  const filters = {
    page,
    size: PAGE_SIZE,
    brandId: brandId === ALL ? undefined : Number(brandId),
    category: category === ALL ? undefined : category,
    q: search.trim().length > 0 ? search.trim() : undefined,
  }

  const productsQuery = useProductsQuery(filters)
  const brandsQuery = useBrandsQuery()
  const categoriesQuery = useProductCategoriesQuery()
  const deleteProduct = useDeleteProduct()
  const updateProduct = useUpdateProduct()

  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Product | null>(null)

  // Inline edit state
  const [edits, setEdits] = useState<Map<number, RowEdit>>(() => new Map())
  const [saving, setSaving] = useState<Set<number>>(() => new Set())

  // Discard all inline edits when filters or page change
  useEffect(() => {
    setEdits(new Map())
  }, [brandId, category, search, page])

  const formOpen = creating || editing !== null
  const closeForm = () => {
    setCreating(false)
    setEditing(null)
  }

  // ── Inline edit helpers ────────────────────────────────────────────────────

  function getVal<K extends keyof Required<RowEdit>>(
    p: Product,
    field: K,
  ): Required<RowEdit>[K] {
    return (edits.get(p.id)?.[field] ?? p[field]) as Required<RowEdit>[K]
  }

  function setField(id: number, patch: RowEdit) {
    setEdits((prev) => new Map(prev).set(id, { ...prev.get(id), ...patch }))
  }

  function isDirty(p: Product): boolean {
    const e = edits.get(p.id)
    if (!e) return false
    return (
      (e.price !== undefined && e.price !== p.price) ||
      (e.wholesalePrice !== undefined && e.wholesalePrice !== p.wholesalePrice) ||
      (e.stock !== undefined && e.stock !== p.stock)
    )
  }

  function discard(id: number) {
    setEdits((prev) => {
      const m = new Map(prev)
      m.delete(id)
      return m
    })
  }

  async function save(p: Product) {
    if (!isDirty(p) || saving.has(p.id)) return
    const e = edits.get(p.id) ?? {}
    setSaving((prev) => new Set(prev).add(p.id))
    try {
      await updateProduct.mutateAsync({
        id: p.id,
        body: {
          name: p.name,
          brandId: p.brandId,
          category: p.category,
          description: p.description,
          price: e.price ?? p.price,
          wholesalePrice: e.wholesalePrice ?? p.wholesalePrice,
          stock: e.stock ?? p.stock,
          canBePersonalized: p.canBePersonalized,
          hasVariants: p.hasVariants,
          isActive: p.isActive,
        },
      })
      discard(p.id)
    } catch (err) {
      if (err instanceof NetworkError) {
        toast.error('Sin conexión', { description: 'No se pudo guardar el producto.' })
      } else if (err instanceof ApiError) {
        toast.error(err.title, { description: err.detail })
      } else {
        toast.error('Error al guardar')
      }
    } finally {
      setSaving((prev) => {
        const s = new Set(prev)
        s.delete(p.id)
        return s
      })
    }
  }

  function handleKeyDown(p: Product) {
    return (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        void save(p)
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        discard(p.id)
      }
    }
  }

  // ── Table columns ──────────────────────────────────────────────────────────

  const products = productsQuery.data?.content ?? []
  const totalElements = productsQuery.data?.totalElements ?? 0
  const totalPages = productsQuery.data?.totalPages ?? 0
  const noFilters =
    brandId === ALL && category === ALL && search.trim().length === 0
  const showEmpty =
    !productsQuery.isLoading && products.length === 0 && noFilters

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Nombre',
      cell: (p) => (
        <div className="flex flex-col">
          <span className="font-medium">{p.name}</span>
          {p.description && (
            <span className="text-muted-foreground line-clamp-1 text-xs">
              {p.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'brand',
      header: 'Marca',
      headerClassName: 'w-32',
      cell: (p) => <BrandBadge name={p.brandName} color={p.brandColor} />,
    },
    {
      key: 'price',
      header: <span className="block text-right">Precio</span>,
      headerClassName: 'w-28 text-right',
      className: 'text-right',
      cell: (p) => (
        <Input
          type="number"
          min={0}
          step={0.01}
          value={getVal(p, 'price')}
          onChange={(e) => {
            const n = e.target.valueAsNumber
            if (!isNaN(n)) setField(p.id, { price: n })
          }}
          onKeyDown={handleKeyDown(p)}
          className="h-7 w-full text-right tabular-nums"
        />
      ),
    },
    {
      key: 'wholesalePrice',
      header: <span className="block text-right">Mayoreo</span>,
      headerClassName: 'w-28 text-right',
      className: 'text-right',
      cell: (p) => (
        <Input
          type="number"
          min={0}
          step={0.01}
          value={getVal(p, 'wholesalePrice')}
          onChange={(e) => {
            const n = e.target.valueAsNumber
            if (!isNaN(n)) setField(p.id, { wholesalePrice: n })
          }}
          onKeyDown={handleKeyDown(p)}
          className="h-7 w-full text-right tabular-nums"
        />
      ),
    },
    {
      key: 'stock',
      header: <span className="block text-right">Stock</span>,
      headerClassName: 'w-24 text-right',
      className: 'text-right',
      cell: (p) =>
        p.hasVariants ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <Input
            type="number"
            min={0}
            step={1}
            value={getVal(p, 'stock')}
            onChange={(e) => {
              const n = e.target.valueAsNumber
              if (!isNaN(n)) setField(p.id, { stock: Math.round(n) })
            }}
            onKeyDown={handleKeyDown(p)}
            className="h-7 w-full text-right tabular-nums"
          />
        ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Acciones</span>,
      headerClassName: 'w-32 text-right',
      className: 'text-right',
      cell: (p) => {
        const dirty = isDirty(p)
        const isSaving = saving.has(p.id)
        return (
          <div className="flex justify-end gap-1">
            {dirty && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Guardar ${p.name}`}
                  disabled={isSaving}
                  onClick={() => void save(p)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Check className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Descartar cambios"
                  disabled={isSaving}
                  onClick={() => discard(p.id)}
                >
                  <X className="size-4" />
                </Button>
              </>
            )}
            {p.hasVariants && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                aria-label={`Variantes de ${p.name}`}
              >
                <Link to={`/products/${p.id}/variants`}>
                  <Layers className="size-4" />
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Editar ${p.name}`}
              onClick={() => {
                discard(p.id)
                setEditing(p)
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Eliminar ${p.name}`}
              onClick={() => setDeleting(p)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteProduct.mutateAsync(deleting)
      setDeleting(null)
    } catch {
      // toast handled in hook
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Editá precio, mayoreo, stock y atributos directamente en la tabla. Enter para guardar, Esc para descartar."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Nuevo producto
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)]">
        <Select
          value={brandId}
          onValueChange={(v) => setBrandId(v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas las marcas</SelectItem>
            {(brandsQuery.data ?? []).map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={category}
          onValueChange={(v) => setCategory(v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas las categorías</SelectItem>
            {(categoriesQuery.data ?? []).map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre..."
            className="pl-9"
          />
        </div>
      </div>

      {showEmpty ? (
        <EmptyState
          icon={<span className="text-4xl">📦</span>}
          title="Aún no hay productos"
          description="Empieza creando el primero o crea una marca antes."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Nuevo producto
            </Button>
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={products}
            rowKey={(p) => p.id}
            loading={productsQuery.isLoading}
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

      <ProductFormDialog
        open={formOpen}
        onOpenChange={(open) => (open ? null : closeForm())}
        product={editing}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Eliminar "${deleting?.name ?? ''}"?`}
        description="El producto y sus variantes dejarán de estar disponibles. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        loading={deleteProduct.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
