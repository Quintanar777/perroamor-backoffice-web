import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  Boxes,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Menu,
  PackagePlus,
  PanelLeftClose,
  PanelLeftOpen,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useAuthStore } from '@/lib/auth/store'
import { usePersistedToggle } from '@/lib/hooks/usePersistedToggle'
import { cn } from '@/lib/utils'

interface NavItemDef {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const NAV_ITEMS: NavItemDef[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Productos', icon: Boxes },
  { to: '/brands', label: 'Marcas', icon: Tag },
  { to: '/combos', label: 'Combos', icon: PackagePlus },
  { to: '/events', label: 'Eventos', icon: CalendarDays },
  { to: '/sales/new', label: 'Nueva Venta', icon: PlusCircle },
  { to: '/sales', label: 'Ventas', icon: Receipt, end: true },
]

const SIDEBAR_KEY = 'perroamor.sidebar.collapsed'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function NavItem({
  item,
  collapsed = false,
  onNavigate,
}: {
  item: NavItemDef
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const link = (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex h-12 w-full items-center rounded-lg text-sm font-medium transition-colors',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          collapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/80',
        )
      }
      aria-label={collapsed ? item.label : undefined}
    >
      <item.icon
        className={cn('size-5 shrink-0', collapsed && 'mx-auto')}
      />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  )
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center py-4',
        collapsed ? 'justify-center px-0' : 'gap-2 px-3',
      )}
    >
      <span className="text-2xl">🐕</span>
      {!collapsed && (
        <span className="font-semibold tracking-tight">Perro Amor</span>
      )}
    </div>
  )
}

function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-2 pb-4 pt-3">
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.to}
          item={item}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  )
}

function UserBadge({ collapsed = false }: { collapsed?: boolean }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return null
  return (
    <div
      className={cn(
        'flex items-center py-2',
        collapsed ? 'justify-center px-0' : 'gap-3 px-3',
      )}
    >
      <Avatar className="size-9">
        <AvatarFallback>{getInitials(user.fullName || user.username)}</AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {user.fullName || user.username}
          </p>
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
  const [collapsed, , toggleCollapsed] = usePersistedToggle(SIDEBAR_KEY, true)
  const logout = useLogout()
  const user = useAuthStore((s) => s.user)

  const handleLogout = () => {
    logout.mutate()
  }

  const desktopSidebar = (
    <aside
      className={cn(
        'bg-sidebar text-sidebar-foreground hidden shrink-0 flex-col border-r transition-[width] duration-200 ease-out md:flex',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div
        className={cn(
          'flex items-center border-b',
          collapsed ? 'flex-col gap-1 px-0 py-2' : 'justify-between px-1',
        )}
      >
        <SidebarBrand collapsed={collapsed} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-5" />
              ) : (
                <PanelLeftClose className="size-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? 'Expandir menú' : 'Contraer menú'}
          </TooltipContent>
        </Tooltip>
      </div>
      <UserBadge collapsed={collapsed} />
      <Separator />
      <SidebarNav collapsed={collapsed} />
      <Separator />
      <div className={cn(collapsed ? 'p-2' : 'p-3')}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full"
                aria-label="Cerrar sesión"
                onClick={handleLogout}
              >
                <LogOut className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Cerrar sesión</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
          >
            <LogOut className="size-5" />
            Cerrar sesión
          </Button>
        )}
      </div>
    </aside>
  )

  return (
    <TooltipProvider delayDuration={200}>
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
            <ErrorBoundary fallback={<FeatureCrashFallback />}>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}

function FeatureCrashFallback() {
  return (
    <div className="flex min-h-[40dvh] items-center justify-center">
      <div className="bg-card max-w-md space-y-3 rounded-lg border p-6 text-center">
        <span className="text-3xl">🦴</span>
        <h2 className="text-lg font-semibold">Esta sección se rompió</h2>
        <p className="text-muted-foreground text-sm">
          El resto de la app sigue funcionando. Probá recargar o moverte a otra
          sección desde el menú.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium"
        >
          Recargar
        </button>
      </div>
    </div>
  )
}
