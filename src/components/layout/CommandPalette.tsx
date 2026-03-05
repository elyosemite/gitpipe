import { useEffect, useRef, useState } from 'react'
import { Search, GitBranch, FolderGit2, GitCommit, ArrowRight, Code2, FileText, Brain } from 'lucide-react'
import { useApp } from '@/store/appStore'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  type: 'project' | 'branch' | 'command'
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, projects, setActiveProjectId } = useApp()
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const allItems: CommandItem[] = [
    ...projects.map(p => ({
      id: `project-${p.id}`,
      type: 'project' as const,
      label: p.name,
      description: p.currentBranch,
      icon: p.type === 'ai' ? <Brain size={14} /> : p.type === 'docs' ? <FileText size={14} /> : <Code2 size={14} />,
      action: () => { setActiveProjectId(p.id); setCommandPaletteOpen(false) },
    })),
    {
      id: 'cmd-fetch',
      type: 'command',
      label: 'Fetch all repositories',
      description: 'Pull latest refs from all remotes',
      icon: <GitBranch size={14} />,
      action: () => setCommandPaletteOpen(false),
    },
    {
      id: 'cmd-commit',
      type: 'command',
      label: 'Create commit',
      description: 'Stage and commit current changes',
      icon: <GitCommit size={14} />,
      action: () => setCommandPaletteOpen(false),
    },
    {
      id: 'cmd-clone',
      type: 'command',
      label: 'Clone repository',
      description: 'Clone from URL or SSH',
      icon: <FolderGit2 size={14} />,
      action: () => setCommandPaletteOpen(false),
    },
  ]

  const filtered = query.trim()
    ? allItems.filter(i =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        i.description?.toLowerCase().includes(query.toLowerCase())
      )
    : allItems

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
      if (!commandPaletteOpen) return
      if (e.key === 'Escape') setCommandPaletteOpen(false)
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && filtered[selectedIdx]) { filtered[selectedIdx].action() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [commandPaletteOpen, filtered, selectedIdx, setCommandPaletteOpen])

  useEffect(() => { setSelectedIdx(0) }, [query])

  if (!commandPaletteOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Panel */}
      <div className={cn(
        'relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden',
        'animate-in fade-in-0 zoom-in-95 duration-150'
      )}>
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search repositories, branches, commands..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground text-xs">
              Clear
            </button>
          )}
          <kbd className="text-[10px] font-mono text-muted-foreground bg-secondary rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results for "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setSelectedIdx(idx)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  idx === selectedIdx ? 'bg-secondary' : 'hover:bg-secondary/50'
                )}
              >
                <span className={cn(
                  'shrink-0',
                  item.type === 'project' ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                  )}
                </div>
                <ArrowRight size={12} className={cn('shrink-0 transition-opacity', idx === selectedIdx ? 'opacity-100 text-primary' : 'opacity-0')} />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">ESC</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
