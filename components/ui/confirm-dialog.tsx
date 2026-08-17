'use client'

import { Button } from './button'
import { Modal } from './modal'

interface ConfirmDialogProps {
  cancelLabel?: string
  confirmLabel: string
  description: string
  onCancel: () => void
  onConfirm: () => void
  open: boolean
  pending?: boolean
  pendingLabel?: string
  title: string
  variant?: 'default' | 'destructive'
}

export function ConfirmDialog({
  cancelLabel = 'Cancelar',
  confirmLabel,
  description,
  onCancel,
  onConfirm,
  open,
  pending = false,
  pendingLabel = 'Processando…',
  title,
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Modal
      className="sm:max-w-md"
      description={description}
      onClose={() => {
        if (!pending) onCancel()
      }}
      open={open}
      title={title}
    >
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={variant}
          disabled={pending}
          onClick={onConfirm}
        >
          {pending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
