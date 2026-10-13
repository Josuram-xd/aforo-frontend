import { ChartColumnBig } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { SkeletonChart } from '../../components/ui/Skeleton'
import { useDayEvents } from '../../hooks/queries'

// Recharts is the heaviest dependency: loaded only when a chart is on screen.
const EntriesPerHourChart = lazy(() => import('../../components/charts/EntriesPerHourChart'))

const CHART_HEIGHT = 280

export function HourlyChartCard({
  classroomId,
  day,
}: {
  classroomId: string | undefined
  day: string
}) {
  const { t } = useTranslation()
  const events = useDayEvents(classroomId, day)

  let body
  if (events.isPending) body = <SkeletonChart height={CHART_HEIGHT} />
  else if (events.isError)
    body = <ErrorState compact onRetry={() => void events.refetch()} retrying={events.isFetching} />
  else if (events.data.length === 0)
    body = (
      <EmptyState
        icon={ChartColumnBig}
        title={t('chart.empty')}
        description={t('chart.emptyHint')}
      />
    )
  else
    body = (
      <Suspense fallback={<SkeletonChart height={CHART_HEIGHT} />}>
        <EntriesPerHourChart events={events.data} height={CHART_HEIGHT} />
      </Suspense>
    )

  return (
    <Card aria-labelledby="hourly-chart-title">
      <CardHeader
        titleId="hourly-chart-title"
        icon={<ChartColumnBig size={18} />}
        title={t('chart.title')}
        description={t('chart.description')}
      />
      {body}
    </Card>
  )
}
