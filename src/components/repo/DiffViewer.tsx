import { Fragment } from 'react'
import { mockFileDiff } from '@/data/mock'
import { cn } from '@/lib/utils'
import { FileCode, Plus, Minus } from 'lucide-react'
import type { DiffLine, FileDiff } from '@/types'

function DiffLineRow({ line }: { line: DiffLine }) {
  const lineClasses = {
    addition: 'bg-success/10 text-success',
    deletion: 'bg-destructive/10 text-destructive',
    context: 'text-muted-foreground',
    hunk: 'bg-primary/5 text-primary/70 italic',
  }

  const prefix = { addition: '+', deletion: '-', context: ' ', hunk: '' }

  return (
    <tr className={cn('group', lineClasses[line.type])}>
      <td className="select-none text-right pr-2 pl-3 text-[11px] font-mono opacity-50 min-w-[40px] border-r border-border/30 group-hover:opacity-80">
        {line.type !== 'addition' && line.type !== 'hunk' ? (line.lineNumberOld ?? '') : ''}
      </td>
      <td className="select-none text-right pr-2 pl-2 text-[11px] font-mono opacity-50 min-w-[40px] border-r border-border/30 group-hover:opacity-80">
        {line.type !== 'deletion' && line.type !== 'hunk' ? (line.lineNumberNew ?? '') : ''}
      </td>
      <td className="select-none text-center px-1.5 text-[11px] font-mono opacity-70 min-w-[20px]">
        {prefix[line.type]}
      </td>
      <td className="text-[12px] font-mono pr-4 py-0.5 whitespace-pre">
        {line.content}
      </td>
    </tr>
  )
}

interface DiffViewerProps {
  diff?: FileDiff
}

export function DiffViewer({ diff = mockFileDiff }: DiffViewerProps) {
  const totalAdditions = diff.hunks.flatMap(h => h.lines).filter(l => l.type === 'addition').length
  const totalDeletions = diff.hunks.flatMap(h => h.lines).filter(l => l.type === 'deletion').length

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border shrink-0 bg-card">
        <FileCode size={13} className="text-muted-foreground" />
        <code className="text-xs font-mono text-foreground flex-1 truncate">{diff.path}</code>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-success flex items-center gap-0.5">
            <Plus size={11} />{totalAdditions}
          </span>
          <span className="text-xs text-destructive flex items-center gap-0.5">
            <Minus size={11} />{totalDeletions}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-background">
        <table className="w-full border-collapse">
          <tbody>
            {diff.hunks.map((hunk, hunkIdx) => (
              <Fragment key={`hunk-${hunkIdx}`}>
                <tr className="bg-primary/5 border-y border-border/30">
                  <td colSpan={4} className="px-4 py-1 text-[11px] font-mono text-primary/70 italic">
                    {hunk.header}
                  </td>
                </tr>
                {hunk.lines.map((line, lineIdx) => (
                  <DiffLineRow key={`${hunkIdx}-${lineIdx}`} line={line} />
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
