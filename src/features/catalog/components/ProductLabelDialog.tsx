import { useRef, useState } from 'react'
import JsBarcode from 'jsbarcode'
import { Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useRegenerateCode } from '@/features/catalog/hooks/useProducts'
import type { Product } from '@/lib/types/catalog'

interface Props {
  product: Product | null
  onClose: () => void
}

export function ProductLabelDialog({ product, onClose }: Props) {
  return (
    <Dialog open={product !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        {product && <LabelBody key={product.id} product={product} />}
      </DialogContent>
    </Dialog>
  )
}

function LabelBody({ product }: { product: Product }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [code, setCode] = useState(product.code)
  const [confirmRegenerate, setConfirmRegenerate] = useState(false)
  const regenerate = useRegenerateCode()

  const drawBarcode = (node: HTMLCanvasElement | null) => {
    canvasRef.current = node
    if (!node || !code) return
    JsBarcode(node, code, {
      format: 'CODE128',
      height: 60,
      width: 2.2,
      fontSize: 16,
      margin: 8,
      displayValue: true,
    })
  }

  const handleDownload = () => {
    if (!canvasRef.current || !code) return
    const url = canvasRef.current.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `codigo-${code}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleRegenerate = async () => {
    const updated = await regenerate.mutateAsync(product.id)
    setCode(updated.code)
    setConfirmRegenerate(false)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{product.name}</DialogTitle>
        <DialogDescription>
          Código de escaneo de este producto — descargalo para imprimirlo por
          separado.
        </DialogDescription>
      </DialogHeader>

      <div className="flex justify-center rounded-lg border p-6">
        {code ? (
          <canvas ref={drawBarcode} />
        ) : (
          <p className="text-muted-foreground text-sm">
            Este producto todavía no tiene código.
          </p>
        )}
      </div>

      <DialogFooter className="flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          onClick={() => setConfirmRegenerate(true)}
          disabled={regenerate.isPending}
        >
          <RefreshCw className="size-4" />
          {code ? 'Regenerar código' : 'Generar código'}
        </Button>
        <Button onClick={handleDownload} disabled={!code}>
          <Download className="size-4" />
          Descargar PNG
        </Button>
      </DialogFooter>

      <ConfirmDialog
        open={confirmRegenerate}
        onOpenChange={setConfirmRegenerate}
        title={code ? '¿Regenerar código?' : '¿Generar código?'}
        description={
          code
            ? 'Se va a generar un código nuevo y distinto. Si ya imprimiste una etiqueta con el código actual, va a dejar de reconocer este producto.'
            : 'Se le va a asignar un código nuevo a este producto.'
        }
        confirmLabel={code ? 'Regenerar' : 'Generar'}
        loading={regenerate.isPending}
        onConfirm={handleRegenerate}
      />
    </>
  )
}
