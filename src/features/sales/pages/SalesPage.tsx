import { ComingSoon } from '@/components/shared/ComingSoon'
import { PageHeader } from '@/components/shared/PageHeader'

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Ventas" description="Historial de ventas registradas." />
      <ComingSoon phase="Fase 6" feature="El listado de ventas" />
    </div>
  )
}
