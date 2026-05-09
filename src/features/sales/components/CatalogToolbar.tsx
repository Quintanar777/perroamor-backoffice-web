import { Boxes, Layers, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import type { Brand } from '@/lib/types/catalog'

export type CatalogTab = 'products' | 'combos'

const ALL = '__all__'

interface Props {
  tab: CatalogTab
  onTabChange: (tab: CatalogTab) => void
  brandId: string
  onBrandChange: (brandId: string) => void
  search: string
  onSearchChange: (search: string) => void
  brands: Brand[]
}

export function CatalogToolbar({
  tab,
  onTabChange,
  brandId,
  onBrandChange,
  search,
  onSearchChange,
  brands,
}: Props) {
  const activeBrands = brands.filter((b) => b.isActive)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={(v) => onTabChange(v as CatalogTab)}>
          <TabsList className="h-12">
            <TabsTrigger value="products" className="gap-2 px-4">
              <Boxes className="size-4" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="combos" className="gap-2 px-4">
              <Layers className="size-4" />
              Combos
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar..."
            className="h-12 pl-9"
          />
        </div>
      </div>

      <ToggleGroup
        type="single"
        value={brandId}
        onValueChange={(v) => v && onBrandChange(v)}
        variant="outline"
        className="flex-wrap justify-start"
      >
        <ToggleGroupItem value={ALL} className="px-4">
          Todas
        </ToggleGroupItem>
        {activeBrands.map((b) => (
          <ToggleGroupItem key={b.id} value={String(b.id)} className="px-4">
            {b.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

export const ALL_BRANDS = ALL
