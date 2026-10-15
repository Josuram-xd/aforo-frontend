import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { deleteUser, setUserActive, setUserRole } from '../../api/admin'
import { errorMessageKey } from '../../api/errors'
import { queryKeys } from '../../api/queryKeys'
import type { UserItem } from '../../api/types'
import { useSession } from '../../auth/authContext'
import { ROLE_CODES, type RoleCode } from '../../auth/roles'
import { FilterBar } from '../../components/FilterBar'
import { RoleBadge } from '../../components/RoleBadge'
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
import { TypedConfirmDialog } from '../../components/ui/TypedConfirmDialog'
import { useToast } from '../../components/ui/toastContext'
import { useUsers } from '../../hooks/queries'
import { formatDate } from '../../lib/format'
import { InviteUserDialog } from './InviteUserDialog'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/** Usuarios: roles (set_user_role), activation (set_user_active), deletion (delete_user) and invitations. */
export function UsersPage() {
  const { t } = useTranslation()
  const { user: me } = useSession()
  const users = useUsers()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleCode | ''>('')
  const [inviteOpen, setInviteOpen] = useState(false)

  const toast = useToast()
  const [confirming, setConfirming] = useState<UserItem | null>(null)
  const displayName = (user: UserItem) => user.fullName ?? user.email ?? t('admin.users.noName')
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.users })
  const showError = (error: unknown) => toast.error(t(errorMessageKey(error)))

  const changeRole = useMutation({
    mutationFn: ({ user, role }: { user: UserItem; role: RoleCode }) => setUserRole(user.id, role),
    onSuccess: (_, { user, role }) =>
      toast.success(
        t('admin.users.toast.roleChanged', { name: displayName(user), role: t(`roles.${role}`) }),
      ),
    onError: showError,
    onSettled: refresh,
  })
  const toggleActive = useMutation({
    mutationFn: (target: UserItem) => setUserActive(target.id, !target.isActive),
    onSuccess: (_, target) => {
      toast.success(
        t(target.isActive ? 'admin.users.toast.deactivated' : 'admin.users.toast.activated', {
          name: displayName(target),
        }),
      )
      setConfirming(null)
    },
    onError: showError,
    onSettled: refresh,
  })

  const [deleting, setDeleting] = useState<UserItem | null>(null)
  const remove = useMutation({
    mutationFn: (target: UserItem) => deleteUser(target.id),
    onSuccess: (_, target) => {
      toast.success(t('admin.users.toast.deleted', { name: displayName(target) }))
      setDeleting(null)
    },
    onError: showError,
    onSettled: refresh,
  })

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
          <RoleBadge role={row.role ?? 'viewer'} />
        ) : (
          <SelectInput
            className="input--compact"
            value={row.role ?? ''}
            aria-label={t('admin.users.roleFor', { name: row.fullName ?? row.email ?? '' })}
            disabled={changeRole.isPending && changeRole.variables?.user.id === row.id}
            onChange={(event) =>
              changeRole.mutate({ user: row, role: event.target.value as RoleCode })
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
          <span className="cell-actions">
            <Button
              variant="ghost"
              size="sm"
              loading={toggleActive.isPending && toggleActive.variables?.id === row.id}
              onClick={() => (row.isActive ? setConfirming(row) : toggleActive.mutate(row))}
            >
              {row.isActive ? t('admin.users.deactivate') : t('admin.users.activate')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="btn--danger-text"
              icon={<Trash2 size={14} aria-hidden="true" />}
              onClick={() => setDeleting(row)}
              aria-label={t('admin.users.deleteNamed', { name: displayName(row) })}
            >
              {t('admin.users.delete')}
            </Button>
          </span>
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
        onInvited={(email) => toast.success(t('admin.users.toast.invited', { email }))}
      />
      <ConfirmDialog
        open={confirming !== null}
        title={t('admin.users.confirmDeactivateTitle')}
        description={t('admin.users.confirmDeactivateText', {
          name: confirming ? displayName(confirming) : '',
        })}
        confirmLabel={t('admin.users.deactivate')}
        loading={toggleActive.isPending}
        onConfirm={() => confirming && toggleActive.mutate(confirming)}
        onCancel={() => setConfirming(null)}
      />
      <TypedConfirmDialog
        key={deleting?.id ?? 'closed'}
        open={deleting !== null}
        title={t('admin.users.confirmDeleteTitle')}
        description={t('admin.users.confirmDeleteText', {
          name: deleting ? displayName(deleting) : '',
        })}
        expected={deleting ? (deleting.email ?? displayName(deleting)) : ''}
        confirmLabel={t('admin.users.delete')}
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
