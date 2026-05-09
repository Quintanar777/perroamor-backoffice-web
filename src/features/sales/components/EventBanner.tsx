import { useState } from 'react'
import { CalendarDays, ChevronDown, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { EventStatusBadge } from '@/features/events/components/EventStatusBadge'
import { formatDateRange } from '@/lib/format'
import type { AppEvent } from '@/lib/types/event'

export function EventBanner({ event }: { event: AppEvent }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-1.5">
      <div className="flex min-w-0 items-center gap-2">
        <EventStatusBadge status={event.status} />
        <span className="truncate text-sm font-medium">{event.name}</span>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-7 gap-1 px-2 text-xs"
            aria-label="Detalles del evento"
          >
            Detalles
            <ChevronDown className="size-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-2 text-sm">
          <p className="font-semibold">{event.name}</p>
          <div className="text-muted-foreground flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            <span>{event.location}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0" />
            <span className="tabular-nums">
              {formatDateRange(event.startDate, event.endDate)}
            </span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
