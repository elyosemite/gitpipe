import { useState, useEffect } from 'react'
import { GitBranch, Search, Bell, Settings, Moon, Sun, Monitor, ChevronDown, Minus, Square, X, Maximize2 } from 'lucide-react'
import { useApp } from '@/store/appStore'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'

export function TitleBar() {
  const { theme, setTheme, activeProject, setCommandPaletteOpen } = useApp()
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const api = window.electronAPI
    if (!api) return
    api.window.isMaximized().then(setIsMaximized)
    const unsub = api.window.onMaximizeChange(setIsMaximized)
    return unsub
  }, [])

  const themeIcons = {
    dark: <Moon size={14} />,
    light: <Sun size={14} />,
    system: <Monitor size={14} />,
  }

  const cycleTheme = () => {
    const order: ['dark', 'light', 'system'] = ['dark', 'light', 'system']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
  }

  return (
    <header className="drag-region h-11 flex items-center px-3 gap-2 border-b border-border bg-card shrink-0 select-none">

      {/* Logo */}
      <div className="flex items-center gap-2 w-48 shrink-0">
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground text-[11px] font-bold">GB</span>
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">GtBeholder</span>
      </div>

      {/* Current repo + branch pill */}
      {activeProject && (
        <button
          className={cn(
            'no-drag flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium',
            'bg-secondary hover:bg-secondary/70 text-foreground transition-colors',
            'border border-border/50'
          )}
        >
          <GitBranch size={12} className="text-accent shrink-0" />
          <span className="text-muted-foreground">{activeProject.name}</span>
          <span className="text-muted-foreground/50">/</span>
          <span>{activeProject.currentBranch}</span>
          <ChevronDown size={11} className="text-muted-foreground ml-0.5" />
        </button>
      )}

      {/* Search / Command palette */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className={cn(
          'no-drag flex items-center gap-2 flex-1 max-w-xs h-7 px-2.5 rounded-md text-xs',
          'bg-secondary/50 hover:bg-secondary border border-border/50',
          'text-muted-foreground transition-colors'
        )}
      >
        <Search size={12} />
        <span>Search or jump to...</span>
        <kbd className="ml-auto font-mono text-[10px] bg-muted rounded px-1">⌘K</kbd>
      </button>

      {/* Right actions */}
      <div className="no-drag ml-auto flex items-center gap-0.5">
        <Tooltip content="Notifications">
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={14} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
          </Button>
        </Tooltip>

        <Tooltip content={`Theme: ${theme}`}>
          <Button variant="ghost" size="icon" onClick={cycleTheme}>
            {themeIcons[theme]}
          </Button>
        </Tooltip>

        <Tooltip content="Settings">
          <Button variant="ghost" size="icon">
            <Settings size={14} />
          </Button>
        </Tooltip>

        {/* Avatar */}
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center ml-1">
          <span className="text-[10px] font-bold text-primary-foreground">AC</span>
        </div>

        {/* Window controls — always rendered; handlers no-op if API not ready */}
        <div className="flex items-center ml-3 -mr-1">
          <Tooltip content="Minimize">
            <button
              onClick={() => window.electronAPI?.window.minimize()}
              className="flex items-center justify-center w-11 h-11 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <Minus size={12} />
            </button>
          </Tooltip>

          <Tooltip content={isMaximized ? 'Restore' : 'Maximize'}>
            <button
              onClick={() => window.electronAPI?.window.maximize()}
              className="flex items-center justify-center w-11 h-11 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {isMaximized ? <Square size={11} /> : <Maximize2 size={11} />}
            </button>
          </Tooltip>

          <Tooltip content="Close">
            <button
              onClick={() => window.electronAPI?.window.close()}
              className="flex items-center justify-center w-11 h-11 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X size={13} />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  )
}
