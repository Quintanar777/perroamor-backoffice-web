import { useState } from 'react'
import { Banknote, CreditCard, Plus, Smartphone, Wallet, X } from 'lucide-react'
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

// Which main tab to show as active for a given method
const mainTab = (method: PaymentMethod): 'CASH' | 'CARD' | 'TRANSFER' => {
  if (method === 'CARD' || method === 'MP_NATHALY') return 'CARD'
  if (method === 'TRANSFER') return 'TRANSFER'
  return 'CASH'
}

const MAIN_SELECTED: Record<'CASH' | 'CARD' | 'TRANSFER', string> = {
  CASH:     'data-[state=on]:bg-emerald-500 data-[state=on]:text-white data-[state=on]:border-emerald-500',
  CARD:     'data-[state=on]:bg-blue-500    data-[state=on]:text-white data-[state=on]:border-blue-500',
  TRANSFER: 'data-[state=on]:bg-violet-500  data-[state=on]:text-white data-[state=on]:border-violet-500',
}

const SUB_SELECTED = 'data-[state=on]:bg-blue-500 data-[state=on]:text-white data-[state=on]:border-blue-500'

export const PAYMENT_METHOD_COLOR: Record<PaymentMethod, string> = {
  CASH:       'bg-emerald-500',
  CARD:       'bg-blue-500',
  MP_NATHALY: 'bg-blue-500',
  TRANSFER:   'bg-violet-500',
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

  const handleMainTab = (tab: string | undefined) => {
    if (!tab) return
    if (tab === 'CARD') {
      // Default to Terminal when switching to the card tab
      onMethodChange('CARD')
    } else {
      onMethodChange(tab as PaymentMethod)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Método de pago</Label>

        {/* Primary row */}
        <ToggleGroup
          type="single"
          value={mainTab(method)}
          onValueChange={handleMainTab}
          variant="outline"
          className="w-full"
          disabled={disabled}
        >
          <ToggleGroupItem value="CASH" className={cn('h-12 flex-1 gap-2', MAIN_SELECTED.CASH)}>
            <Banknote className="size-4" />
            Efectivo
          </ToggleGroupItem>
          <ToggleGroupItem value="CARD" className={cn('h-12 flex-1 gap-2', MAIN_SELECTED.CARD)}>
            <CreditCard className="size-4" />
            Tarjeta
          </ToggleGroupItem>
          <ToggleGroupItem value="TRANSFER" className={cn('h-12 flex-1 gap-2', MAIN_SELECTED.TRANSFER)}>
            <Wallet className="size-4" />
            Transfer.
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Card sub-selector */}
        {mainTab(method) === 'CARD' && (
          <ToggleGroup
            type="single"
            value={method}
            onValueChange={(v) => v && onMethodChange(v as PaymentMethod)}
            variant="outline"
            className="w-full"
            disabled={disabled}
          >
            <ToggleGroupItem value="CARD" className={cn('h-10 flex-1 gap-2 text-sm', SUB_SELECTED)}>
              <CreditCard className="size-3.5" />
              Terminal
            </ToggleGroupItem>
            <ToggleGroupItem value="MP_NATHALY" className={cn('h-10 flex-1 gap-2 text-sm', SUB_SELECTED)}>
              <Smartphone className="size-3.5" />
              MP Nathaly
            </ToggleGroupItem>
          </ToggleGroup>
        )}
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
