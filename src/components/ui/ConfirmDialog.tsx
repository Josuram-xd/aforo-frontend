import { TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import { Dialog } from './Dialog'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  tone?: 'danger' | 'default'
}

/** Asks before destructive actions (§8.6). Focus starts on "Cancelar", the safe choice. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
  tone = 'danger',
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      size="sm"
      tone={tone}
      icon={<TriangleAlert size={18} />}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} autoFocus>
            {t('common.cancel')}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  )
}
