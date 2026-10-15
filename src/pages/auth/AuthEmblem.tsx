import { BrandMark } from '../../components/BrandMark'

/**
 * Decorative emblem above the auth form on desktop: the logo inside detection rings, watched by
 * the two pilot cameras (outside in sky blue, inside in violet). Pure SVG + CSS, no photos.
 */
export function AuthEmblem() {
  return (
    <div className="auth-emblem" aria-hidden="true">
      <svg className="auth-emblem__rings" viewBox="0 0 280 150" focusable="false">
        <circle className="auth-emblem__pulse" cx="140" cy="75" r="44" />
        <circle cx="140" cy="75" r="66" fill="none" stroke="#38BDF8" strokeOpacity="0.12" />
        <circle
          cx="140"
          cy="75"
          r="54"
          fill="none"
          stroke="#38BDF8"
          strokeOpacity="0.28"
          strokeDasharray="3 7"
        />
        <circle cx="140" cy="75" r="40" fill="#38BDF8" fillOpacity="0.07" />

        {/* Camera beams toward the doorway */}
        <path d="M52 40 L118 66" stroke="#38BDF8" strokeOpacity="0.35" strokeDasharray="4 6" />
        <path d="M228 40 L162 66" stroke="#A78BFA" strokeOpacity="0.4" strokeDasharray="4 6" />

        {/* camera-outside */}
        <g transform="translate(24 30)">
          <rect width="34" height="18" rx="5" fill="#E0F2FE" />
          <circle cx="26" cy="9" r="4.5" fill="#0EA5E9" />
          <circle cx="7" cy="6" r="2" fill="#4ADE80" />
        </g>
        {/* camera-inside */}
        <g transform="translate(222 30)">
          <rect width="34" height="18" rx="5" fill="#EDE9FE" />
          <circle cx="8" cy="9" r="4.5" fill="#8B5CF6" />
          <circle cx="27" cy="6" r="2" fill="#4ADE80" />
        </g>

        {/* Entry / exit ticks under the rings */}
        <g strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth="3">
          <path d="M64 128 H96" stroke="#4ADE80" />
          <path d="M90 122 L97 128 L90 134" stroke="#4ADE80" />
          <path d="M216 128 H184" stroke="#F472B6" />
          <path d="M190 122 L183 128 L190 134" stroke="#F472B6" />
        </g>
      </svg>
      <span className="auth-emblem__mark">
        <BrandMark size={60} />
      </span>
    </div>
  )
}
