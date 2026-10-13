import { useTranslation } from 'react-i18next'
import { passwordStrength } from '../../auth/passwordStrength'

const LEVEL_KEYS = ['veryWeak', 'weak', 'fair', 'good', 'strong'] as const

/** Four-segment meter with a text label (never color only). */
export function PasswordStrengthMeter({ password, id }: { password: string; id?: string }) {
  const { t } = useTranslation()
  const level = passwordStrength(password)
  const label = t(`auth.strength.${LEVEL_KEYS[level]}`)

  return (
    <div className={`strength strength--${level}`} id={id} aria-live="polite">
      <span className="strength__bars" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`strength__bar${password && level >= segment ? ' strength__bar--on' : ''}`}
          />
        ))}
      </span>
      <span className="strength__label">
        {password ? t('auth.strength.label', { level: label }) : t('auth.strength.hint')}
      </span>
    </div>
  )
}
