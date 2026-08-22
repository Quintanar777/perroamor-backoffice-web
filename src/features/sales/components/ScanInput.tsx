import { useRef, useState } from 'react'
import { Loader2, ScanBarcode } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { useScanLookup } from '@/features/sales/hooks/useScanLookup'
import { ApiError, NetworkError } from '@/lib/types/api'
import type { CatalogLookupResult } from '@/lib/types/catalog'

interface Props {
  onResolved: (result: CatalogLookupResult) => void
}

export function ScanInput({ onResolved }: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const lookup = useScanLookup()

  const focusInput = () => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const code = value.trim()
    if (code.length === 0) return
    setValue('')

    lookup.mutate(code, {
      onSuccess: (result) => {
        onResolved(result)
        focusInput()
      },
      onError: (err) => {
        if (err instanceof NetworkError) {
          toast.error('Sin conexión', { description: 'No se pudo buscar el código.' })
        } else if (err instanceof ApiError) {
          toast.error(err.status === 404 ? 'Código no encontrado' : err.title, {
            description: err.status === 404 ? code : (err.detail ?? code),
          })
        } else {
          toast.error('Error al escanear')
        }
        focusInput()
      },
    })
  }

  return (
    <div className="relative w-full sm:w-72">
      <ScanBarcode className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={lookup.isPending}
        placeholder="Escanear código..."
        autoFocus
        className="h-12 pl-9 font-mono"
      />
      {lookup.isPending && (
        <Loader2 className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin" />
      )}
    </div>
  )
}
