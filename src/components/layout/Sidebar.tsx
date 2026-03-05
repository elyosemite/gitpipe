import {
  GitBranch, FolderGit2, Star, Clock, Plus, ChevronLeft,
  ChevronRight, Code2, FileText, Brain, Layers
} from 'lucide-react'
import { useApp } from '@/store/appStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'
import type { Project, ProjectType } from '@/types'

const typeIcons: Record<ProjectType, React.ReactNode> = {
  code: <Code2 size={13} />,
  docs: <FileText size={13} />,
  ai: <Brain size={13} />,
  mixed: <Layers size={13} />,
}

const typeColors: Record<ProjectType, string> = {
  code: 'text-accent',
  docs: 'text-warning',
  ai: 'text-primary',
  mixed: 'text-muted-foreground',
}

interface ProjectItemProps {
  project: Project
  isActive: boolean
  collapsed: boolean
  onClick: () => void
}

function ProjectItem({ project, isActive, collapsed, onClick }: ProjectItemProps) {
  const item = (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 rounded-md transition-all duration-100',
        'text-left group relative',
        collapsed ? 'h-9 justify-center px-0' : 'h-9 px-2.5',
        isActive
          ? 'bg-primary/10 text-foreground'
          : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
      )}

      {/* Type icon */}
      <span className={cn(
        'shrink-0 transition-colors',
        typeColors[project.type],
        collapsed ? '' : 'ml-1'
      )}>
        {typeIcons[project.type]}
      </span>

      {!collapsed && (
        <>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium truncate">{project.name}</span>
              {project.starred && <Star size={10} className="text-warning shrink-0 fill-warning" />}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <GitBranch size={9} className="text-muted-foreground/60 shrink-0" />
              <span className="text-[10px] text-muted-foreground truncate">{project.currentBranch}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {project.hasUncommittedChanges && (
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
            )}
            {(project.aheadBy > 0 || project.behindBy > 0) && (
              <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                {project.aheadBy > 0 && <span className="text-success">↑{project.aheadBy}</span>}
                {project.behindBy > 0 && <span className="text-destructive">↓{project.behindBy}</span>}
              </div>
            )}
          </div>
        </>
      )}

      {/* Collapsed: status dot */}
      {collapsed && project.hasUncommittedChanges && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-warning" />
      )}
    </button>
  )

  if (collapsed) {
    return (
      <Tooltip content={project.name} side="right">
        {item}
      </Tooltip>
    )
  }

  return item
}

export function Sidebar() {
  const { projects, activeProjectId, setActiveProjectId, sidebarCollapsed, setSidebarCollapsed } = useApp()

  const starred = projects.filter(p => p.starred)
  const recent = projects.filter(p => !p.starred).sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())

  const c = sidebarCollapsed

  return (
    <aside className={cn(
      'flex flex-col border-r border-border bg-card transition-all duration-200 shrink-0',
      c ? 'w-12' : 'w-56'
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center h-10 px-2 border-b border-border shrink-0',
        c ? 'justify-center' : 'justify-between'
      )}>
        {!c && (
          <div className="flex items-center gap-1.5 px-1">
            <FolderGit2 size={13} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Repositories</span>
          </div>
        )}
        <div className={cn('flex items-center gap-0.5', c && 'flex-col')}>
          {!c && (
            <Tooltip content="Add repository">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus size={13} />
              </Button>
            </Tooltip>
          )}
          <Tooltip content={c ? 'Expand sidebar' : 'Collapse sidebar'} side="right">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSidebarCollapsed(!c)}>
              {c ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-4">
        {/* Starred */}
        {starred.length > 0 && (
          <div>
            {!c && (
              <div className="flex items-center gap-1.5 px-1.5 mb-1">
                <Star size={10} className="text-warning fill-warning" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Starred</span>
              </div>
            )}
            <div className="space-y-0.5">
              {starred.map(p => (
                <ProjectItem
                  key={p.id}
                  project={p}
                  isActive={p.id === activeProjectId}
                  collapsed={c}
                  onClick={() => setActiveProjectId(p.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent */}
        {recent.length > 0 && (
          <div>
            {!c && (
              <div className="flex items-center gap-1.5 px-1.5 mb-1">
                <Clock size={10} className="text-muted-foreground" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recent</span>
              </div>
            )}
            <div className="space-y-0.5">
              {recent.map(p => (
                <ProjectItem
                  key={p.id}
                  project={p}
                  isActive={p.id === activeProjectId}
                  collapsed={c}
                  onClick={() => setActiveProjectId(p.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!c && (
        <div className="border-t border-border p-2">
          <div className="px-1.5 py-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{projects.length} repositories</span>
              <Badge variant="muted">{projects.filter(p => p.hasUncommittedChanges).length} dirty</Badge>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
