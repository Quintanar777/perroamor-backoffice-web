import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RouteFallback } from '@/components/shared/RouteFallback'
import { AppLayout } from '@/routes/AppLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

const lazyDefault = <T extends ComponentType<unknown>>(
  importer: () => Promise<{ default: T }>,
) => lazy(importer)

const LoginPage = lazyDefault(() => import('@/features/auth/pages/LoginPage'))
const DashboardPage = lazyDefault(
  () => import('@/features/dashboard/pages/DashboardPage'),
)
const BrandsPage = lazyDefault(
  () => import('@/features/catalog/pages/BrandsPage'),
)
const CombosPage = lazyDefault(
  () => import('@/features/catalog/pages/CombosPage'),
)
const ProductsPage = lazyDefault(
  () => import('@/features/catalog/pages/ProductsPage'),
)
const VariantsPage = lazyDefault(
  () => import('@/features/catalog/pages/VariantsPage'),
)
const EventsPage = lazyDefault(
  () => import('@/features/events/pages/EventsPage'),
)
const NewSalePage = lazyDefault(
  () => import('@/features/sales/pages/NewSalePage'),
)
const SalesPage = lazyDefault(() => import('@/features/sales/pages/SalesPage'))
const SaleDetailPage = lazyDefault(
  () => import('@/features/sales/pages/SaleDetailPage'),
)
const NotFoundPage = lazyDefault(() => import('@/pages/NotFoundPage'))

const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{node}</Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: withSuspense(<DashboardPage />) },
          { path: 'products', element: withSuspense(<ProductsPage />) },
          {
            path: 'products/:id/variants',
            element: withSuspense(<VariantsPage />),
          },
          { path: 'brands', element: withSuspense(<BrandsPage />) },
          { path: 'combos', element: withSuspense(<CombosPage />) },
          { path: 'events', element: withSuspense(<EventsPage />) },
          { path: 'sales', element: withSuspense(<SalesPage />) },
          { path: 'sales/new', element: withSuspense(<NewSalePage />) },
          { path: 'sales/:id', element: withSuspense(<SaleDetailPage />) },
        ],
      },
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
])
