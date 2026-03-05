import { Moon, Sun, Monitor, User, GitBranch, Bell, Code2, Save } from 'lucide-react'
import { useApp } from '@/store/appStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Theme } from '@/types'

interface SettingRowProps {
  label: string
  description?: string
  children: React.ReactNode
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <div className="ml-8 shrink-0">{children}</div>
    </div>
  )
}

const sections = [
  { id: 'appearance', label: 'Appearance', icon: <Sun size={14} /> },
  { id: 'git', label: 'Git', icon: <GitBranch size={14} /> },
  { id: 'profile', label: 'Profile', icon: <User size={14} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
  { id: 'editor', label: 'Editor', icon: <Code2 size={14} /> },
]

export function SettingsPage() {
  const { theme, setTheme } = useApp()

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'dark', label: 'Dark', icon: <Moon size={14} /> },
    { value: 'light', label: 'Light', icon: <Sun size={14} /> },
    { value: 'system', label: 'System', icon: <Monitor size={14} /> },
  ]

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      {/* Settings nav */}
      <div className="w-48 border-r border-border bg-card p-3 flex flex-col gap-0.5 shrink-0">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Settings
        </div>
        {sections.map(s => (
          <button
            key={s.id}
            className={cn(
              'flex items-center gap-2 px-2 py-2 rounded-md text-xs font-medium transition-colors',
              s.id === 'appearance'
                ? 'bg-primary/10 text-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
          <p className="text-sm text-muted-foreground mt-1">Customize how GtBeholder looks on your device.</p>
        </div>

        <div className="space-y-0">
          <SettingRow label="Theme" description="Select the color theme for the application.">
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              {themeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    theme === opt.value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Font size" description="Code and UI font size in pixels.">
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={13}
                min={10}
                max={20}
                className="w-16 h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground text-center outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="text-xs text-muted-foreground">px</span>
            </div>
          </SettingRow>

          <SettingRow label="Monospace font" description="Font used in the diff viewer and terminal.">
            <select className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring">
              <option>JetBrains Mono</option>
              <option>Fira Code</option>
              <option>Cascadia Code</option>
              <option>Consolas</option>
            </select>
          </SettingRow>

          <SettingRow label="Compact mode" description="Reduce spacing for denser information display.">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-9 h-5 bg-secondary rounded-full peer peer-checked:bg-primary transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-background rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </label>
          </SettingRow>

          <SettingRow label="Show file icons" description="Display language icons next to file names.">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-secondary rounded-full peer peer-checked:bg-primary transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-background rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </label>
          </SettingRow>
        </div>

        <div className="mt-8 flex items-center gap-2">
          <Button variant="primary" size="md" className="gap-2">
            <Save size={13} />
            Save preferences
          </Button>
          <Button variant="ghost" size="md">Reset to defaults</Button>
        </div>
      </div>
    </div>
  )
}
