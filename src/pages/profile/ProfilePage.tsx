import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, KeyRound, LogOut, Mail, Save, ShieldCheck, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FULL_NAME_MAX, updateMyName } from '../../api/me'
import { queryKeys } from '../../api/queryKeys'
import { useSession } from '../../auth/authContext'
import { useMe } from '../../auth/useRole'
import { Alert } from '../../components/ui/Alert'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { Field, TextInput } from '../../components/ui/Field'
import { PageIntro } from '../../components/ui/PageIntro'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { formatDate } from '../../lib/format'
import './ProfilePage.css'

export function ProfilePage() {
  const { t } = useTranslation()
  const { user, signOut } = useSession()
  const me = useMe()
  const queryClient = useQueryClient()
  const [nameError, setNameError] = useState<string | null>(null)

  const saveName = useMutation({
    mutationFn: (fullName: string) => updateMyName(user!.id, fullName),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  })

  if (me.isPending || !me.data) {
    return (
      <div className="profile-grid">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={4} />
      </div>
    )
  }

  const profile = me.data
  const role = profile.role ?? 'viewer'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fullName = String(new FormData(event.currentTarget).get('fullName') ?? '').trim()
    if (fullName === '') {
      setNameError(t('auth.validation.nameRequired'))
      return
    }
    setNameError(null)
    saveName.mutate(fullName)
  }

  return (
    <>
      <PageIntro description={t('profile.description')} />
      <div className="profile-grid">
        <Card className="profile-hero">
          <div className="profile-hero__banner" aria-hidden="true" />
          <div className="profile-hero__body">
            <Avatar name={profile.fullName} imageUrl={profile.avatarUrl} size="xl" />
            <h2 className="profile-hero__name">{profile.fullName}</h2>
            <Badge tone={role === 'admin' ? 'violet' : role === 'teacher' ? 'accent' : 'neutral'}>
              {t(`roles.${role}`)}
            </Badge>
            <dl className="profile-hero__facts">
              <div>
                <dt>
                  <Mail size={15} aria-hidden="true" />
                  {t('auth.email')}
                </dt>
                <dd>{profile.email ?? '—'}</dd>
              </div>
              <div>
                <dt>
                  <CalendarDays size={15} aria-hidden="true" />
                  {t('profile.memberSince')}
                </dt>
                <dd>{profile.createdAt ? formatDate(profile.createdAt) : '—'}</dd>
              </div>
            </dl>
            <Button
              variant="secondary"
              block
              icon={<LogOut size={16} aria-hidden="true" />}
              onClick={() => void signOut()}
            >
              {t('auth.logout')}
            </Button>
          </div>
        </Card>

        <div className="profile-stack">
          <Card>
            <CardHeader
              icon={<UserRound size={18} />}
              title={t('profile.personalTitle')}
              description={t('profile.personalDescription')}
            />
            <form className="profile-form" onSubmit={handleSubmit} noValidate>
              <Field label={t('auth.fullName')} error={nameError}>
                {({ id, describedBy, invalid }) => (
                  <TextInput
                    id={id}
                    name="fullName"
                    autoComplete="name"
                    maxLength={FULL_NAME_MAX}
                    defaultValue={profile.fullName}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                  />
                )}
              </Field>
              {saveName.isSuccess && (
                <Alert tone="success" live="polite">
                  {t('profile.saved')}
                </Alert>
              )}
              {saveName.isError && (
                <Alert tone="danger" live="assertive">
                  {t('profile.saveError')}
                </Alert>
              )}
              <div className="profile-form__actions">
                <Button
                  type="submit"
                  loading={saveName.isPending}
                  icon={<Save size={16} aria-hidden="true" />}
                >
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader
              icon={<ShieldCheck size={18} />}
              title={t('profile.permissionsTitle')}
              description={t(`profile.permissions.${role}`)}
            />
            <p className="profile-note">{t('profile.permissionsNote')}</p>
          </Card>

          <Card>
            <CardHeader
              icon={<KeyRound size={18} />}
              title={t('profile.securityTitle')}
              description={t('profile.securityDescription')}
              actions={
                <ButtonLink to="/recuperar/nueva" size="sm">
                  {t('profile.changePassword')}
                </ButtonLink>
              }
            />
          </Card>
        </div>
      </div>
    </>
  )
}
