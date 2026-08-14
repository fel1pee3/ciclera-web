'use client'

import { useState } from 'react'
import { Check, CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = ['Visão geral', 'Ordens de serviço', 'Revisão', 'Prontas para faturar'] as const

export function ProductDemo() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Visão geral')
  return (
    <div className="overflow-hidden rounded-2xl border border-primary-foreground/15 bg-card text-card-foreground shadow-2xl">
      <div className="flex overflow-x-auto border-b border-border px-3 pt-3" role="tablist" aria-label="Demonstração do produto">
        {tabs.map(item => <button key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={cn('shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors', tab === item ? 'border-primary text-primary' : 'border-transparent text-muted-foreground')}>{item}</button>)}
      </div>
      <div className="min-h-96 p-5 md:p-7" role="tabpanel">
        {tab === 'Visão geral' && <Overview />}
        {tab === 'Ordens de serviço' && <Orders />}
        {tab === 'Revisão' && <Review />}
        {tab === 'Prontas para faturar' && <Billing />}
      </div>
    </div>
  )
}

function Overview() { const items = [['Em execução','8'],['Aguardando revisão','6'],['Com pendências','3'],['Prontas para faturar','R$ 14.850']]; return <div className="grid gap-4 sm:grid-cols-2">{items.map(([label,value], i) => <div key={label} className={cn('rounded-xl border p-5', i===3 ? 'border-accent bg-accent/15' : 'border-border bg-background')}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 font-heading text-3xl font-semibold">{value}</p></div>)}</div> }
function Orders() { const rows = [['#1842','Clima Norte','Marcos','Revisão','R$ 1.480'],['#1841','Solaris Energia','Aline','Em execução','R$ 920'],['#1839','Hospital Vida','João','Pendente','R$ 2.150']]; return <div className="flex flex-col gap-3">{rows.map(r => <div key={r[0]} className="grid gap-2 rounded-xl border border-border p-4 text-sm sm:grid-cols-5 sm:items-center"><strong>{r[0]}</strong><span>{r[1]}</span><span>{r[2]}</span><span className="text-muted-foreground">{r[3]}</span><span className="font-semibold sm:text-right">{r[4]}</span></div>)}</div> }
function Review() { const checks=['Checklist preenchido','Fotos recebidas','Assinatura recebida','Serviço adicional conferido','Horário registrado']; return <div className="flex flex-col gap-5"><div><p className="text-sm text-muted-foreground">OS #1842 · Clima Norte</p><h3 className="mt-1 font-heading text-xl font-semibold">Checklist de validação</h3></div><ul className="grid gap-3 sm:grid-cols-2">{checks.map(x=><li key={x} className="flex items-center gap-2 text-sm"><Check className="size-4 text-primary" />{x}</li>)}</ul><div className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm"><CircleAlert className="size-5 shrink-0 text-warning"/><span><strong>Pendência:</strong> falta fotografia da identificação do equipamento.</span></div></div> }
function Billing() { return <div className="flex flex-col gap-3">{[['Clima Norte','#1842','10 ago. 2026','R$ 1.480'],['Edifício Central','#1837','09 ago. 2026','R$ 3.250'],['Solaris Energia','#1832','08 ago. 2026','R$ 2.090']].map(r=><div key={r[1]} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{r[0]} · {r[1]}</p><p className="text-sm text-muted-foreground">Concluída em {r[2]} · Liberada</p></div><div className="flex items-center justify-between gap-4"><strong>{r[3]}</strong><button className="rounded-lg border border-border px-3 py-2 text-sm font-semibold" type="button">Marcar como faturada</button></div></div>)}</div> }
