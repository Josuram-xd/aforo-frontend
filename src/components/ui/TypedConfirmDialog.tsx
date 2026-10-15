import { TriangleAlert } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import { Dialog } from './Dialog'
import { Field, TextInput } from './Field'

interface TypedConfirmDialogProps {
  open: boolean
  title: string
  description: ReactNode
  /** Text the person must type (a name or an email) before the action is enabled. */
  expected: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

function comparable(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es')
}

/**
 * Confirmation for irreversible deletions: the destructive button stays disabled until the exact
 * name or email is typed (case and extra spaces ignored). Focus starts on the text field.
 */
export function TypedConfirmDialog({
  open,
  title,
  description,
  expected,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
}: TypedConfirmDialogProps) {
  const { t } = useTranslation()
  const [typed, setTyped] = useState('')
  const matches = expected.trim() !== '' && comparable(typed) === comparable(expected)

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      size="sm"
      tone="danger"
      icon={<TriangleAlert size={18} />}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            type="submit"
            form="typed-confirm-form"
            disabled={!matches}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <form
        id="typed-confirm-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (matches && !loading) onConfirm()
        }}
        noValidate
      >
        <Field label={t('common.typeToConfirm', { text: expected })}>
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              aria-describedby={describedBy}
            />
          )}
        </Field>
      </form>
    </Dialog>
  )
}
