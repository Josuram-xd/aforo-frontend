import { ScrollText } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLogView } from '../../api/accessLog'
import { AUDIT_PAGE_SIZE } from '../../api/admin'
import type { AuditFilters, AuditItem } from '../../api/types'
import { FilterBar } from '../../components/FilterBar'
import { Badge, type BadgeTone } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { DataTable, Pagination, type Column } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Field, SelectInput, TextInput } from '../../components/ui/Field'
import { PageIntro } from '../../components/ui/PageIntro'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { useAuditPage, useUsers } from '../../hooks/queries'
import { formatDate, formatTimeWithSeconds } from '../../lib/format'
import { AuditDetailDialog } from './AuditDetailDialog'
import './AuditPage.css'

const AUDIT_ACTIONS = [
  'LOGIN',
  'LOGOUT',
  'VIEW',
  'EXPORT',
  'INSERT',
  'UPDATE',
  'DELETE',
  'ROLE_GRANT',
  'ROLE_REVOKE',
  'ROLE_CHANGE',
  'ACCOUNT_ACTIVATE',
  'ACCOUNT_DEACTIVATE',
] as const

const AUDIT_TABLES = [
  'students',
  'classrooms',
  'cameras',
  'courses',
  'course_students',
  'class_sessions',
  'alerts',
  'profiles',
  'user_roles',
  'events',
  'attendance',
  'audit_log',
]

function actionTone(action: string): BadgeTone {
  if (action === 'DELETE' || action === 'ROLE_REVOKE' || action === 'ACCOUNT_DEACTIVATE')
    return 'danger'
  if (action === 'INSERT' || action === 'ROLE_GRANT' || action === 'ACCOUNT_ACTIVATE')
    return 'success'
  if (action === 'UPDATE' || action === 'ROLE_CHANGE') return 'warning'
  if (action === 'EXPORT' || action === 'VIEW') return 'violet'
  return 'accent'
}

/** Auditoría: who did what and when, with the before/after of each change (admin). */
export function AuditPage() {
  const { t } = useTranslation()
  useLogView('audit_log')
  const [filters, setFilters] = useState<AuditFilters>({})
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<AuditItem | null>(null)
  const audit = useAuditPage(filters, page)
  const users = useUsers()

  const update = (patch: Partial<AuditFilters>) => {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(0)
  }

  const userOptions = useMemo(
    () =>
      [...(users.data ?? [])].sort((a, b) =>
        (a.fullName ?? a.email ?? '').localeCompare(b.fullName ?? b.email ?? '', 'es'),
      ),
    [users.data],
  )

  const columns: Column<AuditItem>[] = [
    {
      key: 'when',
      header: t('audit.columns.when'),
      render: (row) => (
        <span className="cell-primary__text">
          <span className="cell-primary__title tabular">
            {formatTimeWithSeconds(row.createdAt)}
          </span>
          <span className="cell-primary__meta">{formatDate(row.createdAt)}</span>
        </span>
      ),
    },
    {
      key: 'actor',
      header: t('audit.columns.user'),
      render: (row) => (
        <span className="cell-primary__text">
          <span className="cell-primary__title">
            {row.actorName ?? row.actorEmail ?? t('audit.system')}
          </span>
          {row.actorName && row.actorEmail && (
            <span className="cell-primary__meta">{row.actorEmail}</span>
          )}
        </span>
      ),
    },
    {
      key: 'action',
      header: t('audit.columns.action'),
      render: (row) => (
        <Badge tone={actionTone(row.action)}>
          {t(`audit.actions.${row.action}`, { defaultValue: row.action })}
        </Badge>
      ),
    },
    {
      key: 'table',
      header: t('audit.columns.table'),
      hideOnMobile: true,
      render: (row) => <span className="audit-mono audit-truncate">{row.tableName ?? '—'}</span>,
    },
  ]

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <>
      <PageIntro description={t('audit.description')} />
      <Card>
        <FilterBar
          label={t('audit.filters')}
          onClear={() => {
            setFilters({})
            setPage(0)
          }}
          canClear={hasFilters}
        >
          <Field label={t('filters.user')}>
            {({ id }) => (
              <SelectInput
                id={id}
                value={filters.actorId ?? ''}
                onChange={(event) => update({ actorId: event.target.value || undefined })}
              >
                <option value="">{t('filters.all')}</option>
                {userOptions.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName ?? user.email}
                  </option>
                ))}
              </SelectInput>
            )}
          </Field>
          <Field label={t('filters.action')}>
            {({ id }) => (
              <SelectInput
                id={id}
                value={filters.action ?? ''}
                onChange={(event) => update({ action: event.target.value || undefined })}
              >
                <option value="">{t('filters.all')}</option>
                {AUDIT_ACTIONS.map((action) => (
                  <option key={action} value={action}>
                    {t(`audit.actions.${action}`)}
                  </option>
                ))}
              </SelectInput>
            )}
          </Field>
          <Field label={t('filters.table')}>
            {({ id }) => (
              <SelectInput
                id={id}
                value={filters.tableName ?? ''}
                onChange={(event) => update({ tableName: event.target.value || undefined })}
              >
                <option value="">{t('filters.all')}</option>
                {AUDIT_TABLES.map((table) => (
                  <option key={table} value={table}>
                    {table}
                  </option>
                ))}
              </SelectInput>
            )}
          </Field>
          <Field label={t('filters.from')}>
            {({ id }) => (
              <TextInput
                id={id}
                type="date"
                value={filters.from ?? ''}
                onChange={(event) => update({ from: event.target.value || undefined })}
              />
            )}
          </Field>
          <Field label={t('filters.to')}>
            {({ id }) => (
              <TextInput
                id={id}
                type="date"
                value={filters.to ?? ''}
                onChange={(event) => update({ to: event.target.value || undefined })}
              />
            )}
          </Field>
        </FilterBar>

        {audit.isPending ? (
          <SkeletonTable rows={8} columns={4} />
        ) : audit.isError ? (
          <ErrorState onRetry={() => void audit.refetch()} retrying={audit.isFetching} />
        ) : (
          <>
            <DataTable
              caption={t('audit.tableCaption')}
              columns={columns}
              rows={audit.data.rows}
              rowKey={(row) => String(row.id)}
              onRowClick={setSelected}
              selectedKey={selected ? String(selected.id) : null}
              empty={
                <EmptyState
                  icon={ScrollText}
                  title={t('audit.empty')}
                  description={hasFilters ? t('events.noResultsHint') : undefined}
                />
              }
            />
            {audit.data.total > 0 && (
              <Pagination
                page={page}
                pageSize={AUDIT_PAGE_SIZE}
                total={audit.data.total}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
      <AuditDetailDialog entry={selected} onClose={() => setSelected(null)} />
    </>
  )
}
