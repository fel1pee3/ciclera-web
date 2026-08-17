'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { NavigationItem } from '@/config/navigation'
import { cn } from '@/lib/utils'

export function ShellNavigation({
  items,
  onNavigate,
  collapsed = false,
}: {
  items: readonly NavigationItem[]
  onNavigate?: () => void
  collapsed?: boolean
}) {
  const pathname = usePathname()
  const activeHref = items
    .filter(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((left, right) => right.href.length - left.href.length)[0]?.href

  return (
    <nav aria-label="Navegação principal">
      <ul className="grid gap-1">
        {items.map(({ href, icon: Icon, label }) => {
          const active = href === activeHref
          return (
            <li key={href}>
              <Link
                href={href}
                title={collapsed ? label : undefined}
                aria-current={active ? 'page' : undefined}
                onClick={onNavigate}
                className={cn(
                  'flex min-h-11 items-center overflow-hidden rounded-xl py-0 pl-[1.125rem] text-sm font-medium transition-[gap,background-color,color] duration-300 ease-out',
                  collapsed ? 'gap-0 pr-0' : 'gap-3 pr-3',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                <span
                  className={cn(
                    'whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-out',
                    collapsed
                      ? 'max-w-0 -translate-x-2 overflow-hidden opacity-0'
                      : 'max-w-40 translate-x-0 opacity-100',
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
