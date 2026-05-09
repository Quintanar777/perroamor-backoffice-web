import { CalendarDays, MapPin, PlusCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { EventStatusBadge } from '@/features/events/components/EventStatusBadge'
import { useCurrentEventQuery } from '@/features/events/hooks/useEvents'
import { SalesStatsCard } from '@/features/sales/components/SalesStatsCard'
import { formatDateRange } from '@/lib/format'

export default function DashboardPage() {
  const currentEventQuery = useCurrentEventQuery()
  const event = currentEventQuery.data

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen del evento actual y accesos directos al POS."
      />

      {currentEventQuery.isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ) : event ? (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardDescription className="flex items-center gap-2">
                <CalendarDays className="size-4" />
                Evento actual
              </CardDescription>
              <CardTitle className="text-2xl">{event.name}</CardTitle>
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <MapPin className="size-4" />
                {event.location}
              </p>
            </div>
            <EventStatusBadge status={event.status} />
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            <p className="tabular-nums">
              {formatDateRange(event.startDate, event.endDate)} ·{' '}
              {event.durationDays} {event.durationDays === 1 ? 'día' : 'días'}
            </p>
            {event.description && (
              <p className="mt-2 line-clamp-3">{event.description}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button asChild size="lg">
              <Link to="/sales/new">
                <PlusCircle className="size-4" />
                Nueva venta
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/sales">Ver ventas</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <EmptyState
          icon={<span className="text-4xl">📅</span>}
          title="No hay evento en curso"
          description="Creá un evento o esperá a que arranque uno próximo para registrar ventas."
          action={
            <Button asChild>
              <Link to="/events">
                <CalendarDays className="size-4" />
                Ir a Eventos
              </Link>
            </Button>
          }
        />
      )}

      {event && <SalesStatsCard eventId={event.id} />}
    </div>
  )
}
