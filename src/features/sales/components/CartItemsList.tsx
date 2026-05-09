import { useEffect, useState } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  itemKey,
  useCartStore,
  type CartItem,
} from '@/features/sales/store'
import { formatMoney } from '@/lib/format'

function ItemRow({ item }: { item: CartItem }) {
  const updateQty = useCartStore((s) => s.updateQty)
  const updateUnitPrice = useCartStore((s) => s.updateUnitPrice)
  const removeItem = useCartStore((s) => s.removeItem)
  const key = itemKey(item)
  const lineTotal = item.unitPrice * item.quantity

  const isCombo = item.kind === 'combo'
  const title = isCombo ? item.comboName : item.productName

  const [priceDraft, setPriceDraft] = useState(item.unitPrice.toString())

  useEffect(() => {
    setPriceDraft(item.unitPrice.toString())
  }, [item.unitPrice])

  const commitPrice = () => {
    const trimmed = priceDraft.trim()
    if (trimmed === '') {
      setPriceDraft(item.unitPrice.toString())
      return
    }
    const next = Number(trimmed)
    if (!Number.isFinite(next) || next < 0) {
      setPriceDraft(item.unitPrice.toString())
      return
    }
    updateUnitPrice(key, next)
  }

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            {isCombo && (
              <Badge variant="secondary" className="text-[10px]">
                Combo
              </Badge>
            )}
            <p className="truncate font-medium">{title}</p>
          </div>
          {item.kind === 'product' && item.variantName && (
            <p className="text-muted-foreground text-xs">{item.variantName}</p>
          )}
          {item.kind === 'product' && item.personalization && (
            <p className="text-muted-foreground line-clamp-1 text-xs italic">
              "{item.personalization}"
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          aria-label={`Quitar ${title}`}
          onClick={() => removeItem(key)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            aria-label="Disminuir"
            onClick={() => updateQty(key, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-8 text-center text-base font-semibold tabular-nums">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            aria-label="Aumentar"
            onClick={() => updateQty(key, item.quantity + 1)}
            disabled={item.quantity >= item.maxStock}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-xs">$</span>
          <Input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            aria-label={`Precio unitario de ${title}`}
            value={priceDraft}
            onChange={(e) => setPriceDraft(e.target.value)}
            onBlur={commitPrice}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitPrice()
                ;(e.target as HTMLInputElement).blur()
              }
            }}
            className="h-9 w-24 text-right text-sm tabular-nums"
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <span className="text-base font-semibold tabular-nums">
          {formatMoney(lineTotal)}
        </span>
      </div>
    </div>
  )
}

export function CartItemsList() {
  const items = useCartStore((s) => s.items)

  if (items.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center text-sm">
        <span className="text-3xl">🐕</span>
        <p>El carrito está vacío.</p>
        <p className="text-xs">Toca un producto o combo para empezar.</p>
      </div>
    )
  }

  return (
    <ul className="divide-y">
      {items.map((item) => (
        <li key={itemKey(item)}>
          <ItemRow item={item} />
        </li>
      ))}
      <li>
        <Separator className="invisible" />
      </li>
    </ul>
  )
}
