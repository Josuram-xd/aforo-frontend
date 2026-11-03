import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import './DataTable.css'

export interface Column<T> {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  /** Enables client-side sorting on this column. */
  sortValue?: (row: T) => string | number
  align?: 'left' | 'right' | 'center'
  width?: string
  /** Hidden below 640px to keep tables readable on phones. */
  hideOnMobile?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  /** Accessible table name (visually hidden caption). */
  caption: string
  initialSort?: { key: string; direction: 'asc' | 'desc' }
  onRowClick?: (row: T) => void
  selectedKey?: string | null
  rowClassName?: (row: T) => string | undefined
  empty?: ReactNode
}

/** Table with sticky header and sortable columns (DESIGN_SYSTEM.md §8.6). */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  initialSort,
  onRowClick,
  selectedKey,
  rowClassName,
  empty,
}: DataTableProps<T>) {
  const { t } = useTranslation()
  const [sort, setSort] = useState(initialSort ?? null)

  const sortedRows = useMemo(() => {
    const column = sort ? columns.find((c) => c.key === sort.key) : undefined
    if (!sort || !column?.sortValue) return rows
    const getValue = column.sortValue
    const factor = sort.direction === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const left = getValue(a)
      const right = getValue(b)
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor
      return String(left).localeCompare(String(right), 'es', { numeric: true }) * factor
    })
  }, [rows, columns, sort])

  function toggleSort(key: string) {
    setSort((current) =>
      current?.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    )
  }

  if (rows.length === 0 && empty) return <>{empty}</>

  return (
    // The wrapper scrolls on small screens, so it must be focusable to scroll with the keyboard.
    <div className="table-wrap" tabIndex={0} role="region" aria-label={caption}>
      <table className="table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => {
              const active = sort?.key === column.key
              const ariaSort = active
                ? sort.direction === 'asc'
                  ? 'ascending'
                  : 'descending'
                : undefined
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={column.sortValue ? (ariaSort ?? 'none') : undefined}
                  className={[
                    column.align ? `align-${column.align}` : '',
                    column.hideOnMobile ? 'hide-mobile' : '',
                  ].join(' ')}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      className={`table__sort${active ? ' table__sort--active' : ''}`}
                      onClick={() => toggleSort(column.key)}
                    >
                      {column.header}
                      {active ? (
                        sort.direction === 'asc' ? (
                          <ArrowUp size={13} aria-hidden="true" />
                        ) : (
                          <ArrowDown size={13} aria-hidden="true" />
                        )
                      ) : (
                        <ArrowUpDown size={13} aria-hidden="true" className="table__sort-idle" />
                      )}
                      <span className="visually-hidden">{t('table.sortBy')}</span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => {
            const key = rowKey(row)
            const extra = rowClassName?.(row)
            return (
              <tr
                key={key}
                className={[
                  onRowClick ? 'table__row--clickable' : '',
                  selectedKey === key ? 'table__row--selected' : '',
                  extra ?? '',
                ].join(' ')}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                aria-selected={onRowClick ? selectedKey === key : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.target !== event.currentTarget) return
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onRowClick(row)
                        }
                      }
                    : undefined
                }
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={[
                      column.align ? `align-${column.align}` : '',
                      column.hideOnMobile ? 'hide-mobile' : '',
                    ].join(' ')}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const { t } = useTranslation()
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : page * pageSize + 1
  const last = Math.min(total, (page + 1) * pageSize)

  return (
    <nav className="pagination" aria-label={t('table.pagination')}>
      <p className="pagination__summary tabular">{t('table.showing', { first, last, total })}</p>
      <div className="pagination__controls">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          icon={<ChevronLeft size={15} aria-hidden="true" />}
        >
          {t('table.previous')}
        </Button>
        <span className="pagination__page tabular" aria-current="page">
          {t('table.page', { page: page + 1, pages })}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= pages}
        >
          {t('table.next')}
          <ChevronRight size={15} aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
