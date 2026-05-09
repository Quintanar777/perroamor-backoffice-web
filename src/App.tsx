import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="bg-background flex min-h-[100dvh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl">🐕</div>
          <CardTitle>Perro Amor Backoffice</CardTitle>
          <CardDescription>Fase 0 — Bootstrap completo</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center text-sm">
          Vite + React + TypeScript + Tailwind 4 + shadcn/ui andando.
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button size="lg" onClick={() => setCount((c) => c + 1)}>
            Tap counter: {count}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

export default App
