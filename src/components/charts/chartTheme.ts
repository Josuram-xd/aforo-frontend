import type { Theme } from '../../theme/theme'

// Chart series colors, validated with the dataviz palette checker (lightness band, chroma,
// colorblind separation ΔE ≥ 13, contrast ≥ 3:1) against each theme's card surface.
// Entries/exits use blue/magenta instead of the green/red badge pair because green/red fails
// the deuteranopia check; the legend and tooltip always name the series as well.
export const CHART_COLORS: Record<
  Theme,
  { entry: string; exit: string; grid: string; axis: string; cursor: string }
> = {
  dark: {
    entry: '#0891D1',
    exit: '#E0428F',
    grid: '#2B3A50',
    axis: '#94A3B8',
    cursor: 'rgb(148 163 184 / 0.12)',
  },
  light: {
    entry: '#0284C7',
    exit: '#DB2777',
    grid: '#E2E8F0',
    axis: '#475569',
    cursor: 'rgb(71 85 105 / 0.08)',
  },
}
