import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import './Skeleton.css'

interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rect'
  width?: number | string
  height?: number | string
  className?: string
}

/** One placeholder shape with the shimmer (DESIGN_SYSTEM.md §8.5). Decorative on its own. */
export function Skeleton({ variant = 'text', width, height, className }: SkeletonProps) {
  const style: CSSProperties = { width, height }
  return (
    <span
      className={`skeleton skeleton--${variant}${className ? ` ${className}` : ''}`}
      style={style}
      aria-hidden="true"
    />
  )
}

interface LoadingRegionProps {
  children: ReactNode
  label?: string
  className?: string
}

/**
 * Wraps skeleton shapes: marks the region busy and gives screen readers a single
 * "Cargando…" instead of a pile of empty shapes.
 */
export function LoadingRegion({ children, label, className }: LoadingRegionProps) {
  const { t } = useTranslation()
  return (
    <div className={className} aria-busy="true" role="status">
      <span className="visually-hidden">{label ?? t('common.loading')}</span>
      {children}
    </div>
  )
}

export function SkeletonText({
  lines = 3,
  lastWidth = '60%',
}: {
  lines?: number
  lastWidth?: string
}) {
  return (
    <span className="skeleton-text" aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} width={index === lines - 1 && lines > 1 ? lastWidth : '100%'} />
      ))}
    </span>
  )
}

/** Same footprint as a StatCard: label, big number, meta line. */
export function SkeletonStatCard() {
  return (
    <LoadingRegion className="skeleton-card">
      <span className="skeleton-card__row">
        <Skeleton width="45%" />
        <Skeleton variant="rect" width={36} height={36} />
      </span>
      <Skeleton width="55%" height={36} />
      <Skeleton width="70%" />
    </LoadingRegion>
  )
}

/** Generic card body: header line and a few text lines. */
export function SkeletonCard({ lines = 4 }: { lines?: number }) {
  return (
    <LoadingRegion className="skeleton-card">
      <Skeleton width="40%" height={16} />
      <SkeletonText lines={lines} />
    </LoadingRegion>
  )
}

/** A list of rows with an avatar circle, two text lines and a trailing pill. */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <LoadingRegion className="skeleton-list">
      {Array.from({ length: rows }, (_, index) => (
        <span className="skeleton-list__row" key={index}>
          <Skeleton variant="circle" width={36} height={36} />
          <span className="skeleton-list__text">
            <Skeleton width="55%" />
            <Skeleton width="30%" height={10} />
          </span>
          <Skeleton variant="rect" width={64} height={22} />
        </span>
      ))}
    </LoadingRegion>
  )
}

/** Table placeholder: header plus `rows` rows (5 by default, §8.5). */
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <LoadingRegion className="skeleton-table">
      <span className="skeleton-table__row skeleton-table__row--head">
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={index} width="50%" height={10} />
        ))}
      </span>
      {Array.from({ length: rows }, (_, row) => (
        <span className="skeleton-table__row" key={row}>
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton key={column} width={column === 0 ? '80%' : '60%'} />
          ))}
        </span>
      ))}
    </LoadingRegion>
  )
}

/** Chart placeholder: grey plot area with axis ticks and bars. */
export function SkeletonChart({ height = 260 }: { height?: number }) {
  const bars = [40, 65, 30, 80, 55, 90, 45, 70, 35, 60, 50, 75]
  return (
    <LoadingRegion className="skeleton-chart">
      <span className="skeleton-chart__plot" style={{ height }}>
        <span className="skeleton-chart__axis" aria-hidden="true">
          {[0, 1, 2, 3].map((tick) => (
            <Skeleton key={tick} width={22} height={8} />
          ))}
        </span>
        <span className="skeleton-chart__bars" aria-hidden="true">
          {bars.map((value, index) => (
            <Skeleton key={index} variant="rect" height={`${value}%`} />
          ))}
        </span>
      </span>
    </LoadingRegion>
  )
}
