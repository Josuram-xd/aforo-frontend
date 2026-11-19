import { useTranslation } from 'react-i18next'
import type { Course } from '../../api/types'
import { SelectInput } from '../../components/ui/Field'

interface CourseSelectorProps {
  courses: Course[]
  value: string
  onChange: (courseId: string) => void
}

/** Picks the course whose history the home shows (each course has its own sessions and events). */
export function CourseSelector({ courses, value, onChange }: CourseSelectorProps) {
  const { t } = useTranslation()
  return (
    <div className="dashboard__course" data-tour="home-course">
      <label className="dashboard__course-picker">
        <span className="dashboard__course-label">{t('dashboard.course')}</span>
        <SelectInput value={value} onChange={(event) => onChange(event.target.value)}>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.code})
            </option>
          ))}
        </SelectInput>
      </label>
      <p className="dashboard__course-hint">{t('dashboard.courseHint')}</p>
    </div>
  )
}
