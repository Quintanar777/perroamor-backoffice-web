import { CalendarDays, MapPin } from 'lucide-react'
import { EventStatusBadge } from '@/features/events/components/EventStatusBadge'
import { formatDateRange } from '@/lib/format'
import type { AppEvent } from '@/lib/types/event'

export function EventBanner({ event }: { event: AppEvent }) {
  return (
    <div className="bg-muted/40 flex flex-col gap-2 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted-foreground flex items-center gap-1">
          <CalendarDays className="size-4" />
          Evento
        </span>
        <span className="font-semibold">{event.name}</span>
        <span className="text-muted-foreground flex items-center gap-1">
          <MapPin className="size-4" />
          {event.location}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {formatDateRange(event.startDate, event.endDate)}
        </span>
      </div>
      <EventStatusBadge status={event.status} />
    </div>
  )
}
