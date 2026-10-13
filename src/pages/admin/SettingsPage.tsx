import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Cctv, DoorOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { errorMessageKey } from '../../api/errors'
import { deleteClassroom, deleteCourse } from '../../api/facilities'
import { queryKeys } from '../../api/queryKeys'
import type { Camera, Classroom, Course } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { PageIntro } from '../../components/ui/PageIntro'
import { SkeletonTable } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/toastContext'
import { useCameras, useClassrooms, useCourses } from '../../hooks/queries'
import { CameraDialog, ClassroomDialog, CourseDialog } from './SettingsDialogs'
import './SettingsPage.css'

type Editing =
  | { kind: 'classroom'; item: Classroom | null }
  | { kind: 'course'; item: Course | null }
  | { kind: 'camera'; item: Camera }
  | null

/** Configuración: classrooms (max capacity), courses and camera names (admin). */
export function SettingsPage() {
  const { t } = useTranslation()
  const classrooms = useClassrooms()
  const courses = useCourses()
  const cameras = useCameras()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Editing>(null)

  const toast = useToast()
  const [deleting, setDeleting] = useState<
    { kind: 'classroom'; item: Classroom } | { kind: 'course'; item: Course } | null
  >(null)
  const onDeleted = (name: string) => {
    toast.success(t('settings.toast.deleted', { name }))
    setDeleting(null)
  }
  const onDeleteError = (error: unknown) => {
    toast.error(t(errorMessageKey(error)))
    setDeleting(null)
  }

  const removeClassroom = useMutation({
    mutationFn: (room: Classroom) => deleteClassroom(room.id),
    onSuccess: (_, room) => onDeleted(room.name),
    onError: onDeleteError,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.classrooms }),
  })
  const removeCourse = useMutation({
    mutationFn: (course: Course) => deleteCourse(course.id),
    onSuccess: (_, course) => onDeleted(course.name),
    onError: onDeleteError,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.courses }),
  })
  const saved = (name: string) => toast.success(t('settings.toast.saved', { name }))

  const roomName = (id: string) => classrooms.data?.find((room) => room.id === id)?.name ?? '—'

  const classroomColumns: Column<Classroom>[] = [
    {
      key: 'name',
      header: t('settings.classrooms.name'),
      sortValue: (row) => row.name,
      render: (row) => (
        <span className="cell-primary__text">
          <span className="cell-primary__title">{row.name}</span>
          <span className="cell-primary__meta">{row.location ?? t('dashboard.noLocation')}</span>
        </span>
      ),
    },
    {
      key: 'capacity',
      header: t('settings.classrooms.capacity'),
      align: 'right',
      sortValue: (row) => row.max_capacity,
      render: (row) => <span className="tabular">{row.max_capacity}</span>,
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
            icon={<Pencil size={14} aria-hidden="true" />}
            aria-label={t('settings.editNamed', { name: row.name })}
            onClick={() => setEditing({ kind: 'classroom', item: row })}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} aria-hidden="true" />}
            aria-label={t('settings.deleteNamed', { name: row.name })}
            loading={removeClassroom.isPending && removeClassroom.variables?.id === row.id}
            onClick={() => setDeleting({ kind: 'classroom', item: row })}
          />
        </span>
      ),
    },
  ]

  const courseColumns: Column<Course>[] = [
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
      key: 'status',
      header: t('settings.courses.status'),
      render: (row) =>
        row.is_active ? (
          <Badge tone="success">{t('settings.courses.active')}</Badge>
        ) : (
          <Badge tone="neutral">{t('settings.courses.inactive')}</Badge>
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
            icon={<Pencil size={14} aria-hidden="true" />}
            aria-label={t('settings.editNamed', { name: row.name })}
            onClick={() => setEditing({ kind: 'course', item: row })}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} aria-hidden="true" />}
            aria-label={t('settings.deleteNamed', { name: row.name })}
            loading={removeCourse.isPending && removeCourse.variables?.id === row.id}
            onClick={() => setDeleting({ kind: 'course', item: row })}
          />
        </span>
      ),
    },
  ]

  const cameraColumns: Column<Camera>[] = [
    {
      key: 'name',
      header: t('settings.cameras.name'),
      render: (row) => (
        <span className="cell-primary__text">
          <span className="cell-primary__title">{row.name}</span>
          <span className="cell-primary__meta audit-code">{row.code}</span>
        </span>
      ),
    },
    {
      key: 'room',
      header: t('settings.cameras.classroom'),
      hideOnMobile: true,
      render: (row) => (
        <span className="cell-primary__text">
          <span>{roomName(row.classroom_id)}</span>
          <span className="cell-primary__meta">{t(`cameras.position.${row.position}`)}</span>
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="visually-hidden">{t('common.actions')}</span>,
      align: 'right',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Pencil size={14} aria-hidden="true" />}
          onClick={() => setEditing({ kind: 'camera', item: row })}
          aria-label={t('settings.editNamed', { name: row.name })}
        >
          {t('settings.cameras.rename')}
        </Button>
      ),
    },
  ]

  function section<T>(
    query: {
      isPending: boolean
      isError: boolean
      isFetching: boolean
      data?: T[]
      refetch: () => unknown
    },
    columns: Column<T>[],
    rowKey: (row: T) => string,
    caption: string,
    emptyTitle: string,
  ) {
    if (query.isPending) return <SkeletonTable rows={3} columns={columns.length} />
    if (query.isError)
      return <ErrorState compact onRetry={() => void query.refetch()} retrying={query.isFetching} />
    return (
      <DataTable
        caption={caption}
        columns={columns}
        rows={query.data ?? []}
        rowKey={rowKey}
        empty={<EmptyState compact title={emptyTitle} />}
      />
    )
  }

  return (
    <>
      <PageIntro description={t('settings.description')} />
      <div className="settings-grid">
        <Card>
          <CardHeader
            icon={<DoorOpen size={18} />}
            title={t('settings.classrooms.title')}
            description={t('settings.classrooms.hint')}
            actions={
              <Button
                size="sm"
                variant="secondary"
                icon={<Plus size={14} aria-hidden="true" />}
                onClick={() => setEditing({ kind: 'classroom', item: null })}
              >
                {t('settings.add')}
              </Button>
            }
          />
          {section(
            classrooms,
            classroomColumns,
            (row) => row.id,
            t('settings.classrooms.title'),
            t('settings.classrooms.empty'),
          )}
        </Card>

        <Card>
          <CardHeader
            icon={<BookOpen size={18} />}
            title={t('settings.courses.title')}
            description={t('settings.courses.hint')}
            actions={
              <Button
                size="sm"
                variant="secondary"
                icon={<Plus size={14} aria-hidden="true" />}
                onClick={() => setEditing({ kind: 'course', item: null })}
              >
                {t('settings.add')}
              </Button>
            }
          />
          {section(
            courses,
            courseColumns,
            (row) => row.id,
            t('settings.courses.title'),
            t('settings.courses.empty'),
          )}
        </Card>

        <Card className="settings-grid__wide">
          <CardHeader
            icon={<Cctv size={18} />}
            title={t('settings.cameras.title')}
            description={t('settings.cameras.hint')}
          />
          {section(
            cameras,
            cameraColumns,
            (row) => row.id,
            t('settings.cameras.title'),
            t('cameras.empty'),
          )}
        </Card>
      </div>

      {editing?.kind === 'classroom' && (
        <ClassroomDialog
          classroom={editing.item}
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}
      {editing?.kind === 'course' && (
        <CourseDialog course={editing.item} onClose={() => setEditing(null)} onSaved={saved} />
      )}
      {editing?.kind === 'camera' && (
        <CameraDialog camera={editing.item} onClose={() => setEditing(null)} onSaved={saved} />
      )}
      <ConfirmDialog
        open={deleting !== null}
        title={t(
          deleting?.kind === 'course'
            ? 'settings.confirmDeleteCourse'
            : 'settings.confirmDeleteClassroom',
        )}
        description={t('settings.confirmDeleteText', { name: deleting?.item.name ?? '' })}
        confirmLabel={t('settings.delete')}
        loading={removeClassroom.isPending || removeCourse.isPending}
        onConfirm={() => {
          if (deleting?.kind === 'classroom') removeClassroom.mutate(deleting.item)
          if (deleting?.kind === 'course') removeCourse.mutate(deleting.item)
        }}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
