import { useEffect, useState } from 'react'
import { AppContext, useAppState } from '@/store/appStore'
import { TitleBar } from '@/components/layout/TitleBar'
import { NavRail } from '@/components/layout/NavRail'
import { Sidebar } from '@/components/layout/Sidebar'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { ProjectsOverview } from '@/pages/ProjectsOverview'
import { RepositoryWorkspace } from '@/pages/RepositoryWorkspace'
import { CommitLogPage } from '@/pages/CommitLogPage'
import { SettingsPage } from '@/pages/SettingsPage'

type NavView = 'projects' | 'workspace' | 'commits' | 'terminal' | 'settings' | 'help'

function AppShell() {
  const [navView, setNavView] = useState<NavView>('workspace')
  const appState = useAppState()

  // Initialize dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        setNavView('settings')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const renderView = () => {
    switch (navView) {
      case 'projects': return <ProjectsOverview />
      case 'workspace': return <RepositoryWorkspace />
      case 'commits': return <CommitLogPage />
      case 'settings': return <SettingsPage />
      default:
        return (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center p-8">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <span className="text-2xl">🚧</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground capitalize">{navView}</p>
              <p className="text-xs text-muted-foreground mt-1">Coming soon — backend integration pending</p>
            </div>
          </div>
        )
    }
  }

  return (
    <AppContext.Provider value={appState}>
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        {/* Title bar */}
        <TitleBar />

        {/* Main layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Nav rail */}
          <NavRail active={navView} onChange={v => setNavView(v as NavView)} />

          {/* Sidebar (projects list) */}
          {(navView === 'workspace' || navView === 'commits') && <Sidebar />}

          {/* Page content */}
          {renderView()}
        </div>
      </div>

      {/* Global overlays */}
      <CommandPalette />
    </AppContext.Provider>
  )
}

export default function App() {
  return <AppShell />
}
