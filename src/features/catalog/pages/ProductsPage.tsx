import { ComingSoon } from '@/components/shared/ComingSoon'
import { PageHeader } from '@/components/shared/PageHeader'

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Productos" description="Catálogo de productos por marca." />
      <ComingSoon phase="Fase 3" feature="El listado y CRUD de productos" />
    </div>
  )
}
