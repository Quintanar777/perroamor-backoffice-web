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

export default function NotFoundPage() {
  return (
    <main className="bg-background flex min-h-[100dvh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl">🦴</div>
          <CardTitle>Página no encontrada</CardTitle>
          <CardDescription>La ruta no existe o se mudó.</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center text-sm">
          Volvé al dashboard y seguí desde ahí.
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild size="lg">
            <Link to="/">Volver al dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
