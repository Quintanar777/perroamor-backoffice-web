import { ComingSoon } from '@/components/shared/ComingSoon'
import { PageHeader } from '@/components/shared/PageHeader'

export default function BrandsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Marcas" description="Perro Amor, Perra Madre y otras marcas." />
      <ComingSoon phase="Fase 3" feature="El CRUD de marcas" />
    </div>
  )
}
