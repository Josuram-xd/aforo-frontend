import { Search } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar } from '../../components/ui/Avatar'
import { TextInput } from '../../components/ui/Field'
import { useCourseRoster } from '../../hooks/queries'

/** Sorted roster with name-prefix search, answered by the backend's binary search tree. */
export function CourseRosterSearch({ courseId }: { courseId: string }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query.trim())
  const roster = useCourseRoster(courseId, deferred)

  return (
    <section className="course-students__roster" aria-label={t('courses.rosterTitle')}>
      <TextInput
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('courses.rosterSearch')}
        aria-label={t('courses.rosterSearch')}
        icon={<Search size={15} />}
      />
      <p className="course-students__caption">
        {t('courses.rosterCaption')}
        {roster.data &&
          ` · ${t('courses.rosterStats', { size: roster.data.size, height: roster.data.height })}`}
      </p>
      {roster.isError ? (
        <p className="course-students__empty">{t('common.error')}</p>
      ) : roster.data && roster.data.students.length === 0 ? (
        <p className="course-students__empty">{t('courses.rosterEmpty')}</p>
      ) : (
        <ol className="course-students__list">
          {roster.data?.students.map((student) => (
            <li key={student.id} className="course-students__row">
              <Avatar name={student.fullName} size="sm" />
              <span className="course-students__name">
                {student.fullName}
                {student.studentCode && (
                  <span className="course-students__code tabular">{student.studentCode}</span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
