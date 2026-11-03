import { CalendarPlus, ClipboardList, LogOut, Pencil, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { useLogView } from '../../api/accessLog'
import type { AttendanceItem, SessionItem } from '../../api/types'
import { Badge, type BadgeTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { PageIntro } from '../../components/ui/PageIntro'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { useAttendance, useClassrooms, useCourses, useSessions } from '../../hooks/queries'
import { formatDate, formatTime } from '../../lib/format'
import { SessionFormDialog } from './SessionFormDialog'
import './SessionsPage.css'

type SessionPhase = 'cancelled' | 'live' | 'upcoming' | 'finished'

function phaseOf(session: SessionItem, now: number): SessionPhase {
  if (session.status === 'cancelled') return 'cancelled'
  const start = Date.parse(session.starts_at)
  const end = Date.parse(session.ends_at)
  if (now >= start && now < end) return 'live'
  return now < start ? 'upcoming' : 'finished'
}

const PHASE_TONE: Record<SessionPhase, BadgeTone> = {
  live: 'success',
  upcoming: 'accent',
  finished: 'neutral',
  cancelled: 'danger',
}

/** Sesiones: class sessions (create/edit) and attendance per session (teacher/admin). */
export function SessionsPage() {
  const { t } = useTranslation()
  useLogView('attendance')
  const sessions = useSessions()
  const courses = useCourses()
  const classrooms = useClassrooms()
  const [params, setParams] = useSearchParams()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SessionItem | null>(null)
  const [now] = useState(() => Date.now())

  const list = sessions.data ?? []
  const fallback =
    list.find((s) => phaseOf(s, now) === 'live') ??
    list.find((s) => phaseOf(s, now) === 'finished') ??
    list[0]
  const selectedId = params.get('sesion') ?? fallback?.id ?? null
  const selected = list.find((s) => s.id === selectedId) ?? null
  const attendance = useAttendance(selected?.id ?? null)

  const openForm = (session: SessionItem | null) => {
    setEditing(session)
    setFormOpen(true)
  }

  const multipleRooms = (classrooms.data?.length ?? 0) > 1
  const allColumns: Column<SessionItem>[] = [
    {
      key: 'title',
      header: t('sessions.columns.session'),
      sortValue: (row) => row.title,
      render: (row) => (
        <span className="cell-primary__text">
          <span className="cell-primary__title">{row.title}</span>
          <span className="cell-primary__meta">{row.courseName ?? '—'}</span>
        </span>
      ),
    },
    {
      key: 'when',
      header: t('sessions.columns.when'),
      sortValue: (row) => row.starts_at,
      render: (row) => (
        <span className="cell-primary__text">
          <span className="cell-primary__title tabular">
            {formatTime(row.starts_at)} – {formatTime(row.ends_at)}
          </span>
          <span className="cell-primary__meta">{formatDate(row.starts_at)}</span>
        </span>
      ),
    },
    {
      key: 'room',
      header: t('sessions.columns.classroom'),
      hideOnMobile: true,
      render: (row) => row.classroomName ?? '—',
    },
    {
      key: 'phase',
      header: t('sessions.columns.status'),
      render: (row) => {
        const phase = phaseOf(row, now)
        return (
          <Badge tone={PHASE_TONE[phase]} dot={phase === 'live'}>
            {t(`sessions.phase.${phase}`)}
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      header: <span className="visually-hidden">{t('common.actions')}</span>,
      align: 'right',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Pencil size={14} aria-hidden="true" />}
          aria-label={t('sessions.editNamed', { title: row.title })}
          onClick={(event) => {
            event.stopPropagation()
            openForm(row)
          }}
        >
          {t('common.edit')}
        </Button>
      ),
    },
  ]

  const columns = allColumns.filter((column) => column.key !== 'room' || multipleRooms)

  const attendanceColumns: Column<AttendanceItem>[] = [
    {
      key: 'student',
      header: t('sessions.attendance.student'),
      sortValue: (row) => row.studentName,
      render: (row) => (
        <span className="cell-primary__text">
          <span className="cell-primary__title">{row.studentName}</span>
          <span className="cell-primary__meta">{row.studentCode ?? ''}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: t('sessions.attendance.status'),
      sortValue: (row) => row.status,
      render: (row) =>
        row.status === 'present' ? (
          <Badge tone="success" icon={<UserCheck />}>
            {t('sessions.attendance.present')}
          </Badge>
        ) : (
          <Badge tone="neutral" icon={<LogOut />}>
            {t('sessions.attendance.left')}
          </Badge>
        ),
    },
    {
      key: 'in',
      header: t('sessions.attendance.entry'),
      sortValue: (row) => row.firstEntryAt ?? '',
      render: (row) => (
        <span className="tabular">{row.firstEntryAt ? formatTime(row.firstEntryAt) : '—'}</span>
      ),
    },
    {
      key: 'out',
      header: t('sessions.attendance.exit'),
      sortValue: (row) => row.lastExitAt ?? '',
      render: (row) => (
        <span className="tabular">{row.lastExitAt ? formatTime(row.lastExitAt) : '—'}</span>
      ),
    },
  ]

  const presentCount = attendance.data?.filter((a) => a.status === 'present').length ?? 0
  const leftCount = attendance.data?.filter((a) => a.status === 'left').length ?? 0

  return (
    <>
      <PageIntro
        description={t('sessions.description')}
        actions={
          <Button
            icon={<CalendarPlus size={16} aria-hidden="true" />}
            onClick={() => openForm(null)}
            disabled={!courses.data?.length || !classrooms.data?.length}
          >
            {t('sessions.create')}
          </Button>
        }
      />
      <div className="sessions-layout">
        <Card>
          <CardHeader title={t('sessions.listTitle')} description={t('sessions.listHint')} />
          {sessions.isPending ? (
            <SkeletonTable rows={4} columns={4} />
          ) : sessions.isError ? (
            <ErrorState onRetry={() => void sessions.refetch()} retrying={sessions.isFetching} />
          ) : (
            <DataTable
              caption={t('sessions.listTitle')}
              columns={columns}
              rows={list}
              rowKey={(row) => row.id}
              selectedKey={selected?.id ?? null}
              onRowClick={(row) => setParams({ sesion: row.id }, { replace: true })}
              empty={
                <EmptyState
                  icon={CalendarPlus}
                  title={t('sessions.empty')}
                  description={t('sessions.emptyHint')}
                />
              }
            />
          )}
        </Card>

        <Card aria-live="polite">
          <CardHeader
            title={
              selected
                ? t('sessions.attendance.titleFor', { title: selected.title })
                : t('sessions.attendance.title')
            }
            description={
              selected
                ? t('sessions.attendance.summary', { present: presentCount, left: leftCount })
                : t('sessions.attendance.pick')
            }
          />
          {!selected ? (
            <EmptyState icon={ClipboardList} compact title={t('sessions.attendance.pick')} />
          ) : attendance.isPending ? (
            <SkeletonTable rows={5} columns={4} />
          ) : attendance.isError ? (
            <ErrorState
              compact
              onRetry={() => void attendance.refetch()}
              retrying={attendance.isFetching}
            />
          ) : (
            <DataTable
              caption={t('sessions.attendance.title')}
              columns={attendanceColumns}
              rows={attendance.data}
              rowKey={(row) => row.studentId}
              initialSort={{ key: 'student', direction: 'asc' }}
              empty={
                <EmptyState
                  icon={ClipboardList}
                  compact
                  title={t('sessions.attendance.empty')}
                  description={t('sessions.attendance.emptyHint')}
                />
              }
            />
          )}
        </Card>
      </div>

      <SessionFormDialog
        key={formOpen ? (editing?.id ?? 'new') : 'closed'}
        open={formOpen}
        session={editing}
        courses={courses.data ?? []}
        classrooms={classrooms.data ?? []}
        onClose={() => setFormOpen(false)}
      />
    </>
  )
}
