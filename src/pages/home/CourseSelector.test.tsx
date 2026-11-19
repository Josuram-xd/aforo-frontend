import { fireEvent, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import type { Course } from '../../api/types'
import { renderWithProviders } from '../../test/render'
import { CourseSelector } from './CourseSelector'
import { defaultCourseId } from './defaultCourse'

const course = (id: string, name: string): Course => ({
  id,
  name,
  code: id.toUpperCase(),
  academic_period: null,
  is_active: true,
  created_at: '',
  updated_at: '',
})
const courses = [course('a', 'Alfa'), course('b', 'Beta')]
const session = (course_id: string, starts_at: string, ends_at: string) => ({
  course_id,
  starts_at,
  ends_at,
  status: 'scheduled',
})

it('lists the courses and reports the picked one', () => {
  const onChange = vi.fn()
  renderWithProviders(<CourseSelector courses={courses} value="a" onChange={onChange} />)
  expect(screen.getByRole('combobox')).toHaveValue('a')
  expect(screen.getByText(/aforo en vivo cuenta a todo el salón/i)).toBeInTheDocument()
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } })
  expect(onChange).toHaveBeenCalledWith('b')
})

it('defaults to the course with a session happening now', () => {
  const now = '2026-10-13T15:00:00Z'
  expect(
    defaultCourseId(courses, [session('b', '2026-10-13T14:00:00Z', '2026-10-13T16:00:00Z')], now),
  ).toBe('b')
})

it('falls back to the first course when nothing is live', () => {
  const now = '2026-10-13T15:00:00Z'
  expect(
    defaultCourseId(courses, [session('b', '2026-10-12T14:00:00Z', '2026-10-12T16:00:00Z')], now),
  ).toBe('a')
  expect(defaultCourseId([], [], now)).toBeUndefined()
})
