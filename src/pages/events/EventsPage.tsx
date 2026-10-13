import { useMutation } from '@tanstack/react-query'
import { Download, SearchX } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { useLogView } from '../../api/accessLog'
import { errorMessageKey } from '../../api/errors'
import { EVENTS_PAGE_SIZE, exportEventsCsv } from '../../api/events'
import type { Direction, EventFilters, EventItem, EventMethod } from '../../api/types'
import { DirectionBadge, MethodBadge } from '../../components/EventBadges'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable, Pagination, type Column } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { PageIntro } from '../../components/ui/PageIntro'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/toastContext'
import { useClassrooms, useEventsPage, useStudents } from '../../hooks/queries'
import { downloadText } from '../../lib/download'
import { addDays, bogotaDay, formatDate, formatTimeWithSeconds } from '../../lib/format'
import { EventsFilterBar } from './EventsFilterBar'

const DEFAULT_RANGE_DAYS = 7

function readFilters(params: URLSearchParams, today: string): EventFilters {
  const direction = params.get('dir')
  const method = params.get('met')
  return {
    from: params.get('desde') ?? addDays(today, -(DEFAULT_RANGE_DAYS - 1)),
    to: params.get('hasta') ?? today,
    direction: direction === 'ENTRY' || direction === 'EXIT' ? (direction as Direction) : '',
    method: method === 'FACE' || method === 'BODY_ONLY' ? (method as EventMethod) : '',
    studentId: params.get('est') ?? undefined,
    classroomId: params.get('salon') ?? undefined,
  }
}

function writeFilters(filters: EventFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.from) params.set('desde', filters.from)
  if (filters.to) params.set('hasta', filters.to)
  if (filters.direction) params.set('dir', filters.direction)
  if (filters.method) params.set('met', filters.method)
  if (filters.studentId) params.set('est', filters.studentId)
  if (filters.classroomId) params.set('salon', filters.classroomId)
  return params
}

/** Eventos: full history with filters, pagination and CSV export (teacher/admin). */
export function EventsPage() {
  const { t } = useTranslation()
  useLogView('events')
  const today = bogotaDay()
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => readFilters(params, today), [params, today])
  const page = Math.max(0, Number(params.get('p') ?? '0') || 0)

  const events = useEventsPage(filters, page)
  const students = useStudents()
  const classrooms = useClassrooms()

  const toast = useToast()
  const exportCsv = useMutation({
    mutationFn: () =>
      exportEventsCsv({
        classroomId: filters.classroomId ?? classrooms.data?.[0]?.id ?? '',
        from: filters.from ?? today,
        to: filters.to ?? today,
      }),
    onSuccess: ({ csv, filename }) => {
      downloadText(csv, filename, 'text/csv;charset=utf-8')
      toast.success(t('events.toast.exported', { filename }))
    },
    onError: (error) => toast.error(`${t('events.exportFailed')}: ${t(errorMessageKey(error))}`),
  })

  const defaults = readFilters(new URLSearchParams(), today)
  const canClear = JSON.stringify(filters) !== JSON.stringify(defaults)

  function updateFilters(next: EventFilters) {
    setParams(writeFilters(next), { replace: true })
  }

  function goToPage(next: number) {
    const nextParams = writeFilters(filters)
    if (next > 0) nextParams.set('p', String(next))
    setParams(nextParams, { replace: true })
  }

  const columns: Column<EventItem>[] = [
    {
      key: 'time',
      header: t('events.columns.time'),
      render: (row) => (
        <span className="cell-primary__text">
          <span className="cell-primary__title tabular">
            {formatTimeWithSeconds(row.occurredAt)}
          </span>
          <span className="cell-primary__meta">{formatDate(row.occurredAt)}</span>
        </span>
      ),
    },
    {
      key: 'direction',
      header: t('events.columns.direction'),
      render: (row) => <DirectionBadge direction={row.direction} />,
    },
    {
      key: 'student',
      header: t('events.columns.student'),
      render: (row) => row.studentName ?? <span className="muted">{t('events.unidentified')}</span>,
    },
    {
      key: 'method',
      header: t('events.columns.method'),
      render: (row) => <MethodBadge method={row.method} />,
    },
    {
      key: 'confidence',
      header: t('events.columns.confidence'),
      align: 'right',
      hideOnMobile: true,
      render: (row) => <span className="tabular">{Math.round(row.confidence * 100)} %</span>,
    },
  ]

  return (
    <>
      <PageIntro
        description={t('events.description')}
        actions={
          <Button
            variant="secondary"
            onClick={() => exportCsv.mutate()}
            loading={exportCsv.isPending}
            disabled={!classrooms.data?.length}
            icon={<Download size={16} aria-hidden="true" />}
          >
            {t('events.export')}
          </Button>
        }
      />
      <Card>
        <EventsFilterBar
          value={filters}
          onChange={updateFilters}
          onClear={() => setParams(new URLSearchParams(), { replace: true })}
          canClear={canClear}
          students={students.data ?? []}
          classrooms={classrooms.data ?? []}
        />
        {events.isPending ? (
          <SkeletonTable rows={8} columns={5} />
        ) : events.isError ? (
          <ErrorState onRetry={() => void events.refetch()} retrying={events.isFetching} />
        ) : (
          <>
            <DataTable
              caption={t('events.tableCaption')}
              columns={columns}
              rows={events.data.rows}
              rowKey={(row) => row.id}
              empty={
                <EmptyState
                  icon={SearchX}
                  title={t('events.noResults')}
                  description={t('events.noResultsHint')}
                />
              }
            />
            {events.data.total > 0 && (
              <Pagination
                page={page}
                pageSize={EVENTS_PAGE_SIZE}
                total={events.data.total}
                onPageChange={goToPage}
              />
            )}
          </>
        )}
      </Card>
    </>
  )
}
