import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  Boxes,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Menu,
  Package,
  PlusCircle,
  Receipt,
  Tag,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useAuthStore } from '@/lib/auth/store'
import { cn } from '@/lib/utils'

interface NavItemDef {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const NAV_ITEMS: NavItemDef[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/inventory', label: 'Inventario', icon: Package },
  { to: '/products', label: 'Productos', icon: Boxes },
  { to: '/brands', label: 'Marcas', icon: Tag },
  { to: '/events', label: 'Eventos', icon: CalendarDays },
  { to: '/sales/new', label: 'Nueva Venta', icon: PlusCircle },
  { to: '/sales', label: 'Ventas', icon: Receipt, end: true },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function NavItem({ item, onNavigate }: { item: NavItemDef; onNavigate?: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/80',
        )
      }
    >
      <item.icon className="size-5 shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  )
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-2 px-3 py-4">
      <span className="text-2xl">🐕</span>
      <span className="font-semibold tracking-tight">Perro Amor</span>
    </div>
  )
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 pb-4">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.to} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  )
}

function UserBadge({ collapsedLabel = false }: { collapsedLabel?: boolean }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return null
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Avatar className="size-9">
        <AvatarFallback>{getInitials(user.fullName || user.username)}</AvatarFallback>
      </Avatar>
      {!collapsedLabel && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.fullName || user.username}</p>
          <p className="text-muted-foreground truncate text-xs capitalize">
            {user.role.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  )
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const logout = useLogout()
  const user = useAuthStore((s) => s.user)

  const handleLogout = () => {
    logout.mutate()
  }

  const desktopSidebar = (
    <aside className="bg-sidebar text-sidebar-foreground hidden w-64 shrink-0 flex-col border-r md:flex">
      <SidebarBrand />
      <Separator />
      <UserBadge />
      <Separator />
      <SidebarNav />
      <Separator />
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="size-5" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )

  return (
    <div className="bg-background flex min-h-[100dvh]">
      {desktopSidebar}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-4 backdrop-blur md:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col p-0">
              <SheetHeader className="px-3 py-4">
                <SheetTitle className="flex items-center gap-2">
                  <span className="text-2xl">🐕</span>
                  <span>Perro Amor</span>
                </SheetTitle>
              </SheetHeader>
              <Separator />
              <UserBadge />
              <Separator />
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
              <Separator />
              <div className="p-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    setMobileOpen(false)
                    handleLogout()
                  }}
                >
                  <LogOut className="size-5" />
                  Cerrar sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Menú de usuario">
                    <Avatar className="size-8">
                      <AvatarFallback>
                        {getInitials(user.fullName || user.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {user.fullName || user.username}
                      </span>
                      <span className="text-muted-foreground text-xs capitalize">
                        {user.role.toLowerCase()}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="size-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
