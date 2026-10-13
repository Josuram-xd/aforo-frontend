import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DoorClosed, DoorOpen, Pencil, Search, UserMinus, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLogView } from '../../api/accessLog'
import { errorMessageKey } from '../../api/errors'
import { queryKeys } from '../../api/queryKeys'
import { setStudentActive } from '../../api/students'
import type { Student } from '../../api/types'
import { useRole } from '../../auth/useRole'
import { FilterBar } from '../../components/FilterBar'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Field, SelectInput, TextInput } from '../../components/ui/Field'
import { PageIntro } from '../../components/ui/PageIntro'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/toastContext'
import { useStudents } from '../../hooks/queries'
import { formatDateTime, formatRelative } from '../../lib/format'
import { StudentFormDialog } from './StudentFormDialog'

type PresenceFilter = '' | 'IN' | 'OUT' | 'inactive'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/** Estudiantes: presence and last event; admins create, edit and deactivate. */
export function StudentsPage() {
  const { t } = useTranslation()
  useLogView('students')
  const { role } = useRole()
  const isAdmin = role === 'admin'
  const students = useStudents()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [presence, setPresence] = useState<PresenceFilter>('')
  const [editing, setEditing] = useState<Student | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const toast = useToast()
  const [confirming, setConfirming] = useState<Student | null>(null)

  const toggleActive = useMutation({
    mutationFn: (student: Student) => setStudentActive(student.id, !student.is_active),
    onSuccess: (_, student) => {
      toast.success(
        t(student.is_active ? 'students.toast.deactivated' : 'students.toast.reactivated', {
          name: student.full_name,
        }),
      )
      setConfirming(null)
    },
    onError: (error) => toast.error(t(errorMessageKey(error))),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.students }),
  })

  const rows = useMemo(() => {
    const term = normalize(search.trim())
    return (students.data ?? []).filter((student) => {
      if (presence === 'inactive' && student.is_active) return false
      if (
        (presence === 'IN' || presence === 'OUT') &&
        (student.presence !== presence || !student.is_active)
      )
        return false
      if (!term) return true
      return [student.full_name, student.student_code ?? '', student.email ?? ''].some((value) =>
        normalize(value).includes(term),
      )
    })
  }, [students.data, search, presence])

  const active = (students.data ?? []).filter((s) => s.is_active)
  const inside = active.filter((s) => s.presence === 'IN').length

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: t('students.columns.name'),
      sortValue: (row) => row.full_name,
      render: (row) => (
        <span className="cell-primary">
          <Avatar name={row.full_name} size="sm" />
          <span className="cell-primary__text">
            <span className="cell-primary__title">{row.full_name}</span>
            <span className="cell-primary__meta">{row.email ?? t('students.noEmail')}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'code',
      header: t('students.columns.code'),
      hideOnMobile: true,
      sortValue: (row) => row.student_code ?? '',
      render: (row) => <span className="tabular">{row.student_code ?? '—'}</span>,
    },
    {
      key: 'presence',
      header: t('students.columns.presence'),
      sortValue: (row) => (row.is_active ? row.presence : 'Z'),
      render: (row) =>
        !row.is_active ? (
          <Badge tone="neutral" icon={<UserMinus />}>
            {t('students.inactive')}
          </Badge>
        ) : row.presence === 'IN' ? (
          <Badge tone="success" icon={<DoorOpen />}>
            {t('students.presence.in')}
          </Badge>
        ) : (
          <Badge tone="neutral" icon={<DoorClosed />}>
            {t('students.presence.out')}
          </Badge>
        ),
    },
    {
      key: 'last',
      header: t('students.columns.lastEvent'),
      hideOnMobile: true,
      sortValue: (row) => row.last_event_at ?? '',
      render: (row) =>
        row.last_event_at ? (
          <span title={formatDateTime(row.last_event_at)}>{formatRelative(row.last_event_at)}</span>
        ) : (
          <span className="muted">{t('students.never')}</span>
        ),
    },
  ]

  if (isAdmin) {
    columns.push({
      key: 'actions',
      header: <span className="visually-hidden">{t('common.actions')}</span>,
      align: 'right',
      render: (row) => (
        <span className="cell-actions">
          <Button
            variant="ghost"
            size="sm"
            icon={<Pencil size={14} aria-hidden="true" />}
            onClick={() => {
              setEditing(row)
              setFormOpen(true)
            }}
            aria-label={t('students.editNamed', { name: row.full_name })}
          >
            {t('common.edit')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (row.is_active ? setConfirming(row) : toggleActive.mutate(row))}
            loading={toggleActive.isPending && toggleActive.variables?.id === row.id}
          >
            {row.is_active ? t('students.deactivate') : t('students.reactivate')}
          </Button>
        </span>
      ),
    })
  }

  return (
    <>
      <PageIntro
        description={t('students.description', {
          inside,
          total: active.length,
          count: active.length,
        })}
        actions={
          isAdmin ? (
            <Button
              icon={<UserPlus size={16} aria-hidden="true" />}
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              {t('students.create')}
            </Button>
          ) : undefined
        }
      />
      <Card>
        <FilterBar
          label={t('students.filters')}
          onClear={() => {
            setSearch('')
            setPresence('')
          }}
          canClear={search !== '' || presence !== ''}
        >
          <Field label={t('filters.search')}>
            {({ id }) => (
              <TextInput
                id={id}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('students.searchPlaceholder')}
                icon={<Search size={15} />}
              />
            )}
          </Field>
          <Field label={t('students.columns.presence')}>
            {({ id }) => (
              <SelectInput
                id={id}
                value={presence}
                onChange={(event) => setPresence(event.target.value as PresenceFilter)}
              >
                <option value="">{t('filters.all')}</option>
                <option value="IN">{t('students.presence.in')}</option>
                <option value="OUT">{t('students.presence.out')}</option>
                <option value="inactive">{t('students.inactivePlural')}</option>
              </SelectInput>
            )}
          </Field>
        </FilterBar>

        {students.isPending ? (
          <SkeletonTable rows={8} columns={4} />
        ) : students.isError ? (
          <ErrorState onRetry={() => void students.refetch()} retrying={students.isFetching} />
        ) : (
          <DataTable
            caption={t('students.tableCaption')}
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            initialSort={{ key: 'name', direction: 'asc' }}
            rowClassName={(row) => (row.is_active ? undefined : 'table__row--muted')}
            empty={
              <EmptyState
                icon={Users}
                title={students.data.length === 0 ? t('students.empty') : t('students.noResults')}
                description={
                  students.data.length === 0 && isAdmin ? t('students.emptyHint') : undefined
                }
              />
            }
          />
        )}
      </Card>

      {isAdmin && (
        <StudentFormDialog
          key={formOpen ? (editing?.id ?? 'new') : 'closed'}
          open={formOpen}
          student={editing}
          onClose={() => setFormOpen(false)}
          onSaved={(name) =>
            toast.success(
              t(editing ? 'students.toast.updated' : 'students.toast.created', { name }),
            )
          }
        />
      )}
      <ConfirmDialog
        open={confirming !== null}
        title={t('students.confirmDeactivateTitle')}
        description={t('students.confirmDeactivateText', { name: confirming?.full_name ?? '' })}
        confirmLabel={t('students.deactivate')}
        loading={toggleActive.isPending}
        onConfirm={() => confirming && toggleActive.mutate(confirming)}
        onCancel={() => setConfirming(null)}
      />
    </>
  )
}
