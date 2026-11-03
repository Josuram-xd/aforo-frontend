import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Classroom, EventFilters, Student } from '../../api/types'
import { EventsFilterBar } from './EventsFilterBar'

const STUDENTS = [
  { id: 's-1', full_name: 'Ana Gómez' },
  { id: 's-2', full_name: 'Carlos Ruiz' },
] as Student[]
const ONE_ROOM = [{ id: 'room-1', name: 'Salón del piloto' }] as Classroom[]

function setup(value: EventFilters = { from: '2026-10-07', to: '2026-10-13' }, canClear = false) {
  const onChange = vi.fn()
  const onClear = vi.fn()
  render(
    <EventsFilterBar
      value={value}
      onChange={onChange}
      onClear={onClear}
      canClear={canClear}
      students={STUDENTS}
      classrooms={ONE_ROOM}
    />,
  )
  return { onChange, onClear, user: userEvent.setup() }
}

describe('EventsFilterBar', () => {
  it('filters by direction', async () => {
    const { onChange, user } = setup()
    await user.selectOptions(screen.getByLabelText('Dirección'), 'Salida')
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ direction: 'EXIT' }))
  })

  it('keeps FACE and BODY_ONLY as separate method options', async () => {
    const { onChange, user } = setup()
    const method = screen.getByLabelText('Método')
    expect(Array.from((method as HTMLSelectElement).options).map((o) => o.text)).toEqual([
      'Todos',
      'Rostro',
      'Cuerpo',
    ])
    await user.selectOptions(method, 'Cuerpo')
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ method: 'BODY_ONLY' }))
  })

  it('filters by student and keeps the other filters', async () => {
    const { onChange, user } = setup({ from: '2026-10-07', to: '2026-10-13', direction: 'ENTRY' })
    await user.selectOptions(screen.getByLabelText('Estudiante'), 'Carlos Ruiz')
    expect(onChange).toHaveBeenCalledWith({
      from: '2026-10-07',
      to: '2026-10-13',
      direction: 'ENTRY',
      studentId: 's-2',
    })
  })

  it('hides the classroom filter when there is only one classroom', () => {
    setup()
    expect(screen.queryByLabelText('Salón')).not.toBeInTheDocument()
  })

  it('only enables "Limpiar filtros" when something changed', async () => {
    setup()
    expect(screen.getByRole('button', { name: 'Limpiar filtros' })).toBeDisabled()
  })

  it('clears the filters', async () => {
    const { onClear, user } = setup({ method: 'FACE' }, true)
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(onClear).toHaveBeenCalled()
  })
})
