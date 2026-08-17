import { ArrowRight, Check, CircleDot } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section
      id="inicio"
      className="overflow-hidden bg-background pb-20 pt-16 lg:pb-28 lg:pt-24"
    >
      <div className="container-page grid items-center gap-14 lg:grid-cols-[1.02fr_.98fr]">
        <div>
          <p className="eyebrow">
            Gestão de serviços externos orientada a receita
          </p>
          <h1 className="mt-5 max-w-3xl text-balance font-heading text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Nenhum serviço executado deve ficar sem faturar.
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            A Ciclera conecta planejamento, execução, evidências e revisão para
            mostrar quais serviços foram concluídos, quais estão bloqueados e
            quanto já está pronto para faturar.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/registro"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Criar minha conta
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-card px-6 font-semibold transition hover:bg-muted"
            >
              Conhecer a plataforma
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Comece pelo navegador e configure sua operação no seu ritmo.
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {[
              'Para equipes com 5–30 técnicos',
              'Acesso pelo navegador',
              'Implantação acompanhada',
            ].map((x) => (
              <li className="flex items-center gap-2" key={x}>
                <Check className="size-4 text-primary" />
                {x}
              </li>
            ))}
          </ul>
        </div>
        <HeroMockup />
      </div>
    </section>
  )
}
function HeroMockup() {
  return (
    <div className="relative">
      <div className="rounded-3xl bg-institutional p-3 shadow-2xl sm:p-5">
        <div className="rounded-2xl bg-card p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                Demonstração
              </span>
              <h2 className="mt-4 font-heading text-xl font-semibold">
                Visão operacional
              </h2>
            </div>
            <CircleDot className="size-6 text-active" />
          </div>
          <div className="mt-7 rounded-2xl bg-institutional p-5 text-primary-foreground">
            <p className="text-sm text-primary-foreground/60">
              Serviços prontos para faturar
            </p>
            <p className="mt-2 font-heading text-4xl font-semibold text-accent">
              R$ 14.850
            </p>
            <p className="mt-2 text-sm text-primary-foreground/65">
              12 ordens revisadas
            </p>
          </div>
          <div className="mt-5 rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <strong>OS #1842</strong>
                <p className="text-sm text-muted-foreground">
                  Clima Norte · Unidade condensadora
                </p>
              </div>
              <span className="rounded-full bg-active/15 px-3 py-1 text-xs font-semibold text-institutional">
                Revisada
              </span>
            </div>
            <ol className="mt-5 grid gap-3 text-sm">
              {[
                'Concluída em campo',
                'Evidências recebidas',
                'Revisada',
                'Pronta para faturar',
              ].map((x) => (
                <li key={x} className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-active" />
                  {x}
                </li>
              ))}
            </ol>
            <div className="mt-5 rounded-xl bg-accent/20 p-3 text-sm font-semibold">
              Serviço adicional registrado:{' '}
              <span className="text-primary">R$ 480</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Dados exclusivamente demonstrativos.
          </p>
        </div>
      </div>
    </div>
  )
}
