import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuthStore } from '@/lib/auth/store'

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handleMockLogin = () => {
    setAuth({
      accessToken: 'dev-mock-access-token',
      refreshToken: 'dev-mock-refresh-token',
      user: {
        id: 0,
        username: 'demo',
        fullName: 'Demo Erick',
        role: 'ADMIN',
        isActive: true,
      },
    })
    navigate('/', { replace: true })
  }

  return (
    <main className="bg-background flex min-h-[100dvh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl">🐕</div>
          <CardTitle>Perro Amor Backoffice</CardTitle>
          <CardDescription>El login real llega en Fase 2.</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center text-sm">
          Por ahora podés entrar con un usuario fake para validar el layout y la nav.
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button size="lg" onClick={handleMockLogin}>
            Entrar como Demo
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
