import { Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Props {
  discountName: string
}

export function DiscountBadge({ discountName }: Props) {
  return (
    <Badge variant="secondary" className="gap-1 font-normal">
      <Tag className="size-3" />
      {discountName}
    </Badge>
  )
}
