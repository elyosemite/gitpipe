import { useState } from 'react'
import {
  GitBranch, Globe, ChevronDown, ChevronRight,
  Check, ArrowUp, ArrowDown, Plus, RefreshCw
} from 'lucide-react'
import { mockBranches } from '@/data/mock'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import type { Branch } from '@/types'

interface BranchItemProps {
  branch: Branch
  onCheckout?: () => void
}

function BranchItem({ branch, onCheckout }: BranchItemProps) {
  return (
    <button
      onClick={onCheckout}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left',
        'group transition-colors',
        branch.isCurrent
          ? 'bg-primary/10 text-foreground'
          : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
      )}
    >
      {branch.isCurrent
        ? <Check size={12} className="text-primary shrink-0" />
        : <span className="w-3 shrink-0" />
      }

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium truncate">{branch.name}</span>
        </div>
        <div className="text-[10px] text-muted-foreground/70 truncate mt-0.5">
          {formatRelativeTime(branch.lastCommitDate)} · {branch.lastCommitMessage}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {branch.aheadBy != null && branch.aheadBy > 0 && (
          <span className="text-[10px] text-success flex items-center gap-0.5">
            <ArrowUp size={9} />{branch.aheadBy}
          </span>
        )}
        {branch.behindBy != null && branch.behindBy > 0 && (
          <span className="text-[10px] text-destructive flex items-center gap-0.5">
            <ArrowDown size={9} />{branch.behindBy}
          </span>
        )}
      </div>
    </button>
  )
}

interface SectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  count?: number
}

function Section({ title, icon, children, defaultOpen = true, count }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        <span className="flex items-center gap-1">{icon}{title}</span>
        {count != null && (
          <Badge variant="muted" className="ml-auto">{count}</Badge>
        )}
      </button>
      {open && <div className="space-y-0.5 px-1">{children}</div>}
    </div>
  )
}

export function BranchPanel() {
  const local = mockBranches.filter(b => !b.isRemote)
  const remote = mockBranches.filter(b => b.isRemote)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-foreground">Branches</span>
        <div className="flex items-center gap-0.5">
          <Tooltip content="Fetch all">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <RefreshCw size={12} />
            </Button>
          </Tooltip>
          <Tooltip content="New branch">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus size={12} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Branch list */}
      <div className="flex-1 overflow-y-auto py-2 px-1 space-y-3">
        <Section title="Local" icon={<GitBranch size={10} />} count={local.length}>
          {local.map(b => <BranchItem key={b.name} branch={b} />)}
        </Section>

        <Section title="Remote" icon={<Globe size={10} />} count={remote.length} defaultOpen={false}>
          {remote.map(b => <BranchItem key={b.name} branch={b} />)}
        </Section>
      </div>
    </div>
  )
}
