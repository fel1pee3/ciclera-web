import type { ReactNode } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Card } from './card'

export function FilterPanel({
  activeFilterCount = 0,
  children,
  description,
  title = 'Refinar resultados',
}: {
  activeFilterCount?: number
  children: ReactNode
  description: string
  title?: string
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <SlidersHorizontal aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {activeFilterCount > 0 ? (
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {activeFilterCount}{' '}
            {activeFilterCount === 1 ? 'filtro ativo' : 'filtros ativos'}
          </span>
        ) : null}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </Card>
  )
}
