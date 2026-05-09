import { useState } from 'react'
import { Layers, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { Money } from '@/components/shared/Money'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { ProductFormDialog } from '@/features/catalog/components/ProductFormDialog'
import { useBrandsQuery } from '@/features/catalog/hooks/useBrands'
import {
  useDeleteProduct,
  useProductCategoriesQuery,
  useProductsQuery,
} from '@/features/catalog/hooks/useProducts'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import type { Product } from '@/lib/types/catalog'

const PAGE_SIZE = 10
const ALL = '__all__'

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
    search: search.trim().length > 0 ? search.trim() : undefined,
  }

  const productsQuery = useProductsQuery(filters)
  const brandsQuery = useBrandsQuery()
  const categoriesQuery = useProductCategoriesQuery()
  const deleteProduct = useDeleteProduct()

  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const formOpen = creating || editing !== null
  const closeForm = () => {
    setCreating(false)
    setEditing(null)
  }

  const resetPage = () => setPage(0)

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteProduct.mutateAsync(deleting)
      setDeleting(null)
    } catch {
      // toast handled
    }
  }

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
      cell: (p) => <Badge variant="outline">{p.brandName}</Badge>,
    },
    {
      key: 'category',
      header: 'Categoría',
      headerClassName: 'w-32',
      cell: (p) => <span className="text-muted-foreground">{p.category}</span>,
    },
    {
      key: 'price',
      header: <span className="text-right block">Precio</span>,
      headerClassName: 'w-28 text-right',
      className: 'text-right',
      cell: (p) => <Money value={p.price} />,
    },
    {
      key: 'wholesalePrice',
      header: <span className="text-right block">Mayoreo</span>,
      headerClassName: 'w-28 text-right',
      className: 'text-right text-muted-foreground',
      cell: (p) => <Money value={p.wholesalePrice} />,
    },
    {
      key: 'stock',
      header: <span className="text-right block">Stock</span>,
      headerClassName: 'w-20 text-right',
      className: 'text-right tabular-nums',
      cell: (p) => (p.hasVariants ? '—' : p.stock),
    },
    {
      key: 'flags',
      header: 'Atributos',
      headerClassName: 'w-32',
      cell: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.hasVariants && <Badge variant="secondary">Variantes</Badge>}
          {p.canBePersonalized && <Badge variant="secondary">Personaliza</Badge>}
          {!p.isActive && <Badge variant="outline">Inactivo</Badge>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Acciones</span>,
      headerClassName: 'w-32 text-right',
      className: 'text-right',
      cell: (p) => (
        <div className="flex justify-end gap-1">
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
            onClick={() => setEditing(p)}
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
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Catálogo de productos por marca."
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
          onValueChange={(v) => {
            setBrandId(v)
            resetPage()
          }}
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
          onValueChange={(v) => {
            setCategory(v)
            resetPage()
          }}
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
            onChange={(e) => {
              setSearchInput(e.target.value)
              resetPage()
            }}
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
