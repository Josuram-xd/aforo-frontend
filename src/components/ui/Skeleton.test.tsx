import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkeletonChart, SkeletonList, SkeletonStatCard, SkeletonTable } from './Skeleton'

describe('Skeleton loaders', () => {
  it('mark the region as busy and announce "Cargando…" once', () => {
    render(<SkeletonStatCard />)
    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-busy', 'true')
    expect(screen.getAllByText('Cargando…')).toHaveLength(1)
  })

  it('render a header plus 5 placeholder rows for tables by default', () => {
    const { container } = render(<SkeletonTable columns={3} />)
    const rows = container.querySelectorAll('.skeleton-table__row')
    expect(rows).toHaveLength(6)
    expect(rows[1]?.querySelectorAll('.skeleton')).toHaveLength(3)
  })

  it('keep the shapes hidden from assistive technology', () => {
    const { container } = render(<SkeletonList rows={2} />)
    const shapes = container.querySelectorAll('.skeleton')
    expect(shapes.length).toBeGreaterThan(0)
    shapes.forEach((shape) => expect(shape).toHaveAttribute('aria-hidden', 'true'))
  })

  it('reserve the chart height to avoid layout shift', () => {
    const { container } = render(<SkeletonChart height={300} />)
    expect(container.querySelector('.skeleton-chart__plot')).toHaveStyle({ height: '300px' })
  })
})
