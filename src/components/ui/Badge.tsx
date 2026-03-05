import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'destructive' | 'warning' | 'muted' | 'primary' | 'accent'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/15 text-success',
  destructive: 'bg-destructive/15 text-destructive',
  warning: 'bg-warning/15 text-warning-foreground',
  muted: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/15 text-primary',
  accent: 'bg-accent/15 text-accent',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium tracking-wide',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
