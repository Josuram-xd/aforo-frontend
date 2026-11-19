import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SessionReport } from '../../api/reports'
import type { SessionItem } from '../../api/types'
import { renderWithProviders } from '../../test/render'
import { SessionReportDialog } from './SessionReportDialog'

const REPORT: SessionReport = {
  session: {
    id: 's1',
    title: 'TEST',
    startsAt: '2026-11-19T13:00:00Z',
    endsAt: '2026-11-19T17:00:00Z',
    courseId: 'c1',
    classroomId: 'r1',
  },
  arrivalOrder: [
    { studentId: 'a', fullName: 'Joseph Herrera', firstEntryAt: '2026-11-19T13:05:00Z' },
  ],
  insideNow: [{ studentId: 'a', fullName: 'Joseph Herrera', since: '2026-11-19T13:05:00Z' }],
  anomalies: [
    {
      studentId: 'b',
      fullName: 'Juan Cuaran',
      kind: 'EXIT_WITHOUT_ENTRY',
      at: '2026-11-19T13:10:00Z',
    },
  ],
  lastEntries: [{ studentId: 'a', fullName: 'Joseph Herrera', at: '2026-11-19T13:05:00Z' }],
  peak: { count: 2, at: '2026-11-19T13:20:00Z' },
  timeline: {
    items: [
      {
        id: 'e1',
        direction: 'ENTRY',
        method: 'FACE',
        studentId: 'a',
        fullName: 'Joseph Herrera',
        occurredAt: '2026-11-19T13:05:00Z',
      },
    ],
    prevCursor: null,
    nextCursor: 'e1',
  },
}

const useSessionReport = vi.hoisted(() => vi.fn())
vi.mock('../../hooks/queries', () => ({ useSessionReport }))

const SESSION = { id: 's1', title: 'TEST' } as SessionItem

describe('SessionReportDialog', () => {
  beforeEach(() => {
    useSessionReport.mockReset()
    useSessionReport.mockReturnValue({ data: REPORT, isPending: false, isError: false })
  })

  it('shows each block with the data structure it uses', () => {
    renderWithProviders(<SessionReportDialog session={SESSION} onClose={vi.fn()} />)
    expect(screen.getByText('Cola (FIFO) sobre lista enlazada simple')).toBeInTheDocument()
    expect(screen.getByText('Pila global de entradas (LIFO)')).toBeInTheDocument()
    expect(screen.getByText('Salida sin entrada')).toBeInTheDocument()
    expect(screen.getByText('2 personas')).toBeInTheDocument()
  })

  it('moves the timeline with the cursors', () => {
    renderWithProviders(<SessionReportDialog session={SESSION} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(useSessionReport).toHaveBeenLastCalledWith('s1', 'e1', 'next')
  })
})
