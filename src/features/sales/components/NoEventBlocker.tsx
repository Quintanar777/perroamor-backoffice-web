import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function NoEventBlocker() {
  return (
    <main className="flex min-h-[70dvh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl">📅</div>
          <CardTitle>No hay evento en curso</CardTitle>
          <CardDescription>
            Para registrar ventas necesitas un evento activo.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center text-sm">
          Crea un evento o espera a que arranque uno próximo.
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild size="lg">
            <Link to="/events">
              <CalendarDays className="size-4" />
              Ir a Eventos
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
