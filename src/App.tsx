import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthGate } from '@/components/shared/AuthGate'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { env } from '@/lib/env'
import { queryClient } from '@/lib/query'
import { router } from '@/routes'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthGate>
            <RouterProvider router={router} />
          </AuthGate>
          <Toaster richColors position="top-right" />
          {env.isDev && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
