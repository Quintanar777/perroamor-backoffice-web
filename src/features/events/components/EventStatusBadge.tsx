import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EventStatus } from '@/lib/types/event'

const STATUS_LABEL: Record<EventStatus, string> = {
  UPCOMING: 'Próximo',
  IN_PROGRESS: 'En curso',
  FINISHED: 'Finalizado',
}

const STATUS_CLASS: Record<EventStatus, string> = {
  UPCOMING:
    'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900',
  IN_PROGRESS:
    'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900',
  FINISHED:
    'bg-muted text-muted-foreground border-border',
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}
