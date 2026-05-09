import { Banknote, CreditCard, Wallet } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSaleStatsQuery } from '@/features/sales/hooks/useSales'
import { formatMoney } from '@/lib/format'
import {
  PAYMENT_METHOD_LABEL,
  type PaymentMethod,
} from '@/lib/types/sale'

interface Props {
  eventId: number
}

const ICONS: Record<PaymentMethod, typeof Banknote> = {
  CASH: Banknote,
  CARD: CreditCard,
  TRANSFER: Wallet,
}

export function SalesStatsCard({ eventId }: Props) {
  const statsQuery = useSaleStatsQuery(eventId)

  if (statsQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  const stats = statsQuery.data
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stats del evento</CardTitle>
          <CardDescription>No se pudieron cargar las estadísticas.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stats del evento</CardTitle>
        <CardDescription>
          Resumen de ventas (excluye canceladas).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Total vendido
            </p>
            <p className="text-3xl font-bold tabular-nums">
              {formatMoney(stats.totalAmount)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Ventas
            </p>
            <p className="text-3xl font-bold tabular-nums">{stats.totalSales}</p>
          </div>
        </div>

        {stats.byPaymentMethod.length > 0 && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Por método de pago
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {stats.byPaymentMethod.map((row) => {
                const Icon = ICONS[row.paymentMethod]
                return (
                  <div
                    key={row.paymentMethod}
                    className="bg-muted/40 flex items-center justify-between rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="text-muted-foreground size-4" />
                      <span className="text-sm font-medium">
                        {PAYMENT_METHOD_LABEL[row.paymentMethod]}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatMoney(row.amount)}
                      </p>
                      <p className="text-muted-foreground text-xs tabular-nums">
                        {row.count} {row.count === 1 ? 'venta' : 'ventas'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
