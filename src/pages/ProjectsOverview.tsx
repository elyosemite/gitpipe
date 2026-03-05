import { useState } from 'react'
import {
  GitBranch, Star, Clock, Search, Plus, FolderOpen,
  Code2, FileText, Brain, Layers, ArrowUp, ArrowDown,
  RefreshCw, AlertCircle, Filter
} from 'lucide-react'
import { useApp } from '@/store/appStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import type { Project, ProjectType } from '@/types'

const typeConfig: Record<ProjectType, { icon: React.ReactNode; label: string; color: string }> = {
  code: { icon: <Code2 size={14} />, label: 'Code', color: 'text-accent' },
  docs: { icon: <FileText size={14} />, label: 'Docs', color: 'text-warning' },
  ai: { icon: <Brain size={14} />, label: 'AI', color: 'text-primary' },
  mixed: { icon: <Layers size={14} />, label: 'Mixed', color: 'text-muted-foreground' },
}

const languageColors: Record<string, string> = {
  Go: 'bg-sky-500/20 text-sky-400',
  Python: 'bg-yellow-500/20 text-yellow-400',
  TypeScript: 'bg-blue-500/20 text-blue-400',
  Rust: 'bg-orange-500/20 text-orange-400',
  Markdown: 'bg-gray-500/20 text-gray-400',
  Protobuf: 'bg-purple-500/20 text-purple-400',
}

interface ProjectCardProps {
  project: Project
  onOpen: () => void
}

function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const type = typeConfig[project.type]
  const langColor = project.language ? (languageColors[project.language] ?? 'bg-muted text-muted-foreground') : ''

  return (
    <div
      onClick={onOpen}
      className={cn(
        'group relative flex flex-col gap-3 p-4 rounded-xl border border-border bg-card',
        'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 cursor-pointer transition-all duration-200',
        'hover:bg-card/80'
      )}
    >
      {/* Status indicator line */}
      {project.hasUncommittedChanges && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-gradient-to-r from-warning/60 to-warning/20" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
            'bg-secondary group-hover:bg-secondary/80',
            type.color
          )}>
            {type.icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground leading-none">{project.name}</h3>
              {project.starred && <Star size={11} className="text-warning fill-warning shrink-0" />}
            </div>
            {project.language && (
              <span className={cn('text-[10px] font-medium rounded px-1 py-0.5 mt-0.5 inline-block', langColor)}>
                {project.language}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {project.hasUncommittedChanges && (
            <Badge variant="warning" className="gap-1">
              <AlertCircle size={9} />
              Dirty
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Branch & sync status */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-secondary/60 rounded-md px-2 py-1 flex-1 min-w-0">
          <GitBranch size={10} className="text-accent shrink-0" />
          <span className="text-[11px] font-mono text-foreground truncate">{project.currentBranch}</span>
        </div>
        {(project.aheadBy > 0 || project.behindBy > 0) && (
          <div className="flex items-center gap-1.5 text-[10px]">
            {project.aheadBy > 0 && (
              <span className="flex items-center gap-0.5 text-success font-medium">
                <ArrowUp size={10} />{project.aheadBy}
              </span>
            )}
            {project.behindBy > 0 && (
              <span className="flex items-center gap-0.5 text-destructive font-medium">
                <ArrowDown size={10} />{project.behindBy}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tags & time */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {project.tags.map(tag => (
            <span key={tag} className="text-[10px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 shrink-0">
          <Clock size={9} />
          {formatRelativeTime(project.lastActivity)}
        </div>
      </div>

      {/* Open button (shown on hover) */}
      <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-lg">
          <FolderOpen size={13} className="text-primary" />
          <span className="text-xs font-medium text-foreground">Open Repository</span>
        </div>
      </div>
    </div>
  )
}

export function ProjectsOverview() {
  const { projects, setActiveProjectId } = useApp()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ProjectType | 'all'>('all')

  const filtered = projects.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || p.type === typeFilter
    return matchesSearch && matchesType
  })

  const starred = filtered.filter(p => p.starred)
  const rest = filtered.filter(p => !p.starred)

  const typeCounts = {
    all: projects.length,
    code: projects.filter(p => p.type === 'code').length,
    ai: projects.filter(p => p.type === 'ai').length,
    docs: projects.filter(p => p.type === 'docs').length,
    mixed: projects.filter(p => p.type === 'mixed').length,
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card shrink-0">
        <div>
          <h1 className="text-base font-semibold text-foreground">Projects</h1>
          <p className="text-xs text-muted-foreground">{projects.length} repositories</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-background text-sm w-56">
            <Search size={13} className="text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter repositories..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          <Tooltip content="Fetch all repositories">
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCw size={12} />
              <span>Fetch all</span>
            </Button>
          </Tooltip>
          <Button variant="primary" size="sm" className="gap-1.5">
            <Plus size={12} />
            Add repo
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-border bg-card/50 shrink-0">
        {(['all', 'code', 'ai', 'docs', 'mixed'] as const).map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={cn(
              'flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium transition-colors',
              typeFilter === type
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            )}
          >
            {type !== 'all' && typeConfig[type].icon}
            <span className="capitalize">{type}</span>
            <span className="text-muted-foreground/60 text-[10px]">{typeCounts[type]}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {starred.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Star size={13} className="text-warning fill-warning" />
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Starred</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {starred.map(p => (
                <ProjectCard key={p.id} project={p} onOpen={() => setActiveProjectId(p.id)} />
              ))}
            </div>
          </section>
        )}

        {rest.length > 0 && (
          <section>
            {starred.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <Clock size={13} className="text-muted-foreground" />
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All repositories</h2>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {rest.map(p => (
                <ProjectCard key={p.id} project={p} onOpen={() => setActiveProjectId(p.id)} />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Filter size={32} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No repositories match your filters</p>
            <button
              onClick={() => { setSearch(''); setTypeFilter('all') }}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Placeholder Tooltip for this file
function Tooltip({ children }: { content: string; children: React.ReactNode }) {
  return <>{children}</>
}
