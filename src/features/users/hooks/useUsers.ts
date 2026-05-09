import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usersApi, userKeys } from '@/lib/api/users'
import type { CreateUserInput, UpdateUserInput, User } from '@/lib/types/user'

export function useUsersQuery() {
  return useQuery({
    queryKey: userKeys.all(),
    queryFn: usersApi.list,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateUserInput) => usersApi.create(body),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: userKeys.all() })
      toast.success('Usuario creado', { description: user.username })
    },
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateUserInput }) =>
      usersApi.update(id, body),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: userKeys.all() })
      toast.success('Usuario actualizado', { description: user.username })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (user: User) => usersApi.remove(user.id),
    onSuccess: (_, user) => {
      qc.invalidateQueries({ queryKey: userKeys.all() })
      toast.success('Usuario eliminado', { description: user.username })
    },
  })
}
