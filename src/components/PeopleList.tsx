import { useTranslation } from 'react-i18next'
import { usePeople } from '../hooks/usePeople'
import { QueryStatus } from './QueryStatus'
import './PeopleList.css'

export function PeopleList() {
  const { t } = useTranslation()
  const { data, isPending, isError } = usePeople()

  return (
    <div className="people-list">
      <h2 className="people-list__title">{t('people.title')}</h2>
      <QueryStatus isPending={isPending} isError={isError} />
      <ul className="people-list__items">
        {data?.map((person) => {
          const isIn = person.status === 'IN'
          return (
            <li key={person.personId} className="people-list__row">
              <span
                className={`people-list__dot people-list__dot--${isIn ? 'in' : 'out'}`}
                aria-hidden="true"
              />
              <span className="people-list__name">{person.name}</span>
              <span className="people-list__status">
                {t(isIn ? 'people.status.in' : 'people.status.out')}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
