import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BellOff, CircleCheck, CircleDot } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { resolveAlert } from '../../api/alerts'
import { errorMessageKey } from '../../api/errors'
import { queryKeys } from '../../api/queryKeys'
import type { AlertItem } from '../../api/types'
import { useSession } from '../../auth/authContext'
import { STAFF_ROLES, canAccess } from '../../auth/roles'
import { useRole } from '../../auth/useRole'
import { SeverityBadge } from '../../components/AlertBadges'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { PageIntro } from '../../components/ui/PageIntro'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { SkeletonList } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/toastContext'
import { useAlerts } from '../../hooks/queries'
import { useNow } from '../../hooks/useNow'
import { formatDateTime, formatRelative } from '../../lib/format'
import './AlertsPage.css'

type Tab = 'open' | 'resolved' | 'all'

/** Alertas: open and resolved; teacher/admin can resolve. */
export function AlertsPage() {
  const { t } = useTranslation()
  const { user } = useSession()
  const { role } = useRole()
  const canResolve = canAccess(role, STAFF_ROLES)
  const alerts = useAlerts('all')
  const queryClient = useQueryClient()
  const now = useNow(30_000)
  const [tab, setTab] = useState<Tab>('open')

  const toast = useToast()
  const resolve = useMutation({
    mutationFn: (alert: AlertItem) => resolveAlert(alert.id),
    onSuccess: () => toast.success(t('alerts.toast.resolved')),
    onError: (error) => toast.error(t(errorMessageKey(error))),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.alerts }),
  })

  const all = alerts.data ?? []
  const open = all.filter((a) => !a.resolvedAt)
  const resolved = all.filter((a) => a.resolvedAt)
  const visible = tab === 'open' ? open : tab === 'resolved' ? resolved : all

  return (
    <>
      <PageIntro
        description={canResolve ? t('alerts.descriptionStaff') : t('alerts.descriptionViewer')}
        actions={
          <SegmentedControl<Tab>
            label={t('alerts.filter')}
            value={tab}
            onChange={setTab}
            options={[
              { value: 'open', label: t('alerts.tabs.open'), count: open.length },
              { value: 'resolved', label: t('alerts.tabs.resolved'), count: resolved.length },
              { value: 'all', label: t('alerts.tabs.all'), count: all.length },
            ]}
          />
        }
      />

      {alerts.isPending ? (
        <SkeletonList rows={4} />
      ) : alerts.isError ? (
        <ErrorState onRetry={() => void alerts.refetch()} retrying={alerts.isFetching} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={tab === 'open' ? CircleCheck : BellOff}
          title={tab === 'open' ? t('dashboard.noOpenAlerts') : t('alerts.empty')}
          description={tab === 'open' ? t('alerts.allClear') : undefined}
        />
      ) : (
        <ul className="alert-feed">
          {visible.map((alert) => (
            <li
              key={alert.id}
              className={`alert-row alert-row--${alert.severity}${alert.resolvedAt ? ' is-resolved' : ''}`}
            >
              <span className="alert-row__stripe" aria-hidden="true" />
              <div className="alert-row__main">
                <div className="alert-row__top">
                  <h2 className="alert-row__title">{t(`alerts.type.${alert.type}`)}</h2>
                  <SeverityBadge severity={alert.severity} />
                  {alert.resolvedAt ? (
                    <Badge tone="success" icon={<CircleCheck />}>
                      {t('alerts.resolved')}
                    </Badge>
                  ) : (
                    <Badge tone="danger" icon={<CircleDot />}>
                      {t('alerts.open')}
                    </Badge>
                  )}
                </div>
                <p className="alert-row__message">{alert.message}</p>
                <p className="alert-row__meta">
                  <time dateTime={alert.createdAt} title={formatDateTime(alert.createdAt)}>
                    {formatRelative(alert.createdAt, now)}
                  </time>
                  {alert.classroomName && <span>{alert.classroomName}</span>}
                  {alert.cameraName && <span>{alert.cameraName}</span>}
                  {alert.resolvedAt && (
                    <span>
                      {alert.resolvedBy && alert.resolvedBy === user?.id
                        ? t('alerts.resolvedByYou', { when: formatDateTime(alert.resolvedAt) })
                        : t('alerts.resolvedAt', { when: formatDateTime(alert.resolvedAt) })}
                    </span>
                  )}
                </p>
              </div>
              {canResolve && !alert.resolvedAt && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<CircleCheck size={15} aria-hidden="true" />}
                  loading={resolve.isPending && resolve.variables?.id === alert.id}
                  onClick={() => resolve.mutate(alert)}
                >
                  {t('alerts.resolve')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
