'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { Brand } from './brand'
import { navLinks, productNavigation } from './content'

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [productOpen, setProductOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [interactive, setInteractive] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setInteractive(true), 0)
    const onScroll = () => setScrolled(window.scrollY > 12)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setProductOpen(false)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b bg-card/96 backdrop-blur-xl transition-shadow duration-300',
        scrolled
          ? 'border-border shadow-[0_8px_32px_rgba(9,46,46,.08)]'
          : 'border-border/70',
      )}
    >
      <div className="container-page flex h-20 items-center justify-between">
        <Link
          href="/#inicio"
          aria-label="Ciclera — início"
          className="shrink-0"
        >
          <Brand />
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Navegação principal"
        >
          <div
            className="relative"
            onMouseEnter={() => setProductOpen(true)}
            onMouseLeave={() => setProductOpen(false)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setProductOpen(false)
              }
            }}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
              aria-haspopup="true"
              aria-expanded={productOpen}
              aria-controls="landing-product-menu"
              onClick={() => setProductOpen((current) => !current)}
              onFocus={() => setProductOpen(true)}
            >
              Produto
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform duration-200',
                  productOpen && 'rotate-180',
                )}
              />
            </button>
            <div
              id="landing-product-menu"
              className={cn(
                'absolute left-1/2 top-full w-[38rem] -translate-x-1/2 pt-4 transition-[opacity,transform,visibility] duration-200',
                productOpen
                  ? 'visible pointer-events-auto translate-y-1 opacity-100'
                  : 'invisible pointer-events-none opacity-0',
              )}
            >
              <div className="overflow-hidden border border-border bg-card shadow-[0_24px_70px_rgba(9,46,46,.16)]">
                <div className="grid grid-cols-[1.45fr_.55fr]">
                  <div className="p-3">
                    {productNavigation.map(
                      ({ title, description, href, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setProductOpen(false)}
                          className="group/item flex gap-4 border-b border-border/70 px-3 py-4 last:border-b-0 hover:bg-muted/55"
                        >
                          <span className="grid size-10 shrink-0 place-items-center bg-primary/8 text-primary">
                            <Icon className="size-4.5" />
                          </span>
                          <span>
                            <span className="flex items-center gap-1.5 font-heading text-sm font-semibold">
                              {title}
                              <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover/item:opacity-100" />
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                              {description}
                            </span>
                          </span>
                        </Link>
                      ),
                    )}
                  </div>
                  <div className="flex flex-col justify-between bg-institutional p-5 text-primary-foreground">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-active">
                        Do chamado ao caixa
                      </p>
                      <p className="mt-3 font-heading text-lg font-semibold leading-snug">
                        Conheça o fluxo completo da Ciclera.
                      </p>
                    </div>
                    <Link
                      href="/registro"
                      onClick={() => setProductOpen(false)}
                      className="mt-8 flex items-center justify-between border-t border-primary-foreground/15 pt-4 text-sm font-semibold"
                    >
                      Criar minha conta
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {navLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          <Link
            href="/login"
            className="px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:text-primary"
          >
            Entrar
          </Link>
          <Link
            href="/registro"
            className="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-institutional"
          >
            Criar conta
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          disabled={!interactive}
          className="inline-flex size-11 items-center justify-center border border-border bg-background text-foreground disabled:pointer-events-none lg:hidden"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-border bg-card lg:hidden"
          aria-label="Navegação móvel"
        >
          <div className="container-page max-h-[calc(100vh-5rem)] overflow-y-auto py-5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Produto
            </p>
            <div className="mt-2 grid gap-1">
              {productNavigation.map(({ title, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 border-b border-border/70 px-3 py-3.5 font-medium last:border-b-0"
                >
                  <Icon className="size-4.5 text-primary" />
                  {title}
                </Link>
              ))}
            </div>
            <div className="mt-5 grid gap-1 border-t border-border pt-4">
              {navLinks.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={pathname === href ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 font-medium"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-5">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-center border border-border font-semibold"
              >
                Entrar
              </Link>
              <Link
                href="/registro"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-center bg-primary font-semibold text-primary-foreground"
              >
                Criar conta
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
