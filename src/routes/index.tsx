import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/routes/AppLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import LoginPage from '@/features/auth/pages/LoginPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import InventoryPage from '@/features/inventory/pages/InventoryPage'
import BrandsPage from '@/features/catalog/pages/BrandsPage'
import CombosPage from '@/features/catalog/pages/CombosPage'
import ProductsPage from '@/features/catalog/pages/ProductsPage'
import VariantsPage from '@/features/catalog/pages/VariantsPage'
import EventsPage from '@/features/events/pages/EventsPage'
import NewSalePage from '@/features/sales/pages/NewSalePage'
import SalesPage from '@/features/sales/pages/SalesPage'
import SaleDetailPage from '@/features/sales/pages/SaleDetailPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'products/:id/variants', element: <VariantsPage /> },
          { path: 'brands', element: <BrandsPage /> },
          { path: 'combos', element: <CombosPage /> },
          { path: 'events', element: <EventsPage /> },
          { path: 'sales', element: <SalesPage /> },
          { path: 'sales/new', element: <NewSalePage /> },
          { path: 'sales/:id', element: <SaleDetailPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
