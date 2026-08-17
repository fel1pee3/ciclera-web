import { CheckCircle2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Brand } from '@/components/landing/brand'

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eff6f2] px-4 py-4 sm:px-6 sm:py-6 lg:grid lg:place-items-center lg:px-8">
      <div
        aria-hidden="true"
        className="absolute -left-32 -top-32 size-96 rounded-full bg-secondary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-48 -right-24 size-[30rem] rounded-full bg-accent/20 blur-3xl"
      />

      <section className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-card shadow-[0_28px_80px_-34px_rgba(9,46,46,0.38)] lg:min-h-[720px] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-[#dcece7] p-10 text-foreground lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div
            aria-hidden="true"
            className="absolute -right-20 top-20 size-72 rounded-full border border-primary/10 bg-white/35"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -left-20 size-80 rounded-full bg-secondary/15 blur-2xl"
          />

          <Link
            className="relative w-fit rounded-xl focus-visible:outline-white"
            href="/"
            aria-label="Voltar para a página inicial"
          >
            <Brand />
          </Link>

          <div className="relative max-w-md py-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/65 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-sm">
              <ShieldCheck aria-hidden="true" className="size-4" />
              Operação protegida
            </div>
            <h2 className="text-balance font-heading text-4xl font-semibold leading-tight tracking-tight xl:text-[2.7rem]">
              Sua operação organizada do chamado ao faturamento.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-foreground/65">
              Centralize equipe, clientes e ordens de serviço em um fluxo feito
              para operações externas.
            </p>

            <ul className="mt-9 space-y-4 text-sm text-foreground/80">
              {[
                'Ordens e agenda em um só lugar',
                'Execução simples para a equipe de campo',
                'Histórico e evidências preservados',
              ].map((benefit) => (
                <li className="flex items-center gap-3" key={benefit}>
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-5 shrink-0 text-primary"
                  />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs leading-relaxed text-foreground/50">
            Acesso protegido por sessão segura e isolamento entre organizações.
          </p>
        </aside>

        <div className="flex min-h-full flex-col bg-card p-6 sm:p-10 lg:p-12 xl:p-16">
          <Link
            className="mb-9 w-fit rounded-xl lg:hidden"
            href="/"
            aria-label="Voltar para a página inicial"
          >
            <Brand />
          </Link>
          <div className="my-auto w-full max-w-xl self-center">{children}</div>
        </div>
      </section>
    </main>
  )
}
