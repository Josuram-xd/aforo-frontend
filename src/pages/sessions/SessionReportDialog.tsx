import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { SessionReport, TimelineItem } from '../../api/reports'
import type { SessionItem } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Dialog } from '../../components/ui/Dialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { SkeletonList } from '../../components/ui/Skeleton'
import { useSessionReport } from '../../hooks/queries'
import { formatTime } from '../../lib/format'
import './SessionReportDialog.css'

interface Nav {
  cursor?: string
  dir?: 'next' | 'prev'
}

/** A report block: title plus a caption naming the data structure behind it. */
function ReportBlock({
  title,
  caption,
  children,
}: {
  title: string
  caption: string
  children: ReactNode
}) {
  return (
    <Card as="article">
      <CardHeader title={title} description={caption} />
      {children}
    </Card>
  )
}

interface PersonRow {
  key: string
  name: string
  at: string
  extra?: ReactNode
}

function PersonList({
  rows,
  empty,
  time,
}: {
  rows: PersonRow[]
  empty: string
  time: (at: string) => string
}) {
  if (rows.length === 0) return <p className="session-report__empty">{empty}</p>
  return (
    <ol className="session-report__list">
      {rows.map((row, index) => (
        <li key={row.key}>
          <span className="session-report__index tabular">{index + 1}</span>
          <span className="session-report__name">{row.name}</span>
          {row.extra}
          <span className="tabular session-report__time">{time(row.at)}</span>
        </li>
      ))}
    </ol>
  )
}

function ReportBody({ report, onNav }: { report: SessionReport; onNav: (nav: Nav) => void }) {
  const { t } = useTranslation()
  const none = t('sessions.report.none')
  const { timeline } = report

  const columns: Column<TimelineItem>[] = [
    {
      key: 'time',
      header: t('sessions.report.columns.time'),
      render: (row) => <span className="tabular">{formatTime(row.occurredAt)}</span>,
    },
    {
      key: 'person',
      header: t('sessions.report.columns.person'),
      render: (row) => row.fullName ?? t('sessions.report.unknown'),
    },
    {
      key: 'direction',
      header: t('sessions.report.columns.direction'),
      render: (row) => (
        <Badge tone={row.direction === 'ENTRY' ? 'success' : 'neutral'}>
          {t(row.direction === 'ENTRY' ? 'events.direction.entry' : 'events.direction.exit')}
        </Badge>
      ),
    },
    {
      key: 'method',
      header: t('sessions.report.columns.method'),
      hideOnMobile: true,
      render: (row) => t(row.method === 'FACE' ? 'events.method.face' : 'events.method.body'),
    },
  ]

  return (
    <div className="session-report">
      <div className="session-report__grid">
        <ReportBlock
          title={t('sessions.report.arrival')}
          caption={t('sessions.report.arrivalCaption')}
        >
          <PersonList
            empty={none}
            time={formatTime}
            rows={report.arrivalOrder.map((r) => ({
              key: r.studentId,
              name: r.fullName,
              at: r.firstEntryAt,
            }))}
          />
        </ReportBlock>
        <ReportBlock
          title={t('sessions.report.inside')}
          caption={t('sessions.report.insideCaption')}
        >
          <PersonList
            empty={none}
            time={(at) => t('sessions.report.since', { time: formatTime(at) })}
            rows={report.insideNow.map((r) => ({
              key: r.studentId,
              name: r.fullName,
              at: r.since,
            }))}
          />
        </ReportBlock>
        <ReportBlock
          title={t('sessions.report.anomalies')}
          caption={t('sessions.report.anomaliesCaption')}
        >
          <PersonList
            empty={none}
            time={formatTime}
            rows={report.anomalies.map((r) => ({
              key: `${r.studentId}-${r.kind}-${r.at}`,
              name: r.fullName,
              at: r.at,
              extra: <Badge tone="warning">{t(`sessions.report.kind.${r.kind}`)}</Badge>,
            }))}
          />
        </ReportBlock>
        <ReportBlock
          title={t('sessions.report.lastEntries')}
          caption={t('sessions.report.lastEntriesCaption')}
        >
          <PersonList
            empty={none}
            time={formatTime}
            rows={report.lastEntries.map((r, i) => ({
              key: `${r.studentId}-${i}`,
              name: r.fullName,
              at: r.at,
            }))}
          />
        </ReportBlock>
      </div>

      <Card as="article">
        <CardHeader title={t('sessions.report.peak')} />
        <p className="session-report__peak">
          {report.peak.at ? (
            <>
              <strong className="tabular">
                {t('sessions.report.peakValue', { count: report.peak.count })}
              </strong>{' '}
              {t('sessions.report.peakAt', { time: formatTime(report.peak.at) })}
            </>
          ) : (
            t('sessions.report.peakNone')
          )}
        </p>
      </Card>

      <ReportBlock
        title={t('sessions.report.timeline')}
        caption={t('sessions.report.timelineCaption')}
      >
        <DataTable
          caption={t('sessions.report.timeline')}
          columns={columns}
          rows={timeline.items}
          rowKey={(row) => row.id}
          empty={<EmptyState compact title={none} />}
        />
        <div className="session-report__nav">
          <Button
            variant="secondary"
            size="sm"
            disabled={!timeline.prevCursor}
            onClick={() => onNav({ cursor: timeline.prevCursor!, dir: 'prev' })}
          >
            {t('sessions.report.prev')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!timeline.nextCursor}
            onClick={() => onNav({ cursor: timeline.nextCursor!, dir: 'next' })}
          >
            {t('sessions.report.next')}
          </Button>
        </div>
      </ReportBlock>
    </div>
  )
}

/** "Reporte de la sesión": the backend's queue/stack/list structures shown block by block. */
export function SessionReportDialog({
  session,
  onClose,
}: {
  session: SessionItem
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [nav, setNav] = useState<Nav>({})
  const report = useSessionReport(session.id, nav.cursor, nav.dir)

  return (
    <Dialog
      open
      size="lg"
      onClose={onClose}
      title={t('sessions.report.title')}
      description={t('sessions.report.description', { title: session.title })}
      footer={<Button onClick={onClose}>{t('common.close')}</Button>}
    >
      {report.isPending ? (
        <SkeletonList rows={6} />
      ) : report.isError ? (
        <ErrorState compact onRetry={() => void report.refetch()} retrying={report.isFetching} />
      ) : (
        <ReportBody report={report.data} onNav={setNav} />
      )}
    </Dialog>
  )
}
