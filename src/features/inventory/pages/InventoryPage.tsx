import { ComingSoon } from '@/components/shared/ComingSoon'
import { PageHeader } from '@/components/shared/PageHeader'

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Inventario" description="Vista general de stock." />
      <ComingSoon phase="Fase 3" feature="El inventario" />
    </div>
  )
}
