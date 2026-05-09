import { Fragment, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Money } from '@/components/shared/Money'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { ComboFormDialog } from '@/features/catalog/components/ComboFormDialog'
import { useBrandsQuery } from '@/features/catalog/hooks/useBrands'
import { useCombosQuery, useDeleteCombo } from '@/features/catalog/hooks/useCombos'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import { cn } from '@/lib/utils'
import type { Combo, ComboItem } from '@/lib/types/catalog'

const PAGE_SIZE = 10
const ALL = '__all__'

type ActiveFilter = 'all' | 'active' | 'inactive'

function stockBadgeClass(stock: number): string {
  if (stock <= 0) {
    return 'bg-red-100 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-900'
  }
  if (stock < 10) {
    return 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900'
  }
  return 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900'
}

function ComponentsList({ items }: { items: ComboItem[] }) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">Sin componentes.</p>
  }
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((it) => (
        <li key={it.id} className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{it.productName}</span>
            {it.variantName && (
              <Badge variant="outline" className="font-normal">
                {it.variantName}
              </Badge>
            )}
          </div>
          <span className="text-muted-foreground tabular-nums">
            × {it.quantity}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function CombosPage() {
  const [page, setPage] = useState(0)
  const [brandId, setBrandId] = useState<string>(ALL)
  const [searchInput, setSearchInput] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active')
  const search = useDebouncedValue(searchInput, 300)

  const filters = {
    page,
    size: PAGE_SIZE,
    brandId: brandId === ALL ? undefined : Number(brandId),
    search: search.trim().length > 0 ? search.trim() : undefined,
    isActive:
      activeFilter === 'all'
        ? undefined
        : activeFilter === 'active'
          ? true
          : false,
  }

  const combosQuery = useCombosQuery(filters)
  const brandsQuery = useBrandsQuery()
  const deleteCombo = useDeleteCombo()

  const [editing, setEditing] = useState<Combo | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Combo | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const formOpen = creating || editing !== null
  const closeForm = () => {
    setCreating(false)
    setEditing(null)
  }

  const resetPage = () => setPage(0)

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteCombo.mutateAsync(deleting)
      setDeleting(null)
    } catch {
      // toast handled
    }
  }

  const combos = combosQuery.data?.content ?? []
  const totalElements = combosQuery.data?.totalElements ?? 0
  const totalPages = combosQuery.data?.totalPages ?? 0
  const noFilters =
    brandId === ALL && search.trim().length === 0 && activeFilter === 'all'
  const showEmpty =
    !combosQuery.isLoading && combos.length === 0 && noFilters

  return (
    <div className="space-y-6">
      <PageHeader
        title="Combos"
        description="Agrupaciones que descuentan stock real de cada componente al venderse."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Nuevo combo
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
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
          icon={<span className="text-4xl">📦</span>}
          title="Aún no hay combos"
          description="Creá el primero combinando productos existentes."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Nuevo combo
            </Button>
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-32">Marca</TableHead>
                  <TableHead className="w-28 text-right">Precio</TableHead>
                  <TableHead className="w-32 text-right">Disponibles</TableHead>
                  <TableHead className="w-24 text-right">Componentes</TableHead>
                  <TableHead className="w-24">Estado</TableHead>
                  <TableHead className="w-24 text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combosQuery.isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={`s-${idx}`}>
                      {Array.from({ length: 8 }).map((__, i) => (
                        <TableCell key={i}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : combos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <span className="text-muted-foreground text-sm">
                        Sin resultados.
                      </span>
                    </TableCell>
                  </TableRow>
                ) : (
                  combos.map((c) => {
                    const expanded = expandedId === c.id
                    return (
                      <Fragment key={c.id}>
                        <TableRow>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={
                                expanded ? 'Contraer combo' : 'Expandir combo'
                              }
                              onClick={() =>
                                setExpandedId(expanded ? null : c.id)
                              }
                            >
                              {expanded ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{c.name}</span>
                              {c.description && (
                                <span className="text-muted-foreground line-clamp-1 text-xs">
                                  {c.description}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{c.brandName}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Money value={c.price} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className={cn(
                                'tabular-nums',
                                stockBadgeClass(c.availableStock),
                              )}
                            >
                              {c.availableStock}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {c.items.length}
                          </TableCell>
                          <TableCell>
                            <Badge variant={c.isActive ? 'default' : 'secondary'}>
                              {c.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Editar ${c.name}`}
                                onClick={() => setEditing(c)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Eliminar ${c.name}`}
                                onClick={() => setDeleting(c)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expanded && (
                          <TableRow className="bg-muted/40">
                            <TableCell colSpan={8} className="px-12 py-4">
                              <ComponentsList items={c.items} />
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

      <ComboFormDialog
        open={formOpen}
        onOpenChange={(open) => (open ? null : closeForm())}
        combo={editing}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Eliminar "${deleting?.name ?? ''}"?`}
        description="El combo se desactiva (soft delete). El stock de los componentes no se toca."
        confirmLabel="Eliminar"
        destructive
        loading={deleteCombo.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
