import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen del evento actual y accesos directos al POS."
        actions={
          <Button
            variant="outline"
            onClick={() =>
              toast.success('Toast funcionando', {
                description: 'Sonner está conectado correctamente.',
              })
            }
          >
            Probar toast
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evento actual</CardTitle>
            <CardDescription>Se conecta a /events/current en Fase 4.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Acá va el card grande con el evento en curso y un botón directo a Nueva Venta.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stats del evento</CardTitle>
            <CardDescription>Se conecta a /sales/stats en Fase 6.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Total vendido, count de ventas, breakdown por método de pago.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
