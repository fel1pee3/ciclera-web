import Link from 'next/link'
import { publicEnvironment } from '@/config/public-env'
import { Brand } from './brand'
import { nav } from './content'

export function Footer() {
  const year = new Date().getFullYear()
  const number = publicEnvironment.NEXT_PUBLIC_WHATSAPP_NUMBER
  const email = publicEnvironment.NEXT_PUBLIC_CONTACT_EMAIL
  const message = encodeURIComponent(
    'Olá! Conheci a Ciclera e gostaria de conversar sobre a plataforma para minha empresa.',
  )
  return (
    <footer className="border-t border-border bg-card py-12 text-foreground">
      <div className="container-page grid gap-10 md:grid-cols-3">
        <div>
          <Brand />
          <p className="mt-4 text-sm text-muted-foreground">
            Do chamado ao caixa.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Navegação</p>
          <nav className="mt-4 flex flex-col gap-3">
            {nav.map(([label, href]) => (
              <a
                className="text-sm text-muted-foreground hover:text-foreground"
                key={href}
                href={href}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div>
          <p className="text-sm font-semibold">Contato</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            <a href={`mailto:${email}`} className="hover:text-foreground">
              {email}
            </a>
            {number && (
              <a
                className="hover:text-foreground"
                href={`https://wa.me/${number.replace(/\D/g, '')}?text=${message}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            )}
            <Link
              href="/politica-de-privacidade"
              className="hover:text-foreground"
            >
              Política de Privacidade
            </Link>
            <Link href="/termos-de-uso" className="hover:text-foreground">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
      <div className="container-page mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
        © {year} Ciclera. Todos os direitos reservados.
      </div>
    </footer>
  )
}
