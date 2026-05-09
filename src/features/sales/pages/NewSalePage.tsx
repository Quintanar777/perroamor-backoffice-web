import { ComingSoon } from '@/components/shared/ComingSoon'
import { PageHeader } from '@/components/shared/PageHeader'

export default function NewSalePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Nueva venta" description="Punto de venta para usar en el evento." />
      <ComingSoon phase="Fase 5" feature="El POS" />
    </div>
  )
}
