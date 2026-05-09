import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { UserFormDialog } from '@/features/users/components/UserFormDialog'
import { useDeleteUser, useUsersQuery } from '@/features/users/hooks/useUsers'
import { useAuthStore } from '@/lib/auth/store'
import { formatDateTime } from '@/lib/format'
import type { User, UserRole } from '@/lib/types/user'

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  EMPLOYEE: 'Empleado',
}

export default function UsersPage() {
  const usersQuery = useUsersQuery()
  const deleteUser = useDeleteUser()
  const currentUser = useAuthStore((s) => s.user)

  const [editing, setEditing] = useState<User | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<User | null>(null)

  const formOpen = creating || editing !== null
  const closeForm = () => {
    setCreating(false)
    setEditing(null)
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteUser.mutateAsync(deleting)
      setDeleting(null)
    } catch {
      // toast handled by mutation
    }
  }

  const columns: DataTableColumn<User>[] = [
    {
      key: 'username',
      header: 'Username',
      cell: (u) => <span className="font-medium">{u.username}</span>,
    },
    {
      key: 'fullName',
      header: 'Nombre',
      cell: (u) => <span>{u.fullName}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      cell: (u) => (
        <span className="text-muted-foreground">{u.email ?? '—'}</span>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      headerClassName: 'w-32',
      cell: (u) => <Badge variant="secondary">{ROLE_LABELS[u.role]}</Badge>,
    },
    {
      key: 'status',
      header: 'Estado',
      headerClassName: 'w-24',
      cell: (u) => (
        <Badge variant={u.isActive ? 'default' : 'secondary'}>
          {u.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Último login',
      headerClassName: 'w-44',
      cell: (u) => (
        <span className="text-muted-foreground tabular-nums">
          {u.lastLogin ? formatDateTime(u.lastLogin) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Acciones</span>,
      headerClassName: 'w-28 text-right',
      className: 'text-right',
      cell: (u) => {
        const isSelf = currentUser?.id === u.id
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Editar ${u.username}`}
              onClick={() => setEditing(u)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Eliminar ${u.username}`}
              onClick={() => setDeleting(u)}
              disabled={isSelf}
              title={isSelf ? 'No podés eliminar tu propia cuenta' : undefined}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const data = usersQuery.data ?? []
  const isEmpty = !usersQuery.isLoading && data.length === 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Administradores, gerentes y empleados con acceso al sistema."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Nuevo usuario
          </Button>
        }
      />

      {isEmpty ? (
        <EmptyState
          icon={<span className="text-4xl">👥</span>}
          title="Todavía no hay usuarios"
          description="Creá el primero para empezar a dar acceso al sistema."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Nuevo usuario
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          rowKey={(u) => u.id}
          loading={usersQuery.isLoading}
        />
      )}

      <UserFormDialog
        open={formOpen}
        onOpenChange={(open) => (open ? null : closeForm())}
        user={editing}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Eliminar "${deleting?.username ?? ''}"?`}
        description="El usuario quedará inactivo y no podrá iniciar sesión. Esta acción se puede revertir editándolo."
        confirmLabel="Eliminar"
        destructive
        loading={deleteUser.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
