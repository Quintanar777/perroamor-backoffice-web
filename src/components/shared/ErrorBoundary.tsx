import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children
    if (this.props.fallback) return this.props.fallback

    return (
      <main className="bg-background flex min-h-[100dvh] items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-destructive/10 text-destructive mx-auto flex size-12 items-center justify-center rounded-full">
              <AlertTriangle className="size-6" />
            </div>
            <CardTitle>Algo se rompió</CardTitle>
            <CardDescription>Ocurrió un error inesperado en la aplicación.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-center text-xs break-words">
            {this.state.error.message}
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={this.handleReload} size="lg">
              <RefreshCcw className="size-4" />
              Recargar
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }
}
