import { useState } from 'react'
import { ArrowLeft, Ban } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Money } from '@/components/shared/Money'
import { PageHeader } from '@/components/shared/PageHeader'
import { SaleStatusBadge } from '@/features/sales/components/SaleStatusBadge'
import {
  useCancelSale,
  useSaleQuery,
} from '@/features/sales/hooks/useSales'
import { useAuthStore } from '@/lib/auth/store'
import { formatDateTime } from '@/lib/format'
import { PAYMENT_METHOD_LABEL, type Sale, type SaleItem } from '@/lib/types/sale'

const ROLES_THAT_CAN_CANCEL = new Set(['ADMIN', 'MANAGER'])

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const saleId = Number(id)
  if (!Number.isFinite(saleId) || saleId <= 0) {
    return <Navigate to="/sales" replace />
  }
  return <SaleDetailInner saleId={saleId} />
}

function SaleDetailInner({ saleId }: { saleId: number }) {
  const saleQuery = useSaleQuery(saleId)
  const cancelMutation = useCancelSale()
  const userRole = useAuthStore((s) => s.user?.role)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const sale = saleQuery.data
  const canCancel =
    !!sale &&
    !sale.isCancelled &&
    !!userRole &&
    ROLES_THAT_CAN_CANCEL.has(userRole)

  const handleCancel = async () => {
    if (!sale) return
    try {
      await cancelMutation.mutateAsync(sale)
      setConfirmOpen(false)
    } catch {
      // toast handled by mutation
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Venta #${saleId}`}
        description="Detalle e items vendidos."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/sales">
                <ArrowLeft className="size-4" />
                Volver
              </Link>
            </Button>
            {canCancel && (
              <Button
                variant="destructive"
                onClick={() => setConfirmOpen(true)}
                disabled={cancelMutation.isPending}
              >
                <Ban className="size-4" />
                Cancelar venta
              </Button>
            )}
          </div>
        }
      />

      {saleQuery.isLoading || !sale ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ) : (
        <SaleDetailContent sale={sale} />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Cancelar venta #${saleId}?`}
        description="El stock de productos y combos vendidos se restituirá. Esta acción no se puede revertir."
        confirmLabel="Cancelar venta"
        destructive
        loading={cancelMutation.isPending}
        onConfirm={handleCancel}
      />
    </div>
  )
}

function SaleDetailContent({ sale }: { sale: Sale }) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Total
            </p>
            <p className="text-4xl font-bold tabular-nums">
              <Money value={sale.totalAmount} />
            </p>
          </div>
          <SaleStatusBadge isCancelled={sale.isCancelled} isPaid={sale.isPaid} />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Fecha" value={formatDateTime(sale.saleDate)} />
          <Field label="Método de pago" value={PAYMENT_METHOD_LABEL[sale.paymentMethod]} />
          <Field label="Vendedor" value={sale.soldByUsername} />
          <Field label="Cliente" value={sale.customerName ?? '—'} />
          {sale.customerPhone && (
            <Field label="Teléfono" value={sale.customerPhone} />
          )}
          {sale.customerEmail && (
            <Field label="Email" value={sale.customerEmail} />
          )}
          <Field label="Evento" value={`#${sale.eventId}`} />
          {sale.isCancelled && sale.cancelledAt && (
            <Field
              label="Cancelada el"
              value={formatDateTime(sale.cancelledAt)}
            />
          )}
        </CardContent>
        {sale.notes && (
          <CardContent>
            <Field label="Notas" value={sale.notes} />
          </CardContent>
        )}
      </Card>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="w-20 text-right">Qty</TableHead>
              <TableHead className="w-28 text-right">Unitario</TableHead>
              <TableHead className="w-28 text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sale.items.map((it) => (
              <TableRow key={it.id}>
                <TableCell>
                  <ItemDescription item={it} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {it.quantity}
                </TableCell>
                <TableCell className="text-right">
                  <Money value={it.unitPrice} />
                </TableCell>
                <TableCell className="text-right">
                  <Money value={it.lineTotal} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function ItemDescription({ item }: { item: SaleItem }) {
  if (item.comboId !== null) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-[10px]">
          Combo
        </Badge>
        <span className="font-medium">{item.comboName}</span>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium">Producto #{item.productId}</span>
      {item.variantId && (
        <span className="text-muted-foreground text-xs">
          Variante #{item.variantId}
        </span>
      )}
      {item.personalization && (
        <span className="text-muted-foreground text-xs italic">
          "{item.personalization}"
        </span>
      )}
    </div>
  )
}
