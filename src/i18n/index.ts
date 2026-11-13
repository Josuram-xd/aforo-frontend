import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './es.json'
import tutorial from './tutorial.es.json'

void i18n.use(initReactI18next).init({
  // Tutorial texts live in their own file so es.json stays small to merge.
  resources: { es: { translation: { ...es, ...tutorial } } },
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
})

export default i18n
