import { useId } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Classroom doorway watched by the two pilot cameras (outside + inside), with the entry/exit
 * paths and a live occupancy card. Pure SVG, decorative, no photos of people.
 */
export function AuthIllustration() {
  const { t } = useTranslation()
  const id = useId().replace(/:/g, '')
  const glow = `${id}-glow`
  const door = `${id}-door`
  const card = `${id}-card`

  return (
    <svg
      className="auth-illustration"
      viewBox="0 0 480 360"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={glow} cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#38BDF8" stopOpacity="0.35" />
          <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={door} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E3A5F" />
          <stop offset="1" stopColor="#0F213A" />
        </linearGradient>
        <linearGradient id={card} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      <ellipse cx="240" cy="190" rx="230" ry="170" fill={`url(#${glow})`} />

      {/* Floor */}
      <path d="M40 300 H440" stroke="#7DD3FC" strokeOpacity="0.35" strokeWidth="2" />
      <path
        d="M80 320 H400"
        stroke="#7DD3FC"
        strokeOpacity="0.15"
        strokeWidth="2"
        strokeDasharray="4 8"
      />

      {/* Wall + doorway */}
      <rect x="120" y="70" width="240" height="230" rx="6" fill="#0B1A2E" opacity="0.55" />
      <rect x="185" y="110" width="110" height="190" rx="8" fill={`url(#${door})`} />
      <rect
        x="185"
        y="110"
        width="110"
        height="190"
        rx="8"
        fill="none"
        stroke="#7DD3FC"
        strokeOpacity="0.7"
        strokeWidth="3"
      />
      <circle cx="277" cy="210" r="4" fill="#7DD3FC" />

      {/* Detection zones */}
      <path
        d="M150 92 L120 300 H230 Z"
        fill="#38BDF8"
        opacity="0.08"
        stroke="#38BDF8"
        strokeOpacity="0.35"
        strokeDasharray="5 6"
      />
      <path
        d="M330 92 L250 300 H360 Z"
        fill="#A78BFA"
        opacity="0.08"
        stroke="#A78BFA"
        strokeOpacity="0.4"
        strokeDasharray="5 6"
      />

      {/* Cameras */}
      <g transform="translate(132 72)">
        <rect width="38" height="20" rx="5" fill="#E0F2FE" />
        <circle cx="30" cy="10" r="5" fill="#0EA5E9" />
        <rect x="14" y="-12" width="4" height="12" fill="#E0F2FE" opacity="0.8" />
        <circle cx="6" cy="6" r="2" fill="#4ADE80" />
      </g>
      <g transform="translate(310 72)">
        <rect width="38" height="20" rx="5" fill="#EDE9FE" />
        <circle cx="8" cy="10" r="5" fill="#8B5CF6" />
        <rect x="20" y="-12" width="4" height="12" fill="#EDE9FE" opacity="0.8" />
        <circle cx="32" cy="6" r="2" fill="#4ADE80" />
      </g>

      {/* Entry / exit arrows */}
      <g strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth="4">
        <path d="M70 250 H170" stroke="#4ADE80" />
        <path d="M156 236 L172 250 L156 264" stroke="#4ADE80" />
        <path d="M410 214 H310" stroke="#F472B6" />
        <path d="M324 200 L308 214 L324 228" stroke="#F472B6" />
      </g>
      <text
        x="70"
        y="236"
        fill="#BBF7D0"
        fontSize="13"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        {t('events.direction.entry')}
      </text>
      <text
        x="410"
        y="200"
        fill="#FBCFE8"
        fontSize="13"
        fontWeight="600"
        textAnchor="end"
        fontFamily="Inter, sans-serif"
      >
        {t('events.direction.exit')}
      </text>

      {/* Live occupancy card */}
      <g transform="translate(318 236)">
        <rect
          width="132"
          height="78"
          rx="14"
          fill={`url(#${card})`}
          stroke="#FFFFFF"
          strokeOpacity="0.25"
        />
        <circle cx="18" cy="20" r="4" fill="#4ADE80" />
        <text
          x="28"
          y="24"
          fill="#E2E8F0"
          fontSize="11"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          {t('live.connected').toUpperCase()}
        </text>
        <text
          x="16"
          y="60"
          fill="#FFFFFF"
          fontSize="30"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          18
        </text>
        <text
          x="58"
          y="60"
          fill="#CBD5E1"
          fontSize="15"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          / 30
        </text>
        <rect x="16" y="66" width="100" height="4" rx="2" fill="#FFFFFF" opacity="0.2" />
        <rect x="16" y="66" width="60" height="4" rx="2" fill="#38BDF8" />
      </g>

      {/* Face-identified chip */}
      <g transform="translate(30 120)">
        <rect
          width="116"
          height="34"
          rx="17"
          fill={`url(#${card})`}
          stroke="#FFFFFF"
          strokeOpacity="0.25"
        />
        <circle cx="18" cy="17" r="7" fill="none" stroke="#7DD3FC" strokeWidth="2" />
        <path d="M15 17 l2 2 l4 -4" stroke="#7DD3FC" strokeWidth="2" fill="none" />
        <text
          x="32"
          y="21"
          fill="#E0F2FE"
          fontSize="12"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          {t('authPanel.illustrationFace')}
        </text>
      </g>
    </svg>
  )
}
