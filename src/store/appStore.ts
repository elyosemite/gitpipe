import { createContext, useContext, useState, useCallback } from 'react'
import type { Project, Theme } from '@/types'
import { mockProjects } from '@/data/mock'

interface AppState {
  theme: Theme
  setTheme: (t: Theme) => void
  projects: Project[]
  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void
  activeProject: Project | null
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (v: boolean) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}

export const AppContext = createContext<AppState | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function useAppState() {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [projects] = useState<Project[]>(mockProjects)
  const [activeProjectId, setActiveProjectId] = useState<string | null>('1')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    const root = document.documentElement
    if (t === 'dark') root.classList.add('dark')
    else if (t === 'light') root.classList.remove('dark')
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) root.classList.add('dark')
      else root.classList.remove('dark')
    }
  }, [])

  const activeProject = projects.find(p => p.id === activeProjectId) ?? null

  return {
    theme, setTheme,
    projects,
    activeProjectId, setActiveProjectId,
    activeProject,
    sidebarCollapsed, setSidebarCollapsed,
    commandPaletteOpen, setCommandPaletteOpen,
    searchQuery, setSearchQuery,
  }
}
