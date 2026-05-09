import { useState } from 'react'
import { Banknote, CreditCard, Plus, Wallet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import { formatMoney } from '@/lib/format'
import type { PaymentMethod } from '@/lib/types/sale'
import { cn } from '@/lib/utils'

interface Props {
  method: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
  amountReceived: string
  onAmountReceivedChange: (value: string) => void
  customerName: string
  onCustomerNameChange: (value: string) => void
  total: number
  disabled?: boolean
}

export function PaymentSection({
  method,
  onMethodChange,
  amountReceived,
  onAmountReceivedChange,
  customerName,
  onCustomerNameChange,
  total,
  disabled,
}: Props) {
  const received = Number(amountReceived)
  const change = Number.isFinite(received) ? received - total : 0
  const showChange =
    method === 'CASH' &&
    amountReceived.trim().length > 0 &&
    Number.isFinite(received)
  const insufficient = showChange && change < 0

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Método de pago</Label>
        <ToggleGroup
          type="single"
          value={method}
          onValueChange={(v) => v && onMethodChange(v as PaymentMethod)}
          variant="outline"
          className="w-full"
          disabled={disabled}
        >
          <ToggleGroupItem value="CASH" className="h-12 flex-1 gap-2">
            <Banknote className="size-4" />
            Efectivo
          </ToggleGroupItem>
          <ToggleGroupItem value="CARD" className="h-12 flex-1 gap-2">
            <CreditCard className="size-4" />
            Tarjeta
          </ToggleGroupItem>
          <ToggleGroupItem value="TRANSFER" className="h-12 flex-1 gap-2">
            <Wallet className="size-4" />
            Transfer.
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {method === 'CASH' && (
        <div className="space-y-2">
          <Label htmlFor="amountReceived">Monto recibido</Label>
          <Input
            id="amountReceived"
            type="number"
            inputMode="decimal"
            step="1"
            placeholder="Opcional"
            value={amountReceived}
            onChange={(e) => onAmountReceivedChange(e.target.value)}
            disabled={disabled}
            className="h-12 text-base tabular-nums"
          />
          {showChange && (
            <p
              className={cn(
                'text-sm tabular-nums',
                insufficient ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {insufficient
                ? `Faltan ${formatMoney(Math.abs(change))}`
                : `Cambio: ${formatMoney(change)}`}
            </p>
          )}
        </div>
      )}

      <CustomerNameField
        value={customerName}
        onChange={onCustomerNameChange}
        disabled={disabled}
      />
    </div>
  )
}

function CustomerNameField({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const [expanded, setExpanded] = useState(value.trim().length > 0)

  if (!expanded) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground gap-1.5 px-2"
        onClick={() => setExpanded(true)}
        disabled={disabled}
      >
        <Plus className="size-4" />
        Agregar cliente
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="customerName">Cliente</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-7 gap-1 px-2 text-xs"
          onClick={() => {
            onChange('')
            setExpanded(false)
          }}
          disabled={disabled}
        >
          <X className="size-3" />
          Quitar
        </Button>
      </div>
      <Input
        id="customerName"
        placeholder="Nombre del cliente"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-12"
      />
    </div>
  )
}
