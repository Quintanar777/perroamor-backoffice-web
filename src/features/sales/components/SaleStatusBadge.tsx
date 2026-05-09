import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Props {
  isCancelled: boolean
  isPaid?: boolean
}

export function SaleStatusBadge({ isCancelled, isPaid = true }: Props) {
  if (isCancelled) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'bg-red-100 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-900',
        )}
      >
        Cancelada
      </Badge>
    )
  }
  if (!isPaid) {
    return <Badge variant="secondary">Pendiente</Badge>
  }
  return (
    <Badge
      variant="outline"
      className="bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900"
    >
      Pagada
    </Badge>
  )
}
