import { useMemo, useState } from 'react'
import { Loader2, ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useBrandsQuery } from '@/features/catalog/hooks/useBrands'
import { useAllCombosQuery } from '@/features/catalog/hooks/useCombos'
import { useAllProductsQuery } from '@/features/catalog/hooks/useProducts'
import {
  CatalogToolbar,
  ALL_BRANDS,
  type CatalogTab,
} from '@/features/sales/components/CatalogToolbar'
import { ComboCard } from '@/features/sales/components/ComboCard'
import { CartItemsList } from '@/features/sales/components/CartItemsList'
import { EventBanner } from '@/features/sales/components/EventBanner'
import { NoEventBlocker } from '@/features/sales/components/NoEventBlocker'
import { PaymentSection } from '@/features/sales/components/PaymentSection'
import { ProductCard } from '@/features/sales/components/ProductCard'
import { ProductConfigSheet } from '@/features/sales/components/ProductConfigSheet'
import { SaleSuccessScreen } from '@/features/sales/components/SaleSuccessScreen'
import { useCreateSale } from '@/features/sales/hooks/useCreateSale'
import {
  selectCartCount,
  selectCartTotal,
  useCartStore,
  type CartItem,
} from '@/features/sales/store'
import { useCurrentEventQuery } from '@/features/events/hooks/useEvents'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import { useIsLandscapeWide } from '@/lib/hooks/useMediaQuery'
import { formatMoney } from '@/lib/format'
import type { Combo, Product } from '@/lib/types/catalog'
import type {
  PaymentMethod,
  SaleItemInput,
} from '@/lib/types/sale'
import { cn } from '@/lib/utils'

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function NewSalePage() {
  const currentEventQuery = useCurrentEventQuery()
  const event = currentEventQuery.data

  if (currentEventQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!event) return <NoEventBlocker />

  return <NewSaleInner eventId={event.id} eventName={event.name} eventStatus={event.status} eventLocation={event.location} />
}

function NewSaleInner({ eventId }: { eventId: number; eventName: string; eventStatus: string; eventLocation: string }) {
  const isLandscape = useIsLandscapeWide()
  const [tab, setTab] = useState<CatalogTab>('products')
  const [brandId, setBrandId] = useState<string>(ALL_BRANDS)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 300)

  const brandsQuery = useBrandsQuery()
  const productsQuery = useAllProductsQuery()
  const combosQuery = useAllCombosQuery()
  const currentEventQuery = useCurrentEventQuery()

  const [configProduct, setConfigProduct] = useState<Product | null>(null)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)

  const items = useCartStore((s) => s.items)
  const cartCount = useCartStore(selectCartCount)
  const cartTotal = useCartStore(selectCartTotal)
  const clearCart = useCartStore((s) => s.clear)
  const addItem = useCartStore((s) => s.addItem)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [amountReceived, setAmountReceived] = useState('')
  const [customerName, setCustomerName] = useState('')

  const [successOpen, setSuccessOpen] = useState(false)
  const [successData, setSuccessData] = useState<{ total: number; change: number | null } | null>(null)

  const createSale = useCreateSale()

  const filteredProducts = useMemo(() => {
    const all = productsQuery.data ?? []
    const q = norm(search.trim())
    return all
      .filter((p) => p.isActive)
      .filter((p) => brandId === ALL_BRANDS || p.brandId === Number(brandId))
      .filter((p) => q.length === 0 || norm(p.name).includes(q))
  }, [productsQuery.data, brandId, search])

  const filteredCombos = useMemo(() => {
    const all = combosQuery.data ?? []
    const q = norm(search.trim())
    return all
      .filter((c) => c.isActive)
      .filter((c) => brandId === ALL_BRANDS || c.brandId === Number(brandId))
      .filter((c) => q.length === 0 || norm(c.name).includes(q))
  }, [combosQuery.data, brandId, search])

  const handleProductSelect = (product: Product) => {
    addItem({
      kind: 'product',
      productId: product.id,
      variantId: null,
      productName: product.name,
      variantName: null,
      unitPrice: product.price,
      personalization: null,
      quantity: 1,
      maxStock: product.stock,
    })
  }

  const handleProductConfigure = (product: Product) => {
    setConfigProduct(product)
  }

  const handleComboSelect = (combo: Combo) => {
    addItem({
      kind: 'combo',
      comboId: combo.id,
      comboName: combo.name,
      unitPrice: combo.price,
      quantity: 1,
      maxStock: combo.availableStock,
    })
  }

  const buildItemPayload = (item: CartItem): SaleItemInput => {
    if (item.kind === 'product') {
      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        personalization: item.personalization ?? undefined,
      }
    }
    return { comboId: item.comboId, quantity: item.quantity }
  }

  const insufficientCash =
    paymentMethod === 'CASH' &&
    amountReceived.trim().length > 0 &&
    Number.isFinite(Number(amountReceived)) &&
    Number(amountReceived) < cartTotal
  const canCheckout =
    items.length > 0 && !createSale.isPending && !insufficientCash

  const handleCheckout = async () => {
    if (!canCheckout) return
    try {
      await createSale.mutateAsync({
        eventId,
        paymentMethod,
        customerName: customerName.trim().length > 0 ? customerName.trim() : null,
        items: items.map(buildItemPayload),
      })
      const total = cartTotal
      const received = Number(amountReceived)
      const change =
        paymentMethod === 'CASH' && Number.isFinite(received) && received >= total
          ? received - total
          : null
      setSuccessData({ total, change })
      setSuccessOpen(true)
      clearCart()
      setAmountReceived('')
      setCustomerName('')
      setMobileCartOpen(false)
    } catch {
      // toast handled by mutation
    }
  }

  const checkoutSection = (
    <div className="space-y-4">
      <PaymentSection
        method={paymentMethod}
        onMethodChange={setPaymentMethod}
        amountReceived={amountReceived}
        onAmountReceivedChange={setAmountReceived}
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        total={cartTotal}
        disabled={createSale.isPending}
      />

      <Separator />

      <div className="flex items-baseline justify-between">
        <span className="text-muted-foreground text-sm">Total</span>
        <span className="text-3xl font-bold tabular-nums">
          {formatMoney(cartTotal)}
        </span>
      </div>

      <Button
        size="lg"
        className="h-14 w-full text-base"
        onClick={handleCheckout}
        disabled={!canCheckout}
      >
        {createSale.isPending && <Loader2 className="size-4 animate-spin" />}
        Registrar venta
      </Button>
    </div>
  )

  return (
    <div className="space-y-4">
      {currentEventQuery.data && <EventBanner event={currentEventQuery.data} />}

      <CatalogToolbar
        tab={tab}
        onTabChange={setTab}
        brandId={brandId}
        onBrandChange={setBrandId}
        search={searchInput}
        onSearchChange={setSearchInput}
        brands={brandsQuery.data ?? []}
      />

      <div className="flex gap-6">
        <div className="min-w-0 flex-1 pb-32 lg:pb-0">
          {tab === 'products' ? (
            productsQuery.isLoading ? (
              <CatalogSkeleton />
            ) : filteredProducts.length === 0 ? (
              <EmptyResults />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onSelect={handleProductSelect}
                    onConfigure={handleProductConfigure}
                  />
                ))}
              </div>
            )
          ) : combosQuery.isLoading ? (
            <CatalogSkeleton />
          ) : filteredCombos.length === 0 ? (
            <EmptyResults />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
              {filteredCombos.map((c) => (
                <ComboCard
                  key={c.id}
                  combo={c}
                  onSelect={handleComboSelect}
                />
              ))}
            </div>
          )}
        </div>

        {isLandscape && (
          <aside
            className={cn(
              'sticky top-20 hidden h-[calc(100dvh-6rem)] w-[360px] shrink-0 flex-col gap-4 rounded-lg border bg-card p-4 lg:flex',
            )}
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <ShoppingCart className="size-5" />
                Carrito
              </h2>
              {cartCount > 0 && (
                <Badge variant="secondary">{cartCount}</Badge>
              )}
            </div>
            <Separator />
            <div className="min-h-0 flex-1 overflow-y-auto">
              <CartItemsList />
            </div>
            <Separator />
            {checkoutSection}
          </aside>
        )}
      </div>

      {/* Mini cart bar (portrait) */}
      {!isLandscape && (
        <div
          className="bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <button
            type="button"
            onClick={() => setMobileCartOpen(true)}
            className="flex w-full items-center justify-between px-4 py-3"
          >
            <span className="flex items-center gap-2 text-sm">
              <ShoppingCart className="size-5" />
              <span className="font-medium">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            </span>
            <span className="flex items-center gap-3">
              <span className="text-lg font-bold tabular-nums">
                {formatMoney(cartTotal)}
              </span>
              <span className="text-muted-foreground text-xs">
                Toca para ver
              </span>
            </span>
          </button>
        </div>
      )}

      <Sheet open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[92dvh] flex-col gap-0 rounded-t-2xl p-0"
        >
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5" />
              Carrito ({cartCount})
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <CartItemsList />
          </div>
          <div className="space-y-4 border-t px-6 py-4">{checkoutSection}</div>
        </SheetContent>
      </Sheet>

      <ProductConfigSheet
        product={configProduct}
        onClose={() => setConfigProduct(null)}
      />

      <SaleSuccessScreen
        open={successOpen}
        total={successData?.total ?? 0}
        change={successData?.change ?? null}
        onDismiss={() => setSuccessOpen(false)}
      />
    </div>
  )
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full" />
      ))}
    </div>
  )
}

function EmptyResults() {
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-center text-sm">
      <span className="text-3xl">🦴</span>
      <p>Sin resultados con esos filtros.</p>
    </div>
  )
}
