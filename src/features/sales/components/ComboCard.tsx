import { Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatMoney } from '@/lib/format'
import type { Combo } from '@/lib/types/catalog'
import { cn } from '@/lib/utils'

interface Props {
  combo: Combo
  quantityInCart: number
  onSelect: (combo: Combo) => void
}

function stockTone(stock: number): string {
  if (stock <= 0) return 'text-destructive'
  if (stock < 10) return 'text-amber-600 dark:text-amber-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

export function ComboCard({ combo, quantityInCart, onSelect }: Props) {
  const isOut = combo.availableStock <= 0
  const disabled = isOut
  const hasInCart = quantityInCart > 0

  return (
    <Card
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => !disabled && onSelect(combo)}
      onKeyDown={(e) => {
        if (disabled) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(combo)
        }
      }}
      className={cn(
        'group relative flex aspect-square cursor-pointer flex-col justify-between gap-2 border-dashed p-3 transition-colors',
        'hover:border-primary/50 hover:bg-accent/40 focus-visible:ring-ring focus-visible:ring-2',
        hasInCart && 'border-primary border-solid ring-2 ring-primary/30',
        disabled && 'pointer-events-none cursor-not-allowed opacity-40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Badge variant="secondary" className="gap-1 font-normal">
          <Layers className="size-3" />
          Combo
        </Badge>
        {hasInCart ? (
          <span
            aria-label={`En carrito: ${quantityInCart}`}
            className="bg-primary text-primary-foreground flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-bold tabular-nums"
          >
            {quantityInCart}
          </span>
        ) : (
          <span className={cn('text-xs tabular-nums', stockTone(combo.availableStock))}>
            {combo.availableStock}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <p className="line-clamp-2 text-center text-xl leading-tight font-semibold">
          {combo.name}
        </p>
        <p className="text-muted-foreground text-center text-xs">
          {combo.brandName} · {combo.items.length} ítems
        </p>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold tabular-nums">
          {formatMoney(combo.price)}
        </span>
        {isOut && (
          <Badge variant="outline" className="text-destructive border-destructive">
            Agotado
          </Badge>
        )}
      </div>
    </Card>
  )
}
