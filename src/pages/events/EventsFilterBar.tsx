import { useTranslation } from 'react-i18next'
import type { Classroom, Direction, EventFilters, EventMethod, Student } from '../../api/types'
import { FilterBar } from '../../components/FilterBar'
import { Field, SelectInput, TextInput } from '../../components/ui/Field'

interface EventsFilterBarProps {
  value: EventFilters
  onChange: (next: EventFilters) => void
  onClear: () => void
  canClear: boolean
  students: Student[]
  classrooms: Classroom[]
}

/** Date range, direction, method, student (and classroom when there are several). */
export function EventsFilterBar({
  value,
  onChange,
  onClear,
  canClear,
  students,
  classrooms,
}: EventsFilterBarProps) {
  const { t } = useTranslation()
  const set = (patch: Partial<EventFilters>) => onChange({ ...value, ...patch })

  return (
    <FilterBar label={t('filters.events')} onClear={onClear} canClear={canClear}>
      <Field label={t('filters.from')}>
        {({ id }) => (
          <TextInput
            id={id}
            type="date"
            value={value.from ?? ''}
            max={value.to || undefined}
            onChange={(event) => set({ from: event.target.value || undefined })}
          />
        )}
      </Field>
      <Field label={t('filters.to')}>
        {({ id }) => (
          <TextInput
            id={id}
            type="date"
            value={value.to ?? ''}
            min={value.from || undefined}
            onChange={(event) => set({ to: event.target.value || undefined })}
          />
        )}
      </Field>
      <Field label={t('filters.direction')}>
        {({ id }) => (
          <SelectInput
            id={id}
            value={value.direction ?? ''}
            onChange={(event) => set({ direction: event.target.value as Direction | '' })}
          >
            <option value="">{t('filters.all')}</option>
            <option value="ENTRY">{t('events.direction.entry')}</option>
            <option value="EXIT">{t('events.direction.exit')}</option>
          </SelectInput>
        )}
      </Field>
      <Field label={t('filters.method')}>
        {({ id }) => (
          <SelectInput
            id={id}
            value={value.method ?? ''}
            onChange={(event) => set({ method: event.target.value as EventMethod | '' })}
          >
            <option value="">{t('filters.all')}</option>
            <option value="FACE">{t('events.method.face')}</option>
            <option value="BODY_ONLY">{t('events.method.body')}</option>
          </SelectInput>
        )}
      </Field>
      <Field label={t('filters.student')}>
        {({ id }) => (
          <SelectInput
            id={id}
            value={value.studentId ?? ''}
            onChange={(event) => set({ studentId: event.target.value || undefined })}
          >
            <option value="">{t('filters.allStudents')}</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name}
              </option>
            ))}
          </SelectInput>
        )}
      </Field>
      {classrooms.length > 1 && (
        <Field label={t('filters.classroom')}>
          {({ id }) => (
            <SelectInput
              id={id}
              value={value.classroomId ?? ''}
              onChange={(event) => set({ classroomId: event.target.value || undefined })}
            >
              <option value="">{t('filters.all')}</option>
              {classrooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </SelectInput>
          )}
        </Field>
      )}
    </FilterBar>
  )
}
