import { useMemo, useState } from 'react'
import { Loader2, Minus, Plus } from 'lucide-react'
import { BrandBadge } from '@/components/shared/BrandBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useVariantsQuery } from '@/features/catalog/hooks/useVariants'
import {
  useCartStore,
  type ProductCartItem,
} from '@/features/sales/store'
import { formatMoney } from '@/lib/format'
import type { Product, ProductVariant } from '@/lib/types/catalog'
import { cn } from '@/lib/utils'

interface Props {
  product: Product | null
  onClose: () => void
}

export function ProductConfigSheet({ product, onClose }: Props) {
  const open = product !== null

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="flex max-h-[92dvh] flex-col gap-0 rounded-t-2xl p-0"
      >
        {product && (
          <ConfigBody key={product.id} product={product} onClose={onClose} />
        )}
      </SheetContent>
    </Sheet>
  )
}

function ConfigBody({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const addItem = useCartStore((s) => s.addItem)
  const variantsQuery = useVariantsQuery(product.hasVariants ? product.id : 0)

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [personalization, setPersonalization] = useState('')
  const [quantity, setQuantity] = useState(1)

  const needsVariant = product.hasVariants
  const needsPersonalization = product.canBePersonalized

  const activeVariants = useMemo(
    () => (variantsQuery.data ?? []).filter((v) => v.isActive),
    [variantsQuery.data],
  )

  const unitPrice = product.price + (selectedVariant?.priceAdjustment ?? 0)
  const stockAvailable = needsVariant
    ? (selectedVariant?.stock ?? 0)
    : product.stock
  const subtotal = unitPrice * quantity
  const canAdd =
    (!needsVariant || !!selectedVariant) &&
    stockAvailable > 0 &&
    quantity <= stockAvailable

  // Shows personalization form + qty stepper only when personalization is needed
  // and (no variant required OR variant already selected)
  const showPersonalizationForm =
    needsPersonalization && (!needsVariant || selectedVariant !== null)

  const buildItem = (variant: ProductVariant | null, qty = 1): ProductCartItem => {
    const price = product.price + (variant?.priceAdjustment ?? 0)
    return {
      kind: 'product',
      productId: product.id,
      variantId: variant?.id ?? null,
      productName: product.name,
      variantName: variant?.variantName ?? null,
      unitPrice: price,
      originalPrice: price,
      personalization: personalization.trim() || null,
      quantity: qty,
      maxStock: variant ? variant.stock : product.stock,
    }
  }

  const handleVariantTap = (variant: ProductVariant) => {
    if (variant.stock <= 0) return
    if (!needsPersonalization) {
      addItem(buildItem(variant))
      onClose()
    } else {
      setSelectedVariant(variant)
    }
  }

  const handleAdd = () => {
    if (!canAdd) return
    addItem(buildItem(selectedVariant, quantity))
    onClose()
  }

  const handleQtyStep = (delta: number) =>
    setQuantity((q) => {
      const next = q + delta
      if (next < 1) return 1
      if (stockAvailable > 0 && next > stockAvailable) return stockAvailable
      return next
    })

  return (
    <>
      <SheetHeader className="border-b px-6 py-4">
        <SheetTitle>{product.name}</SheetTitle>
        <SheetDescription className="flex flex-wrap items-center gap-2">
          <BrandBadge name={product.brandName} color={product.brandColor} />
          <span>{product.category}</span>
          <span>·</span>
          <span className="font-medium">{formatMoney(product.price)}</span>
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {needsVariant && (
          <div className="space-y-3">
            <Label className="text-base">
              {needsPersonalization
                ? selectedVariant
                  ? 'Variante seleccionada'
                  : 'Elige una variante'
                : 'Elige una variante'}
            </Label>

            {variantsQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {activeVariants.map((v) => {
                  const outOfStock = v.stock <= 0
                  const effectivePrice = product.price + v.priceAdjustment
                  const hasPriceAdj = v.priceAdjustment !== 0
                  const isSelected = selectedVariant?.id === v.id
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleVariantTap(v)}
                      disabled={outOfStock}
                      className={cn(
                        'flex flex-col rounded-xl border-2 p-3 text-left transition-all',
                        outOfStock
                          ? 'cursor-not-allowed opacity-40'
                          : 'cursor-pointer active:scale-95',
                        isSelected
                          ? 'border-primary bg-primary/5 ring-primary/20 ring-2'
                          : !outOfStock
                            ? 'border-border hover:border-primary/50 hover:bg-accent/40'
                            : 'border-border',
                      )}
                    >
                      <span className="text-base leading-tight font-semibold">
                        {v.variantName}
                      </span>
                      {hasPriceAdj && (
                        <span className="text-muted-foreground mt-0.5 text-sm tabular-nums">
                          {formatMoney(effectivePrice)}
                        </span>
                      )}
                      <span
                        className={cn(
                          'mt-1.5 text-xs tabular-nums',
                          outOfStock
                            ? 'text-destructive'
                            : v.stock <= 3
                              ? 'text-orange-500'
                              : 'text-muted-foreground',
                        )}
                      >
                        {outOfStock ? 'Agotado' : `${v.stock} disp.`}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {!needsPersonalization && !variantsQuery.isLoading && (
              <p className="text-muted-foreground text-xs">
                Toca una variante para agregarla al carrito
              </p>
            )}
          </div>
        )}

        {showPersonalizationForm && (
          <>
            <div className="space-y-2">
              <Label htmlFor="personalization">Personalización</Label>
              <Textarea
                id="personalization"
                rows={2}
                placeholder="Nombre del perro, mensaje, etc."
                value={personalization}
                onChange={(e) => setPersonalization(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Cantidad</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-14"
                  aria-label="Disminuir"
                  onClick={() => handleQtyStep(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="size-5" />
                </Button>
                <Input
                  className="h-14 text-center text-xl tabular-nums"
                  inputMode="numeric"
                  value={String(quantity)}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    if (Number.isFinite(n) && n >= 1) setQuantity(n)
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-14"
                  aria-label="Aumentar"
                  onClick={() => handleQtyStep(1)}
                  disabled={stockAvailable > 0 && quantity >= stockAvailable}
                >
                  <Plus className="size-5" />
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Stock disponible: {stockAvailable}
              </p>
            </div>

            <div className="bg-muted/40 flex items-baseline justify-between rounded-lg px-4 py-3">
              <span className="text-muted-foreground text-sm">Subtotal</span>
              <span className="text-2xl font-bold tabular-nums">
                {formatMoney(subtotal)}
              </span>
            </div>
          </>
        )}
      </div>

      {needsPersonalization && (
        <SheetFooter className="border-t px-6 py-4">
          <Button
            type="button"
            size="lg"
            className="h-14 w-full text-base"
            onClick={handleAdd}
            disabled={!canAdd}
          >
            {variantsQuery.isFetching && needsVariant && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Agregar al carrito
          </Button>
        </SheetFooter>
      )}
    </>
  )
}
