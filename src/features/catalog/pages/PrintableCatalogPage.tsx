import { useMemo, useState } from 'react'
import { Printer } from 'lucide-react'
import { Barcode } from '@/components/shared/Barcode'
import { BrandBadge } from '@/components/shared/BrandBadge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useAllProductsQuery,
  useBackfillCodes,
} from '@/features/catalog/hooks/useProducts'
import { useEventsQuery } from '@/features/events/hooks/useEvents'
import { useSalesReportQuery } from '@/features/reports/hooks/useSalesReport'
import type { Product } from '@/lib/types/catalog'

const ALL = '__all__'

export default function PrintableCatalogPage() {
  const [tab, setTab] = useState<'quick' | 'full'>('quick')
  const [eventId, setEventId] = useState<string>(ALL)
  const [topN, setTopN] = useState(20)

  const productsQuery = useAllProductsQuery()
  const eventsQuery = useEventsQuery({ size: 100 })
  const reportQuery = useSalesReportQuery({
    eventId: eventId !== ALL ? Number(eventId) : undefined,
  })
  const backfillCodes = useBackfillCodes()

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data])
  const productById = useMemo(
    () => new Map(products.map((p) => [p.id, p] as const)),
    [products],
  )
  const missingCodeCount = products.filter((p) => !p.code).length

  const topProducts = useMemo(() => {
    const rows = reportQuery.data?.rows ?? []
    return rows
      .filter((r) => r.totalQuantity > 0)
      .slice()
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, topN)
      .map((r) => productById.get(r.productId))
      .filter((p): p is Product => !!p?.code && p.isActive)
  }, [reportQuery.data, productById, topN])

  const fullCatalog = useMemo(
    () =>
      products
        .filter((p) => p.isActive && p.code)
        .slice()
        .sort((a, b) => {
          if (a.brandName !== b.brandName) {
            return a.brandName.localeCompare(b.brandName, 'es')
          }
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category, 'es')
          }
          return a.name.localeCompare(b.name, 'es')
        }),
    [products],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Etiquetas para escaneo"
        description="Documentos imprimibles para escanear productos en el POS sin buscar en el grid."
        actions={
          missingCodeCount > 0 ? (
            <Button
              variant="outline"
              onClick={() => backfillCodes.mutate()}
              disabled={backfillCodes.isPending}
            >
              {backfillCodes.isPending
                ? 'Generando…'
                : `Generar códigos faltantes (${missingCodeCount})`}
            </Button>
          ) : undefined
        }
      />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as 'quick' | 'full')}
        className="print:hidden"
      >
        <TabsList>
          <TabsTrigger value="quick">Hoja rápida</TabsTrigger>
          <TabsTrigger value="full">Catálogo completo</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === 'quick' ? (
        <div className="space-y-4">
          <div className="print:hidden flex flex-wrap items-end justify-between gap-3 rounded-lg border p-4">
            <div>
              <h2 className="text-lg font-semibold">
                Hoja rápida — más vendidos
              </h2>
              <p className="text-muted-foreground text-sm">
                Los productos con más unidades vendidas primero. Pensada para
                escanear rápido en el evento.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={eventId} onValueChange={setEventId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos los eventos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>
                    Todos los eventos (histórico)
                  </SelectItem>
                  {(eventsQuery.data?.content ?? []).map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                max={100}
                value={topN}
                onChange={(e) =>
                  setTopN(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-20"
                aria-label="Cantidad de productos"
              />
              <Button
                onClick={() => window.print()}
                disabled={topProducts.length === 0}
              >
                <Printer className="size-4" />
                Imprimir
              </Button>
            </div>
          </div>

          {productsQuery.isLoading || reportQuery.isLoading ? (
            <PrintSkeleton />
          ) : topProducts.length === 0 ? (
            <EmptyState
              icon={<span className="text-4xl">📊</span>}
              title="Sin ventas para armar la hoja"
              description="Elegí otro evento o registrá ventas primero."
            />
          ) : (
            <QuickSheet products={topProducts} />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="print:hidden flex flex-wrap items-end justify-between gap-3 rounded-lg border p-4">
            <div>
              <h2 className="text-lg font-semibold">Catálogo completo</h2>
              <p className="text-muted-foreground text-sm">
                Todos los productos activos con código, agrupados por marca y
                categoría. Respaldo para lo que no está en la hoja rápida.
              </p>
            </div>
            <Button
              onClick={() => window.print()}
              disabled={fullCatalog.length === 0}
            >
              <Printer className="size-4" />
              Imprimir
            </Button>
          </div>

          {productsQuery.isLoading ? (
            <PrintSkeleton />
          ) : fullCatalog.length === 0 ? (
            <EmptyState
              icon={<span className="text-4xl">📦</span>}
              title="Sin productos con código"
              description="Generá los códigos faltantes antes de imprimir el catálogo."
            />
          ) : (
            <FullCatalogSheet products={fullCatalog} />
          )}
        </div>
      )}
    </div>
  )
}

function QuickSheet({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 print:grid-cols-2">
      {products.map((p) => (
        <div
          key={p.id}
          className="flex flex-col items-center gap-1 rounded-xl border p-4 break-inside-avoid print:border-black"
        >
          <BrandBadge name={p.brandName} color={p.brandColor} />
          <p className="text-center text-lg leading-tight font-semibold">
            {p.name}
          </p>
          <p className="text-muted-foreground text-xs">{p.category}</p>
          <Barcode
            value={p.code!}
            height={50}
            width={2}
            fontSize={14}
            className="mt-2"
          />
        </div>
      ))}
    </div>
  )
}

function FullCatalogSheet({ products }: { products: Product[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, Product[]>()
    for (const p of products) {
      const key = `${p.brandName} · ${p.category}`
      const list = map.get(key) ?? []
      list.push(p)
      map.set(key, list)
    }
    return [...map.entries()]
  }, [products])

  return (
    <div className="space-y-6">
      {groups.map(([group, items]) => (
        <div key={group} className="break-inside-avoid">
          <h3 className="mb-2 border-b pb-1 text-sm font-semibold">
            {group}
          </h3>
          <div className="grid grid-cols-3 gap-3 print:grid-cols-4">
            {items.map((p) => (
              <div
                key={p.id}
                className="flex flex-col items-center gap-0.5 rounded-lg border p-2 break-inside-avoid print:border-black"
              >
                <p className="text-center text-xs leading-tight font-medium">
                  {p.name}
                </p>
                <Barcode value={p.code!} height={28} width={1.2} fontSize={9} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PrintSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  )
}
