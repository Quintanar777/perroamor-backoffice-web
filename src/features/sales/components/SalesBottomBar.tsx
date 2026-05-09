import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/format'

interface Props {
  count: number
  total: number
  onOpenCart: () => void
}

export function SalesBottomBar({ count, total, onOpenCart }: Props) {
  const empty = count === 0
  return (
    <div
      className="bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur"
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-2 md:px-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary relative flex size-9 items-center justify-center rounded-full">
            <ShoppingCart className="size-4" />
            {!empty && (
              <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[11px] font-bold tabular-nums">
                {count}
              </span>
            )}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-muted-foreground text-xs">
              {empty
                ? 'Carrito vacío'
                : `${count} ${count === 1 ? 'ítem' : 'ítems'}`}
            </span>
            <span className="text-base font-bold tabular-nums">
              {formatMoney(total)}
            </span>
          </div>
        </div>

        <Button
          onClick={onOpenCart}
          disabled={empty}
          className="h-10 px-5 text-sm"
        >
          Ver carrito
        </Button>
      </div>
    </div>
  )
}
