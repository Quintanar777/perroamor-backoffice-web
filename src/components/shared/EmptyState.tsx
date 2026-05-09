import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon = <span className="text-4xl">🦴</span>, title, description, action }: Props) {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center text-center">
        <div className="mx-auto flex size-16 items-center justify-center">{icon}</div>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {action && <CardContent className="flex justify-center">{action}</CardContent>}
    </Card>
  )
}
