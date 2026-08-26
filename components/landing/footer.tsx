import Link from 'next/link'

import { publicEnvironment } from '@/config/public-env'
import { Brand } from './brand'
import { navLinks, productNavigation } from './content'

export function Footer() {
  const year = new Date().getFullYear()
  const number = publicEnvironment.NEXT_PUBLIC_WHATSAPP_NUMBER
  const email = publicEnvironment.NEXT_PUBLIC_CONTACT_EMAIL
  const message = encodeURIComponent(
    'Olá! Conheci a Ciclera e gostaria de conversar sobre a plataforma para minha empresa.',
  )

  return (
    <footer className="border-t border-border bg-card text-foreground">
      <div className="container-page grid gap-12 py-14 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <div>
          <Brand />
          <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">
            Gestão de ordens de serviço para conectar campo, escritório e
            faturamento.
          </p>
          <p className="mt-8 text-xs font-semibold text-primary">
            Do chamado ao caixa.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">
            Produto
          </p>
          <nav
            className="mt-5 flex flex-col gap-3.5"
            aria-label="Produto no rodapé"
          >
            {productNavigation.map(({ title, href }) => (
              <Link
                className="w-fit text-sm hover:text-primary"
                key={href}
                href={href}
              >
                {title}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">
            Explorar
          </p>
          <nav
            className="mt-5 flex flex-col gap-3.5"
            aria-label="Navegação institucional no rodapé"
          >
            {navLinks.map(([label, href]) => (
              <Link
                className="w-fit text-sm hover:text-primary"
                key={href}
                href={href}
              >
                {label}
              </Link>
            ))}
            <Link href="/login" className="w-fit text-sm hover:text-primary">
              Entrar
            </Link>
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">
            Contato e legal
          </p>
          <div className="mt-5 flex flex-col gap-3.5 text-sm">
            <a
              href={`mailto:${email}`}
              className="break-all hover:text-primary"
            >
              {email}
            </a>
            {number ? (
              <a
                href={`https://wa.me/${number.replace(/\D/g, '')}?text=${message}`}
                target="_blank"
                rel="noreferrer"
                className="w-fit hover:text-primary"
              >
                WhatsApp
              </a>
            ) : null}
            <Link
              href="/politica-de-privacidade"
              className="w-fit hover:text-primary"
            >
              Política de Privacidade
            </Link>
            <Link href="/termos-de-uso" className="w-fit hover:text-primary">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Ciclera. Todos os direitos reservados.</span>
          <span>Software brasileiro para operações externas.</span>
        </div>
      </div>
    </footer>
  )
}
