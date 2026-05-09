import { useParams } from 'react-router-dom'
import { ComingSoon } from '@/components/shared/ComingSoon'
import { PageHeader } from '@/components/shared/PageHeader'

export default function SaleDetailPage() {
  const { id } = useParams()
  return (
    <div className="space-y-6">
      <PageHeader title={`Venta #${id ?? '—'}`} description="Detalle e items de la venta." />
      <ComingSoon phase="Fase 6" feature="El detalle de venta" />
    </div>
  )
}
