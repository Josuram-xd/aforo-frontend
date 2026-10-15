import { useTranslation } from 'react-i18next'
import type { AuditItem } from '../../api/types'
import type { Json } from '../../types/database'
import { Badge } from '../../components/ui/Badge'
import { Dialog } from '../../components/ui/Dialog'
import { formatDateTime } from '../../lib/format'

type JsonObject = { [key: string]: Json | undefined }

function asObject(value: Json | null): JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function show(value: Json | undefined): string {
  if (value === undefined) return '—'
  return typeof value === 'string' ? value : JSON.stringify(value)
}

/** Before/after of one audit entry. Values are rendered as plain text (React escapes them). */
export function AuditDetailDialog({
  entry,
  onClose,
}: {
  entry: AuditItem | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  if (!entry) return null

  const before = asObject(entry.oldData)
  const after = asObject(entry.newData)
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)])).sort()

  return (
    <Dialog
      open
      size="lg"
      onClose={onClose}
      title={t(`audit.actions.${entry.action}`, { defaultValue: entry.action })}
      description={t('audit.detailMeta', {
        when: formatDateTime(entry.createdAt),
        who: entry.actorName ?? entry.actorEmail ?? t('audit.system'),
      })}
    >
      <dl className="audit-facts">
        <div>
          <dt>{t('audit.columns.table')}</dt>
          <dd>{entry.tableName ?? '—'}</dd>
        </div>
        <div>
          <dt>{t('audit.recordId')}</dt>
          <dd className="audit-mono">{entry.recordId ?? '—'}</dd>
        </div>
      </dl>
      {keys.length === 0 ? (
        <p className="muted">{t('audit.noChanges')}</p>
      ) : (
        <div className="table-wrap">
          <table className="table audit-diff">
            <caption className="visually-hidden">{t('audit.diffCaption')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('audit.field')}</th>
                <th scope="col">{t('audit.before')}</th>
                <th scope="col">{t('audit.after')}</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => {
                const changed = show(before[key]) !== show(after[key])
                return (
                  <tr key={key} className={changed ? 'is-changed' : undefined}>
                    <th scope="row" className="audit-mono">
                      {key}
                      {changed && (
                        <>
                          {' '}
                          <Badge tone="warning">{t('audit.changed')}</Badge>
                        </>
                      )}
                    </th>
                    <td className="audit-mono">{show(before[key])}</td>
                    <td className="audit-mono">{show(after[key])}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Dialog>
  )
}
