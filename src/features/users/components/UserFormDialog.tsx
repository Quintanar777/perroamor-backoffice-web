import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  createUserSchema,
  updateUserSchema,
  type UpdateUserFormInput,
} from '@/features/users/schemas/userSchema'
import { useCreateUser, useUpdateUser } from '@/features/users/hooks/useUsers'
import { applyServerErrors } from '@/lib/forms/applyServerErrors'
import type { User, UserRole } from '@/lib/types/user'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

const KNOWN_FIELDS = [
  'username',
  'email',
  'fullName',
  'password',
  'role',
  'isActive',
] as const

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'MANAGER', label: 'Gerente' },
  { value: 'EMPLOYEE', label: 'Empleado' },
]

export function UserFormDialog({ open, onOpenChange, user }: Props) {
  const isEdit = user !== null
  const create = useCreateUser()
  const update = useUpdateUser()
  const pending = create.isPending || update.isPending

  const form = useForm<UpdateUserFormInput>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      password: '',
      role: 'EMPLOYEE',
      isActive: true,
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      user
        ? {
            username: user.username,
            email: user.email ?? '',
            fullName: user.fullName,
            password: '',
            role: user.role,
            isActive: user.isActive,
          }
        : {
            username: '',
            email: '',
            fullName: '',
            password: '',
            role: 'EMPLOYEE',
            isActive: true,
          },
    )
  }, [user, open, form])

  const onSubmit = form.handleSubmit(async (values) => {
    const password = (values.password ?? '').trim()
    try {
      if (user) {
        await update.mutateAsync({
          id: user.id,
          body: {
            username: values.username.trim(),
            email: values.email.trim(),
            fullName: values.fullName.trim(),
            password: password.length > 0 ? password : undefined,
            role: values.role,
            isActive: values.isActive,
          },
        })
      } else {
        await create.mutateAsync({
          username: values.username.trim(),
          email: values.email.trim(),
          fullName: values.fullName.trim(),
          password,
          role: values.role,
        })
      }
      onOpenChange(false)
    } catch (error) {
      applyServerErrors(error, {
        setError: (field, err) =>
          form.setError(field as keyof UpdateUserFormInput, err),
        knownFields: [...KNOWN_FIELDS],
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualizá los datos del usuario. Dejá la contraseña vacía para conservarla.'
              : 'Creá un nuevo usuario del sistema.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input autoFocus disabled={pending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" disabled={pending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input disabled={pending} {...field} />
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
                  <FormLabel>
                    {isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      disabled={pending}
                      placeholder={isEdit ? 'Dejá vacío para no cambiar' : ''}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={pending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isEdit && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <Label>Estado</Label>
                    <ToggleGroup
                      type="single"
                      value={field.value ? 'active' : 'inactive'}
                      onValueChange={(v) => v && field.onChange(v === 'active')}
                      disabled={pending}
                      className="justify-start"
                    >
                      <ToggleGroupItem value="active">Activo</ToggleGroupItem>
                      <ToggleGroupItem value="inactive">Inactivo</ToggleGroupItem>
                    </ToggleGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? 'Guardar cambios' : 'Crear usuario'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
