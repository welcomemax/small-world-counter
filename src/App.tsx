import { lazy, Suspense, useState } from 'react'
import { useGame } from './state/GameContext'
import { AppFooter } from './ui/AppFooter'
import { LiveScreen } from './ui/LiveScreen'
import { RulesSheet } from './ui/RulesSheet'
import { SetupScreen } from './ui/SetupScreen'
import { TurnTransition } from './ui/TurnTransition'
import './App.css'

const AnalyticsScreen = lazy(async () => {
  const mod = await import('./ui/AnalyticsScreen')
  return { default: mod.AnalyticsScreen }
})

function Screen({ screen }: { screen: ReturnType<typeof useGame>['screen'] }) {
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

export default function App() {
  const { screen, handover, dismissHandover } = useGame()
  const [rulesOpen, setRulesOpen] = useState(false)
  return (
    <>
      {handover && <TurnTransition {...handover} onDone={dismissHandover} />}
      <Screen screen={screen} />
      <AppFooter onOpenRules={() => setRulesOpen(true)} />
      <RulesSheet open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </>
  )
}
