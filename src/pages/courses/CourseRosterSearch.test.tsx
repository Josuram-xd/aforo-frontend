import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/render'
import { CourseRosterSearch } from './CourseRosterSearch'

const useCourseRoster = vi.hoisted(() => vi.fn())
vi.mock('../../hooks/queries', () => ({ useCourseRoster }))

describe('CourseRosterSearch', () => {
  it('lists the sorted students and searches by prefix', () => {
    useCourseRoster.mockReturnValue({
      data: {
        courseId: 'c1',
        structure: 'binary_search_tree',
        height: 3,
        size: 2,
        students: [
          {
            id: '1',
            fullName: 'Joseph Herrera',
            studentCode: null,
            presence: 'IN',
            enrollmentStatus: 'enrolled',
          },
          {
            id: '2',
            fullName: 'Juan Cuaran',
            studentCode: null,
            presence: 'OUT',
            enrollmentStatus: 'enrolled',
          },
        ],
      },
      isError: false,
    })
    renderWithProviders(<CourseRosterSearch courseId="c1" />)
    expect(screen.getByText(/Árbol binario de búsqueda/)).toBeInTheDocument()
    expect(screen.getByText('Joseph Herrera')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: ' ju ' } })
    expect(useCourseRoster).toHaveBeenLastCalledWith('c1', 'ju')
  })

  it('shows an empty message when nothing matches', () => {
    useCourseRoster.mockReturnValue({
      data: { courseId: 'c1', structure: 'binary_search_tree', height: 0, size: 0, students: [] },
      isError: false,
    })
    renderWithProviders(<CourseRosterSearch courseId="c1" />)
    expect(screen.getByText('Ningún estudiante coincide con la búsqueda.')).toBeInTheDocument()
  })
})
