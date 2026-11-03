import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { setCourseEnrollment } from '../../api/courseStudents'
import { errorMessageKey } from '../../api/errors'
import { queryKeys } from '../../api/queryKeys'
import type { Course } from '../../api/types'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { TextInput } from '../../components/ui/Field'
import { useToast } from '../../components/ui/toastContext'
import { useCourseStudentIds, useStudents } from '../../hooks/queries'
import './CourseStudentsDialog.css'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/** Checklist that enrolls or removes students from a course; each tick saves immediately. */
export function CourseStudentsDialog({ course, onClose }: { course: Course; onClose: () => void }) {
  const { t } = useTranslation()
  const toast = useToast()
  const queryClient = useQueryClient()
  const students = useStudents()
  const enrolledIds = useCourseStudentIds(course.id)
  const [search, setSearch] = useState('')

  const toggle = useMutation({
    mutationFn: ({ studentId, enrolled }: { studentId: string; enrolled: boolean }) =>
      setCourseEnrollment(course.id, studentId, enrolled),
    onError: (error) => toast.error(t(errorMessageKey(error))),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.courseStudents }),
  })

  const enrolled = useMemo(() => new Set(enrolledIds.data ?? []), [enrolledIds.data])
  const rows = useMemo(() => {
    const term = normalize(search.trim())
    return (students.data ?? []).filter(
      (s) =>
        (s.is_active || enrolled.has(s.id)) &&
        (!term || normalize(`${s.full_name} ${s.student_code ?? ''}`).includes(term)),
    )
  }, [students.data, enrolled, search])

  return (
    <Dialog
      open
      onClose={onClose}
      title={t('courses.enrollTitle', { name: course.name })}
      description={t('courses.enrollHint')}
      footer={<Button onClick={onClose}>{t('common.close')}</Button>}
    >
      <div className="course-students">
        <TextInput
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('courses.search')}
          aria-label={t('courses.search')}
          icon={<Search size={15} />}
        />
        {students.data?.length === 0 ? (
          <p className="course-students__empty">{t('courses.noStudents')}</p>
        ) : (
          <ul className="course-students__list">
            {rows.map((student) => (
              <li key={student.id}>
                <label className="course-students__row">
                  <input
                    type="checkbox"
                    checked={enrolled.has(student.id)}
                    disabled={enrolledIds.isPending || toggle.isPending}
                    onChange={(event) =>
                      toggle.mutate({ studentId: student.id, enrolled: event.target.checked })
                    }
                  />
                  <Avatar name={student.full_name} size="sm" />
                  <span className="course-students__name">
                    {student.full_name}
                    {student.student_code && (
                      <span className="course-students__code tabular">{student.student_code}</span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  )
}
