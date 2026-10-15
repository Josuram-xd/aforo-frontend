import { useId } from 'react'

interface BrandMarkProps {
  size?: number
}

/** Product logo: a doorway with an entry arrow, on the accent gradient. Decorative. */
export function BrandMark({ size = 32 }: BrandMarkProps) {
  const gradientId = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#38BDF8" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <path
        d="M12 24V9.5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 22 9.5V24"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M8 24h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6.5 16h8m-2.5-2.75L14.75 16 12 18.75"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="16.5" r="1.1" fill="#fff" />
    </svg>
  )
}
