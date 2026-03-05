import { useState } from 'react'
import {
  GitCommit, GitBranch, RefreshCw, Upload, Download,
  MoreHorizontal, Clock, ArrowUp, ArrowDown
} from 'lucide-react'
import { useApp } from '@/store/appStore'
import { BranchPanel } from '@/components/repo/BranchPanel'
import { CommitGraph } from '@/components/repo/CommitGraph'
import { ChangesPanel } from '@/components/repo/ChangesPanel'
import { DiffViewer } from '@/components/repo/DiffViewer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'

type WorkspaceTab = 'history' | 'changes'

interface ResizablePanelProps {
  className?: string
  children: React.ReactNode
  minWidth?: number
}

function Panel({ className, children }: ResizablePanelProps) {
  return (
    <div className={cn('flex flex-col border-r border-border overflow-hidden', className)}>
      {children}
    </div>
  )
}

export function RepositoryWorkspace() {
  const { activeProject } = useApp()
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('history')

  if (!activeProject) return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
      Select a repository to begin
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Repo toolbar */}
      <div className="flex items-center gap-2 px-3 h-10 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-1.5">
          <Tooltip content="Fetch">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <RefreshCw size={12} />
              <span className="hidden sm:inline">Fetch</span>
            </Button>
          </Tooltip>
          <Tooltip content={`Pull (${activeProject.behindBy} behind)`}>
            <Button variant="ghost" size="sm" className={cn('gap-1.5', activeProject.behindBy > 0 && 'text-destructive')}>
              <Download size={12} />
              <span className="hidden sm:inline">Pull</span>
              {activeProject.behindBy > 0 && (
                <Badge variant="destructive">{activeProject.behindBy}</Badge>
              )}
            </Button>
          </Tooltip>
          <Tooltip content={`Push (${activeProject.aheadBy} ahead)`}>
            <Button variant={activeProject.aheadBy > 0 ? 'primary' : 'ghost'} size="sm" className="gap-1.5">
              <Upload size={12} />
              <span className="hidden sm:inline">Push</span>
              {activeProject.aheadBy > 0 && (
                <span className="text-primary-foreground font-mono text-[10px] ml-0.5">
                  {activeProject.aheadBy}
                </span>
              )}
            </Button>
          </Tooltip>
        </div>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Branch indicator */}
        <button className="flex items-center gap-1.5 h-7 px-2 rounded-md hover:bg-secondary transition-colors">
          <GitBranch size={12} className="text-accent" />
          <span className="text-xs font-medium">{activeProject.currentBranch}</span>
          {activeProject.aheadBy > 0 && (
            <span className="text-[10px] text-success flex items-center gap-0.5">
              <ArrowUp size={9} />{activeProject.aheadBy}
            </span>
          )}
          {activeProject.behindBy > 0 && (
            <span className="text-[10px] text-destructive flex items-center gap-0.5">
              <ArrowDown size={9} />{activeProject.behindBy}
            </span>
          )}
        </button>

        {/* Tab switcher */}
        <div className="ml-auto flex items-center bg-secondary rounded-md p-0.5 gap-0.5">
          {(['history', 'changes'] as WorkspaceTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex items-center gap-1.5 h-6 px-2.5 rounded text-[11px] font-medium transition-colors capitalize',
                activeTab === tab
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab === 'history' ? <Clock size={11} /> : <GitCommit size={11} />}
              {tab === 'history' ? 'History' : 'Changes'}
              {tab === 'changes' && activeProject.hasUncommittedChanges && (
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              )}
            </button>
          ))}
        </div>

        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal size={14} />
        </Button>
      </div>

      {/* Main workspace: three-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Branches */}
        <Panel className="w-52 shrink-0">
          <BranchPanel />
        </Panel>

        {/* Center: History / Changes */}
        <Panel className="w-72 shrink-0">
          {activeTab === 'history' ? <CommitGraph /> : <ChangesPanel />}
        </Panel>

        {/* Right: Diff Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden border-0">
          <DiffViewer />
        </div>
      </div>
    </div>
  )
}
