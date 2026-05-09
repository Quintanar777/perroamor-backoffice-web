import { useParams } from 'react-router-dom'
import { ComingSoon } from '@/components/shared/ComingSoon'
import { PageHeader } from '@/components/shared/PageHeader'

export default function VariantsPage() {
  const { id } = useParams()
  return (
    <div className="space-y-6">
      <PageHeader
        title="Variantes"
        description={`Variantes del producto #${id ?? '—'}.`}
      />
      <ComingSoon phase="Fase 3" feature="La gestión de variantes" />
    </div>
  )
}
