'use client'

import { useRef, type ComponentProps, type KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'

const MAX_CENTS_DIGITS = 16

type CurrencyInputProps = Omit<
  ComponentProps<'input'>,
  'inputMode' | 'onChange' | 'type' | 'value'
> & {
  onValueChange: (value: string) => void
  value: string
}

export function CurrencyInput({
  onKeyDown,
  onValueChange,
  value,
  ...props
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const restoreCaret = (formatted: string, digitsAfterCaret: number) => {
    const nextPosition = caretBeforeRightmostDigits(formatted, digitsAfterCaret)
    window.requestAnimationFrame(() => {
      const input = inputRef.current
      if (input?.value === formatted && document.activeElement === input) {
        input.setSelectionRange(nextPosition, nextPosition)
      }
    })
  }

  const updateValue = (raw: string, cursor: number) => {
    const digitsAfterCaret = onlyDigits(raw.slice(cursor)).length
    const formatted = formatCurrencyInput(raw)
    onValueChange(formatted)
    restoreCaret(formatted, digitsAfterCaret)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.key !== 'Backspace') return

    const input = event.currentTarget
    const start = input.selectionStart
    const end = input.selectionEnd
    if (start === null || end === null || start !== end || start === 0) return
    if (/\d/.test(input.value[start - 1] ?? '')) return

    let digitIndex = start - 1
    while (digitIndex >= 0 && !/\d/.test(input.value[digitIndex] ?? '')) {
      digitIndex -= 1
    }
    if (digitIndex < 0) return

    event.preventDefault()
    const raw = `${input.value.slice(0, digitIndex)}${input.value.slice(
      digitIndex + 1,
    )}`
    updateValue(raw, digitIndex)
  }

  return (
    <Input
      {...props}
      ref={inputRef}
      inputMode="numeric"
      value={value}
      onChange={(event) => {
        const cursor =
          event.currentTarget.selectionStart ?? event.currentTarget.value.length
        updateValue(event.currentTarget.value, cursor)
      }}
      onKeyDown={handleKeyDown}
    />
  )
}

export function formatCurrencyInput(value: string): string {
  const digits = normalizedDigits(value)
  if (!digits) return ''

  const padded = digits.padStart(3, '0')
  const whole = padded.slice(0, -2).replace(/^0+(?=\d)/, '') || '0'
  const fraction = padded.slice(-2)
  return `${groupThousands(whole)},${fraction}`
}

export function currencyInputToCents(value: string): string | null {
  const digits = normalizedDigits(value)
  return digits || null
}

function normalizedDigits(value: string): string {
  return onlyDigits(value)
    .slice(0, MAX_CENTS_DIGITS)
    .replace(/^0+(?=\d)/, '')
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function groupThousands(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function caretBeforeRightmostDigits(value: string, digitCount: number): number {
  if (digitCount <= 0) return value.length

  let seen = 0
  for (let index = value.length - 1; index >= 0; index -= 1) {
    if (/\d/.test(value[index] ?? '')) seen += 1
    if (seen === digitCount) return index
  }
  return 0
}
