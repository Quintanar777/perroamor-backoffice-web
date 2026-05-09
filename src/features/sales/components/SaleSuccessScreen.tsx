import { useEffect } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  total: number
  change: number | null
  onDismiss: () => void
  autoDismissMs?: number
}

export function SaleSuccessScreen({
  open,
  total,
  change,
  onDismiss,
  autoDismissMs = 5000,
}: Props) {
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(onDismiss, autoDismissMs)
    return () => window.clearTimeout(id)
  }, [open, onDismiss, autoDismissMs])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onDismiss}
      className="bg-background/95 fixed inset-0 z-50 flex flex-col items-center justify-center p-6 backdrop-blur"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full max-w-lg space-y-6 rounded-2xl border bg-card p-8 text-center shadow-xl',
        )}
      >
        <div className="bg-emerald-100 dark:bg-emerald-950 mx-auto flex size-24 items-center justify-center rounded-full">
          <Check className="size-12 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground text-sm uppercase tracking-wide">
            Venta registrada
          </p>
          <p className="text-5xl font-bold tabular-nums">{formatMoney(total)}</p>
        </div>

        {change !== null && change >= 0 && (
          <div className="bg-muted/50 space-y-1 rounded-lg px-4 py-3">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Cambio
            </p>
            <p className="text-2xl font-semibold tabular-nums">
              {formatMoney(change)}
            </p>
          </div>
        )}

        <Button size="lg" className="h-14 w-full text-base" onClick={onDismiss}>
          Nueva venta
        </Button>

        <p className="text-muted-foreground text-xs">
          Toca cualquier lugar para cerrar
        </p>
      </div>
    </div>
  )
}
