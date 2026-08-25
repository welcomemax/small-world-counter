import { lazy, Suspense } from 'react'
import { useGame } from './state/GameContext'
import { LiveScreen } from './ui/LiveScreen'
import { SetupScreen } from './ui/SetupScreen'
import './App.css'

const AnalyticsScreen = lazy(async () => {
  const mod = await import('./ui/AnalyticsScreen')
  return { default: mod.AnalyticsScreen }
})

export default function App() {
  const { screen } = useGame()
  if (screen === 'live') return <LiveScreen />
  if (screen === 'analytics') {
    return (
      <Suspense fallback={<p style={{ padding: '1.25rem' }}>Загрузка аналитики…</p>}>
        <AnalyticsScreen />
      </Suspense>
    )
  }
  return <SetupScreen />
}
