import { Badge } from '@/components/ui/badge'
import { getContrastTextColor } from '@/lib/color'
import { cn } from '@/lib/utils'

interface Props {
  name: string
  color: string | null
  className?: string
}

export function BrandBadge({ name, color, className }: Props) {
  if (color) {
    return (
      <Badge
        className={cn('border-transparent', className)}
        style={{
          backgroundColor: color,
          color: getContrastTextColor(color),
        }}
      >
        {name}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className={className}>
      {name}
    </Badge>
  )
}
