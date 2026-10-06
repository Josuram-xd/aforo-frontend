import { useTranslation } from 'react-i18next'

function App() {
  const { t } = useTranslation()

  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <h1>{t('app.title')}</h1>
    </main>
  )
}

export default App
