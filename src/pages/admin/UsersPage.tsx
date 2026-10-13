import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { setUserActive, setUserRole } from '../../api/admin'
import { errorMessageKey } from '../../api/errors'
import { queryKeys } from '../../api/queryKeys'
import type { UserItem } from '../../api/types'
import { useSession } from '../../auth/authContext'
import { ROLE_CODES, type RoleCode } from '../../auth/roles'
import { FilterBar } from '../../components/FilterBar'
import { Alert } from '../../components/ui/Alert'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Field, SelectInput, TextInput } from '../../components/ui/Field'
import { PageIntro } from '../../components/ui/PageIntro'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { useUsers } from '../../hooks/queries'
import { formatDate } from '../../lib/format'
import { InviteUserDialog } from './InviteUserDialog'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/** Usuarios: roles (set_user_role), activation (set_user_active) and invitations (admin). */
export function UsersPage() {
  const { t } = useTranslation()
  const { user: me } = useSession()
  const users = useUsers()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleCode | ''>('')
  const [inviteOpen, setInviteOpen] = useState(false)

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.users })
  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: RoleCode }) => setUserRole(id, role),
    onSettled: refresh,
  })
  const toggleActive = useMutation({
    mutationFn: (target: UserItem) => setUserActive(target.id, !target.isActive),
    onSettled: refresh,
  })
  const mutationError = changeRole.error ?? toggleActive.error

  const rows = useMemo(() => {
    const term = normalize(search.trim())
    return (users.data ?? []).filter((user) => {
      if (roleFilter && user.role !== roleFilter) return false
      if (!term) return true
      return normalize(`${user.fullName ?? ''} ${user.email ?? ''}`).includes(term)
    })
  }, [users.data, search, roleFilter])

  const columns: Column<UserItem>[] = [
    {
      key: 'name',
      header: t('admin.users.columns.user'),
      sortValue: (row) => row.fullName ?? row.email ?? '',
      render: (row) => {
        const name = row.fullName ?? row.email ?? t('admin.users.noName')
        return (
          <span className="cell-primary">
            <Avatar name={name} imageUrl={row.avatarUrl} size="sm" />
            <span className="cell-primary__text">
              <span className="cell-primary__title">
                {name}
                {row.id === me?.id && <span className="muted"> · {t('admin.users.you')}</span>}
              </span>
              <span className="cell-primary__meta">{row.email ?? '—'}</span>
            </span>
          </span>
        )
      },
    },
    {
      key: 'role',
      header: t('admin.users.role'),
      sortValue: (row) => row.role ?? '',
      render: (row) =>
        row.id === me?.id ? (
          <Badge tone="violet">{t(`roles.${row.role ?? 'viewer'}`)}</Badge>
        ) : (
          <SelectInput
            className="input--compact"
            value={row.role ?? ''}
            aria-label={t('admin.users.roleFor', { name: row.fullName ?? row.email ?? '' })}
            disabled={changeRole.isPending && changeRole.variables?.id === row.id}
            onChange={(event) =>
              changeRole.mutate({ id: row.id, role: event.target.value as RoleCode })
            }
          >
            {row.role === null && <option value="">{t('admin.users.noRole')}</option>}
            {ROLE_CODES.map((code) => (
              <option key={code} value={code}>
                {t(`roles.${code}`)}
              </option>
            ))}
          </SelectInput>
        ),
    },
    {
      key: 'status',
      header: t('admin.users.columns.status'),
      sortValue: (row) => (row.isActive ? 0 : 1),
      render: (row) =>
        row.isActive ? (
          <Badge tone="success" dot>
            {t('admin.users.active')}
          </Badge>
        ) : (
          <Badge tone="neutral">{t('admin.users.inactive')}</Badge>
        ),
    },
    {
      key: 'since',
      header: t('admin.users.columns.since'),
      hideOnMobile: true,
      sortValue: (row) => row.createdAt,
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      header: <span className="visually-hidden">{t('common.actions')}</span>,
      align: 'right',
      render: (row) =>
        row.id === me?.id ? null : (
          <Button
            variant="ghost"
            size="sm"
            loading={toggleActive.isPending && toggleActive.variables?.id === row.id}
            onClick={() => toggleActive.mutate(row)}
          >
            {row.isActive ? t('admin.users.deactivate') : t('admin.users.activate')}
          </Button>
        ),
    },
  ]

  return (
    <>
      <PageIntro
        description={t('admin.users.description')}
        actions={
          <Button
            icon={<UserPlus size={16} aria-hidden="true" />}
            onClick={() => setInviteOpen(true)}
          >
            {t('admin.users.invite')}
          </Button>
        }
      />
      {mutationError && (
        <div className="page-alert">
          <Alert tone="danger" live="assertive">
            {t(errorMessageKey(mutationError))}
          </Alert>
        </div>
      )}
      <Card>
        <FilterBar
          label={t('admin.users.filters')}
          onClear={() => {
            setSearch('')
            setRoleFilter('')
          }}
          canClear={search !== '' || roleFilter !== ''}
        >
          <Field label={t('filters.search')}>
            {({ id }) => (
              <TextInput
                id={id}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('admin.users.searchPlaceholder')}
                icon={<Search size={15} />}
              />
            )}
          </Field>
          <Field label={t('admin.users.role')}>
            {({ id }) => (
              <SelectInput
                id={id}
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as RoleCode | '')}
              >
                <option value="">{t('filters.all')}</option>
                {ROLE_CODES.map((code) => (
                  <option key={code} value={code}>
                    {t(`roles.${code}`)}
                  </option>
                ))}
              </SelectInput>
            )}
          </Field>
        </FilterBar>
        {users.isPending ? (
          <SkeletonTable rows={6} columns={5} />
        ) : users.isError ? (
          <ErrorState onRetry={() => void users.refetch()} retrying={users.isFetching} />
        ) : (
          <DataTable
            caption={t('admin.users.tableCaption')}
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            initialSort={{ key: 'since', direction: 'desc' }}
            rowClassName={(row) => (row.isActive ? undefined : 'table__row--muted')}
            empty={<EmptyState icon={Users} title={t('admin.users.noResults')} />}
          />
        )}
      </Card>
      <InviteUserDialog
        key={inviteOpen ? 'open' : 'closed'}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </>
  )
}
