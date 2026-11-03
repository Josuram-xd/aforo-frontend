import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { EventItem } from '../../api/types'
import { bucketByHour } from '../../lib/hourBuckets'
import { useTheme } from '../../theme/theme'
import { CHART_COLORS } from './chartTheme'
import './charts.css'

interface TooltipEntry {
  dataKey?: unknown
  name?: unknown
  value?: unknown
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: readonly TooltipEntry[]
  label?: unknown
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  const { t } = useTranslation()
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__title">{t('chart.hourRange', { hour: String(label) })}</p>
      {payload.map((item) => (
        <p className="chart-tooltip__row" key={String(item.dataKey)}>
          <span className="chart-tooltip__swatch" style={{ background: item.color }} />
          <span>{String(item.name)}</span>
          <strong className="tabular">{String(item.value)}</strong>
        </p>
      ))}
    </div>
  )
}

interface EntriesPerHourChartProps {
  events: EventItem[]
  height?: number
}

/** Entries and exits per hour of the day (America/Bogota), grouped bars + table view. */
export default function EntriesPerHourChart({ events, height = 280 }: EntriesPerHourChartProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const colors = CHART_COLORS[theme]
  const data = useMemo(() => bucketByHour(events), [events])
  const [showTable, setShowTable] = useState(false)
  const entriesLabel = t('chart.entries')
  const exitsLabel = t('chart.exits')

  return (
    <div className="chart">
      <div className="chart__toolbar">
        <ul className="chart__legend" aria-label={t('chart.legend')}>
          <li>
            <span className="chart__legend-swatch" style={{ background: colors.entry }} />
            {entriesLabel}
          </li>
          <li>
            <span className="chart__legend-swatch" style={{ background: colors.exit }} />
            {exitsLabel}
          </li>
        </ul>
        <button
          type="button"
          className="chart__table-toggle"
          aria-expanded={showTable}
          onClick={() => setShowTable((value) => !value)}
        >
          {showTable ? t('chart.showChart') : t('chart.showTable')}
        </button>
      </div>

      {showTable ? (
        <div className="table-wrap chart__table">
          <table className="table">
            <caption className="visually-hidden">{t('chart.tableCaption')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('chart.hour')}</th>
                <th scope="col" className="align-right">
                  {entriesLabel}
                </th>
                <th scope="col" className="align-right">
                  {exitsLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter((row) => row.entries + row.exits > 0)
                .map((row) => (
                  <tr key={row.hour}>
                    <td className="tabular">{row.label}</td>
                    <td className="align-right tabular">{row.entries}</td>
                    <td className="align-right tabular">{row.exits}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="chart__plot"
          role="img"
          aria-label={t('chart.ariaSummary', {
            entries: events.filter((e) => e.direction === 'ENTRY').length,
            exits: events.filter((e) => e.direction === 'EXIT').length,
          })}
        >
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              barGap={2}
              barCategoryGap="22%"
              margin={{ top: 8, right: 4, bottom: 0, left: -18 }}
            >
              <CartesianGrid vertical={false} stroke={colors.grid} strokeDasharray="3 4" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: colors.grid }}
                tick={{ fill: colors.axis, fontSize: 12 }}
                interval="preserveStartEnd"
                minTickGap={12}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: colors.axis, fontSize: 12 }}
                width={44}
              />
              <Tooltip
                cursor={{ fill: colors.cursor, radius: 6 }}
                content={(props) => (
                  <ChartTooltip active={props.active} payload={props.payload} label={props.label} />
                )}
              />
              <Bar
                dataKey="entries"
                name={entriesLabel}
                fill={colors.entry}
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
                isAnimationActive={false}
              />
              <Bar
                dataKey="exits"
                name={exitsLabel}
                fill={colors.exit}
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
