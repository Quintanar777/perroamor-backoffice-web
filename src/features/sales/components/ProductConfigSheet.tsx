import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  selectIsWholesale,
  useCartStore,
  type ProductCartItem,
} from '@/features/sales/store'
import { formatMoney } from '@/lib/format'
import type { Product } from '@/lib/types/catalog'

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
  const isWholesale = useCartStore(selectIsWholesale)

  const [personalization, setPersonalization] = useState('')
  const [quantity, setQuantity] = useState(1)

  const unitPrice = product.price
  const stockAvailable = product.stock
  const subtotal = unitPrice * quantity
  const canAdd = stockAvailable > 0 && quantity <= stockAvailable

  const buildItem = (qty = 1): ProductCartItem => ({
    kind: 'product',
    productId: product.id,
    variantId: null,
    productName: product.name,
    size: product.size,
    variantName: null,
    unitPrice: isWholesale ? product.wholesalePrice : product.price,
    originalPrice: product.price,
    wholesalePrice: product.wholesalePrice,
    personalization: personalization.trim() || null,
    quantity: qty,
    maxStock: product.stock,
    discountId: null,
    discountName: null,
    discountedPrice: null,
  })

  const handleAdd = () => {
    if (!canAdd) return
    addItem(buildItem(quantity))
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
      </div>

      <SheetFooter className="border-t px-6 py-4">
        <Button
          type="button"
          size="lg"
          className="h-14 w-full text-base"
          onClick={handleAdd}
          disabled={!canAdd}
        >
          Agregar al carrito
        </Button>
      </SheetFooter>
    </>
  )
}
