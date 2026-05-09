import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  page: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: Props) {
  const start = totalElements === 0 ? 0 : page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, totalElements)
  const canPrev = page > 0
  const canNext = page + 1 < totalPages

  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-muted-foreground text-sm">
        {totalElements === 0
          ? 'Sin resultados'
          : `Mostrando ${start}–${end} de ${totalElements}`}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground hidden text-sm sm:inline">
          Página {page + 1} de {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Página anterior"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Página siguiente"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
