'use client'

import {
  useRef,
  type ComponentProps,
  type KeyboardEvent,
  type Ref,
} from 'react'

import { Input } from '@/components/ui/input'
import { onlyDigits } from './formatters'

type MaskedInputProps = Omit<
  ComponentProps<'input'>,
  'onChange' | 'ref' | 'value'
> & {
  format: (value: string) => string
  inputRef?: Ref<HTMLInputElement>
  onValueChange: (value: string) => void
  value: string
}

export function MaskedInput({
  format,
  inputRef,
  onKeyDown,
  onValueChange,
  value,
  ...props
}: MaskedInputProps) {
  const localRef = useRef<HTMLInputElement | null>(null)

  const restoreCaret = (formatted: string, digitsBeforeCaret: number) => {
    const nextPosition = caretAfterDigits(formatted, digitsBeforeCaret)
    window.requestAnimationFrame(() => {
      const input = localRef.current
      if (input?.value === formatted) {
        input.setSelectionRange(nextPosition, nextPosition)
      }
    })
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
    const formatted = format(raw)
    const digitsBeforeCaret = onlyDigits(
      input.value.slice(0, digitIndex),
    ).length
    onValueChange(formatted)
    restoreCaret(formatted, digitsBeforeCaret)
  }

  return (
    <Input
      {...props}
      ref={(node) => {
        localRef.current = node
        assignRef(inputRef, node)
      }}
      value={value}
      onChange={(event) => {
        const cursor =
          event.currentTarget.selectionStart ?? event.currentTarget.value.length
        const digitsBeforeCaret = onlyDigits(
          event.currentTarget.value.slice(0, cursor),
        ).length
        const formatted = format(event.currentTarget.value)
        onValueChange(formatted)
        restoreCaret(formatted, digitsBeforeCaret)
      }}
      onKeyDown={handleKeyDown}
    />
  )
}

export function caretAfterDigits(value: string, digitCount: number): number {
  if (digitCount <= 0) return 0

  let seen = 0
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index] ?? '')) seen += 1
    if (seen !== digitCount) continue

    let cursor = index + 1
    while (cursor < value.length && !/\d/.test(value[cursor] ?? '')) {
      cursor += 1
    }
    return cursor
  }
  return value.length
}

function assignRef(
  ref: Ref<HTMLInputElement> | undefined,
  node: HTMLInputElement | null,
) {
  if (typeof ref === 'function') ref(node)
  else if (ref) ref.current = node
}
