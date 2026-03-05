import { useState } from 'react'
import { mockCommits } from '@/data/mock'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import type { Commit } from '@/types'

const AUTHOR_COLORS = [
  'bg-primary',
  'bg-accent',
  'bg-success',
  'bg-warning',
  'bg-destructive',
]

function getAuthorColor(email: string): string {
  const hash = email.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AUTHOR_COLORS[hash % AUTHOR_COLORS.length]
}

interface CommitRowProps {
  commit: Commit
  isSelected: boolean
  onSelect: () => void
  index: number
}

function CommitRow({ commit, isSelected, onSelect, index }: CommitRowProps) {
  const dotColor = getAuthorColor(commit.authorEmail)
  const initials = commit.author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const avatarColor = getAuthorColor(commit.authorEmail)

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors group',
        isSelected ? 'bg-primary/10' : 'hover:bg-secondary/60'
      )}
    >
      {/* Graph column */}
      <div className="flex flex-col items-center gap-0 w-4 shrink-0 pt-1">
        <div className={cn('w-2.5 h-2.5 rounded-full border-2 border-background shrink-0', dotColor)} />
        {index < mockCommits.length - 1 && (
          <div className="w-px flex-1 bg-border mt-1 min-h-[12px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <span className={cn(
            'text-xs font-medium leading-snug flex-1 min-w-0',
            isSelected ? 'text-foreground' : 'text-foreground group-hover:text-foreground'
          )}>
            {commit.message}
          </span>
        </div>

        {/* Refs */}
        {commit.refs.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {commit.refs.map(ref => (
              <Badge
                key={ref}
                variant={ref.startsWith('HEAD') ? 'accent' : ref.startsWith('origin') ? 'primary' : 'muted'}
                className="font-mono"
              >
                {ref}
              </Badge>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 mt-1">
          <div className={cn('w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-background shrink-0', avatarColor)}>
            {initials}
          </div>
          <span className="text-[10px] text-muted-foreground truncate">{commit.author}</span>
          <span className="text-[10px] text-muted-foreground/60 shrink-0">
            {formatRelativeTime(commit.date)}
          </span>
          <code className="text-[10px] font-mono text-muted-foreground/60 shrink-0">{commit.shortHash}</code>
        </div>
      </div>
    </button>
  )
}

export function CommitGraph() {
  const [selectedHash, setSelectedHash] = useState<string | null>(mockCommits[0]?.hash ?? null)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-foreground">History</span>
        <span className="text-[10px] text-muted-foreground">{mockCommits.length} commits</span>
      </div>

      {/* Commits */}
      <div className="flex-1 overflow-y-auto">
        {mockCommits.map((commit, idx) => (
          <CommitRow
            key={commit.hash}
            commit={commit}
            index={idx}
            isSelected={commit.hash === selectedHash}
            onSelect={() => setSelectedHash(commit.hash)}
          />
        ))}
      </div>
    </div>
  )
}
