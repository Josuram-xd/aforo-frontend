import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { errorMessageKey } from '../../api/errors'
import { deleteCourse } from '../../api/facilities'
import { queryKeys } from '../../api/queryKeys'
import type { Course } from '../../api/types'
import { useRole } from '../../auth/useRole'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { PageIntro } from '../../components/ui/PageIntro'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/toastContext'
import { useCourses, useEnrollmentCounts } from '../../hooks/queries'
import { CourseDialog } from '../admin/SettingsDialogs'
import { CourseStudentsDialog } from './CourseStudentsDialog'

/** Cursos: teachers and admins create and edit courses and enroll students; only admins delete. */
export function CoursesPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { role } = useRole()
  const courses = useCourses()
  const counts = useEnrollmentCounts()
  const [editing, setEditing] = useState<Course | null | undefined>(undefined)
  const [managing, setManaging] = useState<Course | null>(null)
  const [deleting, setDeleting] = useState<Course | null>(null)

  const remove = useMutation({
    mutationFn: (course: Course) => deleteCourse(course.id),
    onSuccess: (_, course) => toast.success(t('settings.toast.deleted', { name: course.name })),
    onError: (error) => toast.error(t(errorMessageKey(error))),
    onSettled: () => {
      setDeleting(null)
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses })
    },
  })

  const columns: Column<Course>[] = [
    {
      key: 'name',
      header: t('settings.courses.name'),
      sortValue: (row) => row.name,
      render: (row) => (
        <span className="cell-primary__text">
          <span className="cell-primary__title">{row.name}</span>
          <span className="cell-primary__meta">
            {row.code}
            {row.academic_period ? ` · ${row.academic_period}` : ''}
          </span>
        </span>
      ),
    },
    {
      key: 'students',
      header: t('courses.students'),
      sortValue: (row) => counts.data?.[row.id] ?? 0,
      render: (row) => (
        <Badge tone="accent" icon={<Users />}>
          {t('courses.enrolledCount', { count: counts.data?.[row.id] ?? 0 })}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: t('settings.courses.status'),
      hideOnMobile: true,
      render: (row) => (
        <Badge tone={row.is_active ? 'success' : 'neutral'}>
          {t(row.is_active ? 'settings.courses.active' : 'settings.courses.inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: <span className="visually-hidden">{t('common.actions')}</span>,
      align: 'right',
      render: (row) => (
        <span className="cell-actions">
          <Button
            variant="ghost"
            size="sm"
            icon={<Users size={14} aria-hidden="true" />}
            aria-label={t('courses.manageNamed', { name: row.name })}
            onClick={() => setManaging(row)}
          >
            {t('courses.manage')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Pencil size={14} aria-hidden="true" />}
            aria-label={t('settings.editNamed', { name: row.name })}
            onClick={() => setEditing(row)}
          />
          {role === 'admin' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={14} aria-hidden="true" />}
              aria-label={t('settings.deleteNamed', { name: row.name })}
              onClick={() => setDeleting(row)}
            />
          )}
        </span>
      ),
    },
  ]

  return (
    <>
      <PageIntro
        description={t('courses.description')}
        actions={
          <Button icon={<Plus size={16} aria-hidden="true" />} onClick={() => setEditing(null)}>
            {t('courses.create')}
          </Button>
        }
      />
      <Card>
        {courses.isPending ? (
          <SkeletonTable rows={4} columns={4} />
        ) : courses.isError ? (
          <ErrorState onRetry={() => void courses.refetch()} retrying={courses.isFetching} />
        ) : (
          <DataTable
            caption={t('courses.tableCaption')}
            columns={columns}
            rows={courses.data}
            rowKey={(row) => row.id}
            empty={
              <EmptyState
                icon={BookOpen}
                title={t('courses.empty')}
                description={t('courses.emptyHint')}
              />
            }
          />
        )}
      </Card>

      {editing !== undefined && (
        <CourseDialog
          course={editing}
          onClose={() => setEditing(undefined)}
          onSaved={(name) => toast.success(t('settings.toast.saved', { name }))}
        />
      )}
      {managing && <CourseStudentsDialog course={managing} onClose={() => setManaging(null)} />}
      <ConfirmDialog
        open={deleting !== null}
        title={t('settings.confirmDeleteCourse')}
        description={t('settings.confirmDeleteText', { name: deleting?.name ?? '' })}
        confirmLabel={t('settings.delete')}
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
