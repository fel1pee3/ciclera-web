'use client'

import { CalendarDays, ExternalLink, FileText, ReceiptText } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { listSubscriptionPayments } from './api'
import type { SubscriptionPayment, SubscriptionPaymentPage } from './contracts'

const pageSize = 8

export function SubscriptionPaymentHistory({
  organizationTimezone,
}: {
  organizationTimezone: string
}) {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<SubscriptionPaymentPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    return listSubscriptionPayments({ page, pageSize })
      .then(setResult)
      .catch(() => {
        setError('Não foi possível carregar o histórico de pagamentos.')
      })
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b bg-muted/25 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ReceiptText aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              Histórico de pagamentos
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Consulte mensalidades, vencimentos e documentos disponibilizados
              pelo Asaas.
            </p>
          </div>
        </div>
        {result?.total ? (
          <span className="text-sm font-medium text-muted-foreground">
            {result.total} {result.total === 1 ? 'registro' : 'registros'}
          </span>
        ) : null}
      </div>

      <div className="p-5 sm:p-6">
        {error ? (
          <Alert variant="destructive">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                onClick={() => {
                  setLoading(true)
                  setError(null)
                  void load()
                }}
              >
                Tentar novamente
              </Button>
            </div>
          </Alert>
        ) : null}

        {loading ? (
          <div className="space-y-3" aria-label="Carregando pagamentos">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        ) : null}

        {!loading && !error && result?.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-5 py-10 text-center">
            <FileText
              aria-hidden="true"
              className="mx-auto size-8 text-muted-foreground"
            />
            <h3 className="mt-4 font-heading text-lg font-semibold">
              Nenhum pagamento registrado
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              As mensalidades aparecerão aqui após serem criadas pelo Asaas.
            </p>
          </div>
        ) : null}

        {!loading && !error && result?.items.length ? (
          <div className="space-y-3">
            {result.items.map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                organizationTimezone={organizationTimezone}
              />
            ))}
          </div>
        ) : null}

        {result && result.total > result.pageSize ? (
          <nav
            className="mt-5 flex items-center justify-between border-t pt-5"
            aria-label="Paginação do histórico de pagamentos"
          >
            <Button
              variant="outline"
              disabled={loading || result.page === 1}
              onClick={() => {
                setLoading(true)
                setError(null)
                setPage(result.page - 1)
              }}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {result.page} de{' '}
              {Math.ceil(result.total / result.pageSize)}
            </span>
            <Button
              variant="outline"
              disabled={
                loading || result.page * result.pageSize >= result.total
              }
              onClick={() => {
                setLoading(true)
                setError(null)
                setPage(result.page + 1)
              }}
            >
              Próxima
            </Button>
          </nav>
        ) : null}

        <p className="mt-5 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
          A Ciclera registra a situação da assinatura, mas não emite nota
          fiscal. Cobranças e comprovantes são disponibilizados pelo Asaas.
        </p>
      </div>
    </Card>
  )
}

function PaymentRow({
  payment,
  organizationTimezone,
}: {
  payment: SubscriptionPayment
  organizationTimezone: string
}) {
  const presentation = paymentPresentation(payment)
  return (
    <article className="grid gap-4 rounded-2xl border bg-background p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="font-heading text-lg">
            {formatMoney(payment.amountInCents)}
          </strong>
          <Badge className={presentation.className} variant="outline">
            {presentation.label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {paymentMethodLabel(payment.paymentMethod)}
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
          <span className="inline-flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="size-4" />
            Vencimento {formatDueDate(payment.dueDate)}
          </span>
          {payment.paidAt ? (
            <span>
              Pago em {formatDateTime(payment.paidAt, organizationTimezone)}
            </span>
          ) : null}
        </div>
      </div>
      {payment.invoiceUrl ? (
        <a
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full sm:w-auto',
          )}
          href={payment.invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {presentation.documentLabel}
          <ExternalLink aria-hidden="true" />
        </a>
      ) : (
        <span className="text-sm text-muted-foreground sm:text-right">
          Documento indisponível
        </span>
      )}
    </article>
  )
}

function paymentPresentation(payment: SubscriptionPayment) {
  const paid = payment.status === 'CONFIRMED' || payment.status === 'RECEIVED'
  const presentations = {
    PENDING: {
      label: 'Pendente',
      className: 'border-amber-200 bg-amber-50 text-amber-800',
    },
    CONFIRMED: {
      label: 'Confirmado',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    },
    RECEIVED: {
      label: 'Recebido',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    },
    OVERDUE: {
      label: 'Vencido',
      className: 'border-red-200 bg-red-50 text-red-700',
    },
    REFUNDED: {
      label: 'Estornado',
      className: 'border-slate-200 bg-slate-50 text-slate-700',
    },
    CHARGEBACK: {
      label: 'Contestado',
      className: 'border-red-200 bg-red-50 text-red-700',
    },
    CANCELED: {
      label: 'Cancelado',
      className: 'border-slate-200 bg-slate-50 text-slate-700',
    },
  } as const
  return {
    ...presentations[payment.status],
    documentLabel: paid ? 'Ver comprovante' : 'Ver cobrança',
  }
}

function paymentMethodLabel(method: SubscriptionPayment['paymentMethod']) {
  if (method === 'CREDIT_CARD') return 'Cartão de crédito'
  if (method === 'PIX') return 'Pix'
  return 'Boleto bancário'
}

function formatMoney(value: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value) / 100)
}

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(value))
}

function formatDateTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(value))
}
