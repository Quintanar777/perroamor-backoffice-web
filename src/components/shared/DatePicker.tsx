import { CalendarIcon } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  fromDate?: Date
}

const toIsoDate = (date: Date): string => format(date, 'yyyy-MM-dd')

const safeParse = (value: string): Date | undefined => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const d = parseISO(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = 'Elige una fecha',
  fromDate,
}: Props) {
  const [open, setOpen] = useState(false)
  const date = safeParse(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="size-4" />
          {date ? format(date, "d 'de' MMMM yyyy", { locale: es }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={es}
          selected={date}
          onSelect={(d) => {
            if (d) {
              onChange(toIsoDate(d))
              setOpen(false)
            }
          }}
          startMonth={fromDate}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
}
