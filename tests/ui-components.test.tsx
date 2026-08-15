import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

describe('UI primitives', () => {
  it('associates labels with text controls', () => {
    render(
      <>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" />
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" />
      </>,
    )

    expect(screen.getByLabelText('Nome')).toBeInstanceOf(HTMLInputElement)
    expect(screen.getByLabelText('Observações')).toBeInstanceOf(
      HTMLTextAreaElement,
    )
  })

  it('exposes feedback and status semantics', () => {
    render(
      <>
        <Alert role="alert">Revise os dados.</Alert>
        <Badge>Ativa</Badge>
        <Skeleton aria-label="Carregando ordens" />
      </>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Revise os dados.')
    expect(screen.getByText('Ativa')).toBeVisible()
    expect(
      screen.getByRole('status', { name: 'Carregando ordens' }),
    ).toBeVisible()
  })

  it('provides structured card and empty-state content', () => {
    render(
      <>
        <Card>
          <CardTitle>Ordem de serviço</CardTitle>
          <CardContent>Conteúdo operacional</CardContent>
        </Card>
        <EmptyState
          title="Nenhuma ordem"
          description="Crie a primeira ordem para começar."
          action={<Button>Criar ordem</Button>}
        />
      </>,
    )

    expect(
      screen.getByRole('heading', { name: 'Ordem de serviço' }),
    ).toBeVisible()
    expect(screen.getByRole('region', { name: 'Nenhuma ordem' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Criar ordem' })).toBeEnabled()
  })
})
