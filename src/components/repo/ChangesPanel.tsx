import { useState } from 'react'
import { Plus, Minus, Check, ChevronDown, ChevronRight } from 'lucide-react'
import { mockFileChanges } from '@/data/mock'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { FileChange } from '@/types'

const statusConfig = {
  modified: { label: 'M', color: 'text-warning', bg: 'bg-warning/10' },
  added: { label: 'A', color: 'text-success', bg: 'bg-success/10' },
  deleted: { label: 'D', color: 'text-destructive', bg: 'bg-destructive/10' },
  renamed: { label: 'R', color: 'text-primary', bg: 'bg-primary/10' },
  untracked: { label: 'U', color: 'text-muted-foreground', bg: 'bg-muted' },
  staged: { label: 'S', color: 'text-accent', bg: 'bg-accent/10' },
}

interface FileRowProps {
  file: FileChange
  isSelected: boolean
  isStaged?: boolean
  onSelect: () => void
  onToggleStage: () => void
}

function FileRow({ file, isSelected, isStaged, onSelect, onToggleStage }: FileRowProps) {
  const cfg = statusConfig[file.status]
  const filename = file.path.split('/').pop() ?? file.path
  const dir = file.path.includes('/') ? file.path.split('/').slice(0, -1).join('/') : ''

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left group transition-colors',
        isSelected ? 'bg-primary/10' : 'hover:bg-secondary/60'
      )}
    >
      {/* Stage toggle */}
      <button
        onClick={e => { e.stopPropagation(); onToggleStage() }}
        className={cn(
          'w-3.5 h-3.5 rounded border transition-colors shrink-0',
          isStaged
            ? 'bg-primary border-primary flex items-center justify-center'
            : 'border-border hover:border-primary'
        )}
      >
        {isStaged && <Check size={9} className="text-primary-foreground" />}
      </button>

      {/* Status badge */}
      <span className={cn('w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center shrink-0', cfg.color, cfg.bg)}>
        {cfg.label}
      </span>

      {/* File path */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="text-xs font-medium text-foreground truncate">{filename}</span>
          {dir && <span className="text-[10px] text-muted-foreground/60 truncate">{dir}</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-1.5 shrink-0 opacity-70 group-hover:opacity-100">
        {file.additions > 0 && (
          <span className="text-[10px] text-success flex items-center gap-0.5">
            <Plus size={9} />{file.additions}
          </span>
        )}
        {file.deletions > 0 && (
          <span className="text-[10px] text-destructive flex items-center gap-0.5">
            <Minus size={9} />{file.deletions}
          </span>
        )}
      </div>
    </button>
  )
}

interface SectionProps {
  title: string
  count: number
  children: React.ReactNode
  defaultOpen?: boolean
  actions?: React.ReactNode
}

function Section({ title, count, children, defaultOpen = true, actions }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <div className="flex items-center px-2 py-1">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          {title}
          <Badge variant="muted">{count}</Badge>
        </button>
        {actions}
      </div>
      {open && <div className="space-y-0.5 px-1">{children}</div>}
    </div>
  )
}

export function ChangesPanel() {
  const [selectedPath, setSelectedPath] = useState<string | null>(mockFileChanges[0]?.path ?? null)
  const [stagedPaths, setStagedPaths] = useState<Set<string>>(new Set(['internal/breaker/circuit.go']))
  const [commitMessage, setCommitMessage] = useState('')

  const unstaged = mockFileChanges.filter(f => !stagedPaths.has(f.path))
  const staged = mockFileChanges.filter(f => stagedPaths.has(f.path))

  const toggleStage = (path: string) => {
    setStagedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const stageAll = () => setStagedPaths(new Set(mockFileChanges.map(f => f.path)))
  const unstageAll = () => setStagedPaths(new Set())

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-foreground">Changes</span>
        <Badge variant={staged.length > 0 ? 'accent' : 'muted'}>
          {staged.length}/{mockFileChanges.length} staged
        </Badge>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto py-2 space-y-2">
        {staged.length > 0 && (
          <Section
            title="Staged"
            count={staged.length}
            actions={
              <Button variant="ghost" size="sm" onClick={unstageAll} className="h-5 text-[10px]">
                Unstage all
              </Button>
            }
          >
            {staged.map(f => (
              <FileRow
                key={f.path}
                file={f}
                isSelected={f.path === selectedPath}
                isStaged
                onSelect={() => setSelectedPath(f.path)}
                onToggleStage={() => toggleStage(f.path)}
              />
            ))}
          </Section>
        )}

        {unstaged.length > 0 && (
          <Section
            title="Unstaged"
            count={unstaged.length}
            actions={
              <Button variant="ghost" size="sm" onClick={stageAll} className="h-5 text-[10px]">
                Stage all
              </Button>
            }
          >
            {unstaged.map(f => (
              <FileRow
                key={f.path}
                file={f}
                isSelected={f.path === selectedPath}
                isStaged={false}
                onSelect={() => setSelectedPath(f.path)}
                onToggleStage={() => toggleStage(f.path)}
              />
            ))}
          </Section>
        )}
      </div>

      {/* Commit box */}
      <div className="border-t border-border p-3 space-y-2 shrink-0">
        <textarea
          value={commitMessage}
          onChange={e => setCommitMessage(e.target.value)}
          placeholder="Commit message (Ctrl+Enter to commit)"
          rows={3}
          className={cn(
            'w-full resize-none rounded-md border border-border bg-background',
            'px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-1 focus:ring-ring transition-colors font-sans'
          )}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            disabled={staged.length === 0 || !commitMessage.trim()}
            className="flex-1"
          >
            Commit {staged.length > 0 ? `${staged.length} file${staged.length > 1 ? 's' : ''}` : ''}
          </Button>
          <Button variant="outline" size="sm">
            Amend
          </Button>
        </div>
      </div>
    </div>
  )
}
