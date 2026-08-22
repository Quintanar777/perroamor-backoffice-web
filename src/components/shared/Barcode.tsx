import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface Props {
  value: string
  height?: number
  width?: number
  fontSize?: number
  className?: string
}

export function Barcode({
  value,
  height = 40,
  width = 1.6,
  fontSize = 12,
  className,
}: Props) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!ref.current) return
    try {
      JsBarcode(ref.current, value, {
        format: 'CODE128',
        height,
        width,
        fontSize,
        margin: 4,
        displayValue: true,
      })
    } catch {
      // valor invalido para CODE128 — no debería pasar con nuestros códigos generados
    }
  }, [value, height, width, fontSize])

  return <svg ref={ref} className={className} />
}
