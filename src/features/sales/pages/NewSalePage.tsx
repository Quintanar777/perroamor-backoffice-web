import { useMemo, useState } from 'react'
import { Loader2, ShoppingCart, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { SalesBottomBar } from '@/features/sales/components/SalesBottomBar'
import { SaleSuccessScreen } from '@/features/sales/components/SaleSuccessScreen'
import { useCreateSale } from '@/features/sales/hooks/useCreateSale'
import {
  selectCartCount,
  selectCartTotal,
  selectIsWholesale,
  useCartStore,
  type CartItem,
} from '@/features/sales/store'
import { useCurrentEventQuery } from '@/features/events/hooks/useEvents'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import { formatMoney } from '@/lib/format'
import type { Combo, Product } from '@/lib/types/catalog'
import type {
  PaymentMethod,
  SaleItemInput,
} from '@/lib/types/sale'

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
  const [tab, setTab] = useState<CatalogTab>('products')
  const [brandId, setBrandId] = useState<string>(ALL_BRANDS)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 300)

  const brandsQuery = useBrandsQuery()
  const productsQuery = useAllProductsQuery()
  const combosQuery = useAllCombosQuery()
  const currentEventQuery = useCurrentEventQuery()

  const [configProduct, setConfigProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [cartTab, setCartTab] = useState<'items' | 'payment'>('items')

  const items = useCartStore((s) => s.items)
  const cartCount = useCartStore(selectCartCount)
  const cartTotal = useCartStore(selectCartTotal)
  const isWholesale = useCartStore(selectIsWholesale)
  const clearCart = useCartStore((s) => s.clear)
  const addItem = useCartStore((s) => s.addItem)
  const setWholesale = useCartStore((s) => s.setWholesale)

  const productQuantities = useMemo(() => {
    const map = new Map<number, number>()
    for (const it of items) {
      if (it.kind === 'product') {
        map.set(it.productId, (map.get(it.productId) ?? 0) + it.quantity)
      }
    }
    return map
  }, [items])

  const comboQuantities = useMemo(() => {
    const map = new Map<number, number>()
    for (const it of items) {
      if (it.kind === 'combo') {
        map.set(it.comboId, (map.get(it.comboId) ?? 0) + it.quantity)
      }
    }
    return map
  }, [items])

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [amountReceived, setAmountReceived] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [discountInput, setDiscountInput] = useState('')

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
      unitPrice: isWholesale ? product.wholesalePrice : product.price,
      originalPrice: product.price,
      wholesalePrice: product.wholesalePrice,
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
      originalPrice: combo.price,
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
        unitPrice: item.unitPrice,
        personalization: item.personalization ?? undefined,
      }
    }
    return {
      comboId: item.comboId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }
  }

  const parsedDiscount = Number(discountInput)
  const discountValid =
    discountInput.trim() === '' ||
    (Number.isFinite(parsedDiscount) && parsedDiscount >= 0)
  const discountAmount =
    discountInput.trim() !== '' && Number.isFinite(parsedDiscount) && parsedDiscount > 0
      ? parsedDiscount
      : 0
  const discountExceedsSubtotal = discountAmount > cartTotal
  const finalTotal = Math.max(0, cartTotal - discountAmount)

  const insufficientCash =
    paymentMethod === 'CASH' &&
    amountReceived.trim().length > 0 &&
    Number.isFinite(Number(amountReceived)) &&
    Number(amountReceived) < finalTotal
  const canCheckout =
    items.length > 0 &&
    !createSale.isPending &&
    !insufficientCash &&
    discountValid &&
    !discountExceedsSubtotal

  const handleCheckout = async () => {
    if (!canCheckout) return
    try {
      await createSale.mutateAsync({
        eventId,
        paymentMethod,
        customerName: customerName.trim().length > 0 ? customerName.trim() : null,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        items: items.map(buildItemPayload),
      })
      const received = Number(amountReceived)
      const change =
        paymentMethod === 'CASH' && Number.isFinite(received) && received >= finalTotal
          ? received - finalTotal
          : null
      setSuccessData({ total: finalTotal, change })
      setSuccessOpen(true)
      clearCart()
      setAmountReceived('')
      setCustomerName('')
      setDiscountInput('')
      setCartOpen(false)
      setCartTab('items')
    } catch {
      // toast handled by mutation
    }
  }

  return (
    <div className="space-y-4 pb-24">
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
                quantityInCart={productQuantities.get(p.id) ?? 0}
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
              quantityInCart={comboQuantities.get(c.id) ?? 0}
              onSelect={handleComboSelect}
            />
          ))}
        </div>
      )}

      <SalesBottomBar
        count={cartCount}
        total={finalTotal}
        onOpenCart={() => setCartOpen(true)}
      />

      <Sheet
        open={cartOpen}
        onOpenChange={(open) => {
          setCartOpen(open)
          if (!open) setCartTab('items')
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
        >
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <ShoppingCart className="size-5" />
                Carrito
              </span>
              <span className="flex items-center gap-2">
                {cartCount > 0 && (
                  <Badge variant="secondary">{cartCount}</Badge>
                )}
                {cartCount > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    aria-label="Limpiar carrito"
                    onClick={clearCart}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </span>
            </SheetTitle>
            <div className="flex items-center gap-2 pt-1">
              <Switch
                id="wholesale-toggle"
                checked={isWholesale}
                onCheckedChange={setWholesale}
              />
              <Label htmlFor="wholesale-toggle" className="text-sm font-normal cursor-pointer">
                Precio mayoreo
              </Label>
            </div>
          </SheetHeader>

          <Tabs
            value={cartTab}
            onValueChange={(v) => setCartTab(v as 'items' | 'payment')}
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <TabsList
              variant="line"
              className="mx-6 mt-2 grid h-11 w-auto grid-cols-2 border-b"
            >
              <TabsTrigger value="items" className="text-base">
                Items
              </TabsTrigger>
              <TabsTrigger value="payment" className="text-base">
                Pago
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="items"
              className="min-h-0 flex-1 overflow-y-auto px-4 py-2"
            >
              <CartItemsList />
            </TabsContent>

            <TabsContent
              value="payment"
              className="min-h-0 flex-1 overflow-y-auto px-6 py-4"
            >
              <PaymentSection
                method={paymentMethod}
                onMethodChange={setPaymentMethod}
                amountReceived={amountReceived}
                onAmountReceivedChange={setAmountReceived}
                customerName={customerName}
                onCustomerNameChange={setCustomerName}
                total={finalTotal}
                disabled={createSale.isPending}
              />
            </TabsContent>
          </Tabs>

          <div className="space-y-3 border-t px-6 py-4">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground text-sm">Subtotal</span>
              <span className="text-base font-medium tabular-nums">
                {formatMoney(cartTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="discount" className="text-muted-foreground text-sm">
                Descuento
              </Label>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-xs">$</span>
                <Input
                  id="discount"
                  type="number"
                  inputMode="decimal"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  disabled={createSale.isPending || items.length === 0}
                  className="h-9 w-28 text-right text-sm tabular-nums"
                />
              </div>
            </div>
            {discountExceedsSubtotal && (
              <p className="text-destructive text-xs">
                El descuento no puede superar el subtotal.
              </p>
            )}

            <Separator />

            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground text-sm">Total</span>
              <span className="text-3xl font-bold tabular-nums">
                {formatMoney(finalTotal)}
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
      {Array.from({ length: 10 }).map((_, i) => (
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
