'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Brand } from './brand'
import { nav } from './content'
import { cn } from '@/lib/utils'

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={cn('sticky top-0 z-50 border-b transition-all duration-200', scrolled ? 'border-border bg-background/90 shadow-sm backdrop-blur-md' : 'border-transparent bg-background')}>
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="#inicio" aria-label="Ciclera — início"><Brand /></a>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
          {nav.map(([label, href]) => <a key={href} href={href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{label}</a>)}
        </nav>
        <a href="#contato" className="hidden rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 lg:inline-flex">Quero participar do piloto</a>
        <button type="button" onClick={() => setOpen(!open)} className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-card lg:hidden" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="border-t border-border bg-background px-5 py-5 lg:hidden" aria-label="Navegação móvel"><div className="mx-auto flex max-w-7xl flex-col gap-1">{nav.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-medium hover:bg-muted">{label}</a>)}<a href="#contato" onClick={() => setOpen(false)} className="mt-3 rounded-xl bg-primary px-5 py-3 text-center font-semibold text-primary-foreground">Quero participar do piloto</a></div></nav>}
    </header>
  )
}
