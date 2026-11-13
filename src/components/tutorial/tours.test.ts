import { expect, it } from 'vitest'
import i18n from '../../i18n'
import { TOURS } from './tours'

const sources = import.meta.glob('../../pages/**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>
const code = Object.values(sources).join('\n')

const steps = Object.entries(TOURS).flatMap(([page, list]) => list.map((step) => ({ page, step })))

it.each(steps)('$page tour step $step.key has its texts', ({ step }) => {
  expect(i18n.exists(`${step.key}.title`)).toBe(true)
  expect(i18n.exists(`${step.key}.body`)).toBe(true)
})

it.each(steps.filter(({ step }) => step.target))(
  '$page tour target $step.target exists in a page',
  ({ step }) => {
    const id = step.target ?? ''
    expect([`tour="${id}"`, `'${id}'`].some((needle) => code.includes(needle))).toBe(true)
  },
)

it('keeps every tour between 3 and 7 steps', () => {
  for (const list of Object.values(TOURS)) {
    expect(list.length).toBeGreaterThanOrEqual(3)
    expect(list.length).toBeLessThanOrEqual(7)
  }
})
