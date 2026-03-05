import { LayoutGrid, GitBranch, GitCommit, Terminal, Settings, HelpCircle } from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'

type NavItem = {
  id: string
  icon: React.ReactNode
  label: string
  bottom?: boolean
}

const items: NavItem[] = [
  { id: 'projects', icon: <LayoutGrid size={17} />, label: 'Projects' },
  { id: 'workspace', icon: <GitBranch size={17} />, label: 'Workspace' },
  { id: 'commits', icon: <GitCommit size={17} />, label: 'Commit Log' },
  { id: 'terminal', icon: <Terminal size={17} />, label: 'Terminal' },
  { id: 'settings', icon: <Settings size={17} />, label: 'Settings', bottom: true },
  { id: 'help', icon: <HelpCircle size={17} />, label: 'Help', bottom: true },
]

interface NavRailProps {
  active: string
  onChange: (id: string) => void
}

export function NavRail({ active, onChange }: NavRailProps) {
  const top = items.filter(i => !i.bottom)
  const bottom = items.filter(i => i.bottom)

  return (
    <nav className="flex flex-col items-center w-12 border-r border-border bg-card shrink-0 py-2 gap-0.5">
      <div className="flex flex-col items-center gap-0.5 flex-1">
        {top.map(item => (
          <Tooltip key={item.id} content={item.label} side="right">
            <button
              onClick={() => onChange(item.id)}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative',
                active === item.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {item.icon}
              {active === item.id && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
              )}
            </button>
          </Tooltip>
        ))}
      </div>

      <div className="flex flex-col items-center gap-0.5">
        {bottom.map(item => (
          <Tooltip key={item.id} content={item.label} side="right">
            <button
              onClick={() => onChange(item.id)}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                active === item.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {item.icon}
            </button>
          </Tooltip>
        ))}
      </div>
    </nav>
  )
}
