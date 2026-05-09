import { ComingSoon } from '@/components/shared/ComingSoon'
import { PageHeader } from '@/components/shared/PageHeader'

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Eventos" description="Expos, ferias y pop-ups." />
      <ComingSoon phase="Fase 4" feature="El CRUD de eventos" />
    </div>
  )
}
