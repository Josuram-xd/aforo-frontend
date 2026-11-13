import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/render'
import { CameraConnectGuide } from './CameraConnectGuide'

describe('CameraConnectGuide', () => {
  it('renders the three steps in order and puts the children in the last one', () => {
    renderWithProviders(
      <CameraConnectGuide>
        <input aria-label="campo" />
      </CameraConnectGuide>,
    )
    const steps = within(
      screen.getByRole('list', { name: 'Pasos para conectar la cámara' }),
    ).getAllByRole('listitem')
    expect(steps).toHaveLength(3)
    expect(within(steps[0]!).getByRole('heading')).toHaveTextContent(
      'Crea la cuenta de cámara en la app Tapo',
    )
    expect(within(steps[1]!).getByRole('heading')).toHaveTextContent(
      'Copia la dirección IP de la cámara',
    )
    expect(within(steps[2]!).getByRole('heading')).toHaveTextContent('Pega los datos aquí')
    expect(within(steps[2]!).getByLabelText('campo')).toBeInTheDocument()
    expect(within(steps[1]!).getByText('¿No encuentras la IP?')).toBeInTheDocument()
  })
})
