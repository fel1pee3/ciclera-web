'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { buildApiUrl } from '@/lib/api/config'
import { findReview, getReviewEvidenceReadUrl } from './api'
import type { ReviewDetails } from './contracts'
import { formatMoney } from './review-queue'

export function ReviewDetail() {
  const { workOrderId } = useParams<{ workOrderId: string }>()
  const [review, setReview] = useState<ReviewDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [evidenceUrls, setEvidenceUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true
    void findReview(workOrderId)
      .then((value) => active && setReview(value))
      .catch(
        () =>
          active &&
          setError(
            'Esta ordem não está mais disponível para revisão. Atualize a fila.',
          ),
      )
    return () => {
      active = false
    }
  }, [workOrderId])

  async function viewEvidence(id: string) {
    try {
      const result = await getReviewEvidenceReadUrl(id)
      setEvidenceUrls((current) => ({
        ...current,
        [id]: buildApiUrl(result.url),
      }))
    } catch {
      setError('Não foi possível autorizar a visualização desta evidência.')
    }
  }

  if (!review && !error) {
    return (
      <Skeleton
        className="mx-auto h-96 max-w-6xl rounded-2xl"
        aria-label="Carregando revisão"
      />
    )
  }
  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <Link className="font-semibold text-primary" href="/app/revisao">
        ← Voltar para revisão
      </Link>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {review ? (
        <>
          <Card className="p-6">
            <p className="eyebrow">{review.number}</p>
            <h1 className="mt-2 font-heading text-3xl font-bold">
              {review.title}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {review.customer.name} · {review.location.name}
            </p>
            <p className="mt-4 whitespace-pre-wrap">{review.description}</p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
              <Data label="Local" value={review.location.address} />
              <Data
                label="Equipamento"
                value={review.equipment?.name ?? 'Não informado'}
              />
              <Data
                label="Valor previsto"
                value={formatMoney(review.expectedAmountInCents)}
              />
            </dl>
          </Card>
          <Card className="p-5">
            <h2 className="font-heading text-xl font-bold">Execução</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm">
              {review.execution.notes ?? 'Sem observações.'}
            </p>
          </Card>
          <Card className="p-5">
            <h2 className="font-heading text-xl font-bold">Checklist</h2>
            {review.execution.checklist ? (
              <dl className="mt-4 space-y-3">
                {review.execution.checklist.snapshot.fields.map((field) => {
                  const answer = review.execution.checklist?.responses.find(
                    (item) => item.fieldId === field.id,
                  )
                  return (
                    <Data
                      key={field.id}
                      label={field.label}
                      value={answer ? String(answer.value) : 'Não respondido'}
                    />
                  )
                })}
              </dl>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Sem checklist.
              </p>
            )}
          </Card>
          <Card className="p-5">
            <h2 className="font-heading text-xl font-bold">Evidências</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {review.execution.evidence.map((item) => (
                <div className="rounded-xl border p-3" key={item.id}>
                  <p className="truncate font-semibold">
                    {item.kind === 'SIGNATURE' ? 'Assinatura' : item.fileName}
                  </p>
                  {evidenceUrls[item.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- authorized temporary URL
                    <img
                      className="mt-3 max-h-72 w-full rounded-lg object-contain"
                      src={evidenceUrls[item.id]}
                      alt="Evidência privada"
                    />
                  ) : null}
                  <Button
                    className="mt-3 w-full"
                    variant="outline"
                    onClick={() => void viewEvidence(item.id)}
                  >
                    Visualizar temporariamente
                  </Button>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex justify-between gap-4">
              <h2 className="font-heading text-xl font-bold">
                Itens adicionais
              </h2>
              <strong>{formatMoney(review.additionalTotalInCents)}</strong>
            </div>
            <ul className="mt-4 divide-y">
              {review.execution.additionalItems.map((item) => (
                <li className="flex justify-between gap-4 py-3" key={item.id}>
                  <span>
                    {item.description} · {item.quantity}
                  </span>
                  <strong>{formatMoney(item.totalAmountInCents)}</strong>
                </li>
              ))}
            </ul>
          </Card>
        </>
      ) : null}
    </section>
  )
}

function Data({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
