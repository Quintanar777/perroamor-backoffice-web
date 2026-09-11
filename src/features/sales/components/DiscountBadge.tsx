import { Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Props {
  discountName: string
  /**
   * 'confirmed' (default): server-confirmed post-checkout discount, solid
   * treatment. 'preview': live estimate from the quote endpoint before
   * checkout — visually distinct (outline) so a vendor can never mistake an
   * estimate for a locked-in price.
   */
  variant?: 'confirmed' | 'preview'
}

export function DiscountBadge({ discountName, variant = 'confirmed' }: Props) {
  return (
    <Badge
      variant={variant === 'preview' ? 'outline' : 'secondary'}
      className="gap-1 font-normal"
      title={variant === 'preview' ? 'Descuento estimado (aún no confirmado)' : undefined}
    >
      <Tag className="size-3" />
      {discountName}
      {variant === 'preview' && <span className="text-[10px] uppercase opacity-70">(estimado)</span>}
    </Badge>
  )
}
