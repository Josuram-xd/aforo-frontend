import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { PageTutorial } from './PageTutorial'
import { TOURS } from './tours'

beforeEach(() => {
  // jsdom has no layout: give every element a size so targets count as visible.
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 10, 100, 20))
})
afterEach(() => vi.restoreAllMocks())

function setup(ids: string[]) {
  return render(
    <>
      {ids.map((id) => (
        <div key={id} data-tour={id} />
      ))}
      <PageTutorial steps={TOURS.events} />
    </>,
  )
}

const openButton = () => screen.findByRole('button', { name: 'Ver tutorial de esta pantalla' })

it('hides the button when no step has a target on screen', async () => {
  setup([])
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve))
  })
  expect(screen.queryByRole('button', { name: 'Ver tutorial de esta pantalla' })).toBeNull()
})

it('walks the steps, skips missing targets and closes with Escape', async () => {
  setup(['events-filters', 'events-table'])
  const trigger = await openButton()
  fireEvent.click(trigger)

  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveTextContent('Paso 1 de 3')
  expect(dialog).toHaveTextContent('Historial de eventos')

  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
  expect(dialog).toHaveTextContent('Paso 2 de 3')
  expect(dialog).toHaveTextContent('Filtros')

  fireEvent.keyDown(document, { key: 'ArrowRight' })
  expect(dialog).toHaveTextContent('Paso 3 de 3')
  expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()

  fireEvent.keyDown(document, { key: 'ArrowLeft' })
  expect(dialog).toHaveTextContent('Paso 2 de 3')

  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(trigger).toHaveFocus()
})
