import { useEffect, useRef, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function SignaturePad({
  disabled,
  onConfirm,
}: {
  disabled: boolean
  onConfirm: (file: File) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const hasStroke = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ratio = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    canvas.width = width * ratio
    canvas.height = height * ratio
    const context = canvas.getContext('2d')
    context?.scale(ratio, ratio)
    if (context) {
      context.lineWidth = 2
      context.lineCap = 'round'
      context.strokeStyle = '#123c3a'
    }
  }, [])

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function clear() {
    const canvas = canvasRef.current
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    hasStroke.current = false
    setError(null)
  }

  function confirm() {
    const canvas = canvasRef.current
    if (!canvas || !hasStroke.current) {
      setError('Faça a assinatura antes de enviar.')
      return
    }
    canvas.toBlob((blob) => {
      if (!blob) return setError('Não foi possível preparar a assinatura.')
      onConfirm(new File([blob], 'assinatura.png', { type: 'image/png' }))
      clear()
    }, 'image/png')
  }

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        className="h-44 w-full touch-none rounded-xl border border-border bg-white"
        aria-label="Área para assinatura"
        onPointerDown={(event) => {
          drawing.current = true
          const context = event.currentTarget.getContext('2d')
          const current = point(event)
          context?.beginPath()
          context?.moveTo(current.x, current.y)
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return
          const current = point(event)
          const context = event.currentTarget.getContext('2d')
          context?.lineTo(current.x, current.y)
          context?.stroke()
          hasStroke.current = true
        }}
        onPointerUp={() => {
          drawing.current = false
        }}
      />
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={clear}
        >
          Limpar
        </Button>
        <Button type="button" disabled={disabled} onClick={confirm}>
          Enviar assinatura
        </Button>
      </div>
    </div>
  )
}
