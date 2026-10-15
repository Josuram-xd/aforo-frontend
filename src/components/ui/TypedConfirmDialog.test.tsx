import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/render'
import { TypedConfirmDialog } from './TypedConfirmDialog'

function renderDialog(onConfirm = vi.fn()) {
  renderWithProviders(
    <TypedConfirmDialog
      open
      title="¿Eliminar estudiante para siempre?"
      description="No se puede deshacer."
      expected="Ana María Peña"
      confirmLabel="Eliminar"
      onConfirm={onConfirm}
      onCancel={vi.fn()}
    />,
  )
  return onConfirm
}

describe('TypedConfirmDialog', () => {
  it('keeps the destructive button disabled until the exact name is typed', async () => {
    const user = userEvent.setup()
    const onConfirm = renderDialog()
    const confirm = screen.getByRole('button', { name: 'Eliminar' })
    const input = screen.getByLabelText(/Para confirmar, escribe/)

    expect(confirm).toBeDisabled()
    await user.type(input, 'Ana María')
    expect(confirm).toBeDisabled()
    await user.type(input, ' Pena')
    expect(confirm).toBeDisabled()

    await user.clear(input)
    await user.type(input, '  ana   maría peña ')
    expect(confirm).toBeEnabled()
    await user.click(confirm)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('does not confirm on Enter while the text does not match', async () => {
    const user = userEvent.setup()
    const onConfirm = renderDialog()
    await user.type(screen.getByLabelText(/Para confirmar, escribe/), 'otra persona{Enter}')
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
