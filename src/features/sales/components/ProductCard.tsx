import { Settings2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatMoney } from '@/lib/format'
import type { Product } from '@/lib/types/catalog'
import { cn } from '@/lib/utils'

interface Props {
  product: Product
  onSelect: (product: Product) => void
  onConfigure?: (product: Product) => void
}

export function ProductCard({ product, onSelect, onConfigure }: Props) {
  const isOutOfStock = product.stock <= 0
  const disabled = isOutOfStock
  const canConfigure =
    !!onConfigure && (product.hasVariants || product.canBePersonalized)

  return (
    <Card
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => !disabled && onSelect(product)}
      onKeyDown={(e) => {
        if (disabled) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(product)
        }
      }}
      className={cn(
        'group relative flex aspect-square cursor-pointer flex-col justify-between gap-2 p-3 transition-colors',
        'hover:border-primary/50 hover:bg-accent/40 focus-visible:ring-ring focus-visible:ring-2',
        disabled && 'pointer-events-none cursor-not-allowed opacity-40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Badge variant="outline" className="font-normal">
          {product.brandName}
        </Badge>
        <span
          className={cn(
            'text-xs tabular-nums',
            isOutOfStock ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {product.stock}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="line-clamp-2 text-base leading-tight font-semibold">
          {product.name}
        </p>
        <p className="text-muted-foreground text-xs">{product.category}</p>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold tabular-nums">
          {formatMoney(product.price)}
        </span>
        {isOutOfStock && (
          <Badge variant="outline" className="text-destructive border-destructive">
            Agotado
          </Badge>
        )}
      </div>

      {canConfigure && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="bg-background/80 hover:bg-background absolute top-1 right-1 size-8 backdrop-blur"
          aria-label={`Detallar ${product.name}`}
          onClick={(e) => {
            e.stopPropagation()
            onConfigure?.(product)
          }}
        >
          <Settings2 className="size-4" />
        </Button>
      )}
    </Card>
  )
}
