import { Construction } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  phase: string
  feature: string
}

export function ComingSoon({ phase, feature }: Props) {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center text-center">
        <div className="bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-full">
          <Construction className="size-6" />
        </div>
        <CardTitle>En construcción</CardTitle>
        <CardDescription>
          {feature} se implementa en{' '}
          <Badge variant="secondary" className="font-mono">
            {phase}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-center text-sm">
        Por ahora la ruta existe, el layout responde y la nav funciona.
      </CardContent>
    </Card>
  )
}
