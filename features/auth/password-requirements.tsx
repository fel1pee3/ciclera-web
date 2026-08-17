'use client'

import { Check, Circle } from 'lucide-react'

import { securePasswordRules } from './schemas'

export function PasswordRequirements({ value }: { value: string }) {
  const results = securePasswordRules.map((rule) => ({
    ...rule,
    passed: rule.test(value),
  }))
  const passed = results.filter((rule) => rule.passed).length
  const strength =
    passed === results.length
      ? 'Senha segura'
      : passed >= 3
        ? 'Continue, está quase lá'
        : 'Crie uma senha segura'

  return (
    <div
      id="password-requirements"
      className="rounded-2xl border border-border bg-background p-4"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold text-foreground">{strength}</p>
        <span className="text-xs text-muted-foreground">
          {passed}/{results.length}
        </span>
      </div>
      <div aria-hidden="true" className="mt-3 grid grid-cols-5 gap-1.5">
        {results.map((rule) => (
          <span
            className={`h-1.5 rounded-full transition-colors ${
              rule.passed ? 'bg-secondary' : 'bg-muted'
            }`}
            key={rule.id}
          />
        ))}
      </div>
      <ul className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        {results.map((rule) => {
          const Icon = rule.passed ? Check : Circle
          return (
            <li
              className={
                rule.passed
                  ? 'flex items-center gap-2 font-medium text-primary'
                  : 'flex items-center gap-2 text-muted-foreground'
              }
              key={rule.id}
            >
              <Icon aria-hidden="true" className="size-3.5 shrink-0" />
              {rule.label}
            </li>
          )
        })}
      </ul>
      <span className="sr-only" aria-live="polite">
        {passed} de {results.length} requisitos de senha atendidos.
      </span>
    </div>
  )
}
