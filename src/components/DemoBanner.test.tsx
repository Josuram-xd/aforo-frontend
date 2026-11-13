import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { demoActive, exitDemo } from '../lib/demo'
import { DemoBanner } from './DemoBanner'

vi.mock('../lib/demo', () => ({ demoActive: vi.fn(), exitDemo: vi.fn() }))

describe('DemoBanner', () => {
  it('renders nothing outside the demo', () => {
    vi.mocked(demoActive).mockReturnValue(false)
    render(<DemoBanner />)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('shows a status strip with a way out during the demo', () => {
    vi.mocked(demoActive).mockReturnValue(true)
    render(<DemoBanner />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'MODO DEMOSTRACIÓN · datos de ejemplo, no son resultados del piloto',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Salir de la demo' }))
    expect(exitDemo).toHaveBeenCalledTimes(1)
  })
})
