import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { loginSchema, type LoginInput } from '@/features/auth/schemas/loginSchema'
import { useAuthStore } from '@/lib/auth/store'
import { ApiError } from '@/lib/types/api'

type LoginField = keyof LoginInput

export default function LoginPage() {
  const user = useAuthStore((s) => s.user)
  const login = useLogin()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  useEffect(() => {
    if (login.error instanceof ApiError && login.error.errors) {
      for (const fieldError of login.error.errors) {
        if (fieldError.field === 'username' || fieldError.field === 'password') {
          form.setError(fieldError.field as LoginField, {
            message: fieldError.message,
          })
        }
      }
    }
  }, [login.error, form])

  if (user) return <Navigate to="/" replace />

  const handleSubmit = form.handleSubmit((values) => {
    login.mutate(values)
  })

  return (
    <main className="bg-background flex min-h-[100dvh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl">🐕</div>
          <CardTitle>Perro Amor Backoffice</CardTitle>
          <CardDescription>Ingresa con tu usuario y contraseña.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        disabled={login.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        disabled={login.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={login.isPending}
              >
                {login.isPending && <Loader2 className="size-4 animate-spin" />}
                Ingresar
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  )
}
