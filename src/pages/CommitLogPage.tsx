import { useState, useMemo } from 'react'
import {
  Search, Copy, Check, GitMerge, GitCommit,
  ChevronDown, Plus, Minus, X, User, Calendar,
  GitBranch, Hash, ArrowRight,
} from 'lucide-react'
import { mockGraphCommits } from '@/data/mockGraph'
import { mockFileDiff } from '@/data/mock'
import { Button } from '@/components/ui/Button'
import { cn, formatRelativeTime, truncateHash } from '@/lib/utils'
import type { GraphCommit, FileChange, LaneConn } from '@/types'

// ─── Graph SVG constants ────────────────────────────────────────────────────
const LANE_W = 18   // px per lane column
const ROW_H = 56    // px — must match commit row height
const DOT_R = 5     // commit dot radius
const STROKE = 2    // line stroke width

function laneX(lane: number) { return lane * LANE_W + LANE_W / 2 }
const MID = ROW_H / 2

// ─── Graph cell SVG ─────────────────────────────────────────────────────────
interface GraphCellProps {
  lane: number
  color: string
  topLanes: LaneConn[]
  bottomLanes: LaneConn[]
  isMerge?: boolean
}

function GraphCell({ lane, color, topLanes, bottomLanes, isMerge }: GraphCellProps) {
  const allLanes = [...topLanes, ...bottomLanes, { lane, color }]
  const maxLane = Math.max(...allLanes.map(l => l.lane))
  const w = (maxLane + 1) * LANE_W

  const cx = laneX(lane)
  const inTop = topLanes.some(l => l.lane === lane)
  const inBottom = bottomLanes.some(l => l.lane === lane)

  // Lanes that pass straight through (in both top+bottom, not this lane)
  const through = topLanes.filter(t =>
    t.lane !== lane && bottomLanes.some(b => b.lane === t.lane)
  )
  // Lanes that appear in bottom but NOT top (new branch emerging from this commit)
  const newBranches = bottomLanes.filter(b =>
    b.lane !== lane && !topLanes.some(t => t.lane === b.lane)
  )
  // Lanes that appear in top but NOT bottom (branch ending / merging into this commit)
  const endingLanes = topLanes.filter(t =>
    t.lane !== lane && !bottomLanes.some(b => b.lane === t.lane)
  )

  return (
    <svg
      width={w}
      height={ROW_H}
      style={{ minWidth: w, display: 'block', flexShrink: 0 }}
    >
      {/* Through-lanes: full vertical line */}
      {through.map(({ lane: l, color: c }) => (
        <line
          key={`through-${l}`}
          x1={laneX(l)} y1={0} x2={laneX(l)} y2={ROW_H}
          style={{ stroke: c, strokeWidth: STROKE }}
        />
      ))}

      {/* This commit's lane: top half */}
      {inTop && (
        <line
          x1={cx} y1={0} x2={cx} y2={MID}
          style={{ stroke: color, strokeWidth: STROKE }}
        />
      )}

      {/* This commit's lane: bottom half */}
      {inBottom && (
        <line
          x1={cx} y1={MID} x2={cx} y2={ROW_H}
          style={{ stroke: color, strokeWidth: STROKE }}
        />
      )}

      {/* New branch curves: commit dot → bottom of new lane */}
      {newBranches.map(({ lane: l, color: c }) => {
        const bx = laneX(l)
        return (
          <path
            key={`branch-${l}`}
            d={`M ${cx} ${MID} Q ${bx} ${MID} ${bx} ${ROW_H}`}
            style={{ stroke: c, strokeWidth: STROKE, fill: 'none' }}
          />
        )
      })}

      {/* Ending lane curves: top of other lane → commit dot (merge in) */}
      {endingLanes.map(({ lane: l, color: c }) => {
        const ex = laneX(l)
        return (
          <path
            key={`end-${l}`}
            d={`M ${ex} ${0} Q ${ex} ${MID} ${cx} ${MID}`}
            style={{ stroke: c, strokeWidth: STROKE, fill: 'none' }}
          />
        )
      })}

      {/* Commit dot */}
      <circle
        cx={cx} cy={MID} r={DOT_R}
        style={{ fill: color, stroke: 'hsl(var(--card))', strokeWidth: 2.5 }}
      />

      {/* Merge commit: extra ring */}
      {isMerge && (
        <circle
          cx={cx} cy={MID} r={DOT_R + 3.5}
          style={{ fill: 'none', stroke: color, strokeWidth: 1.5, opacity: 0.5 }}
        />
      )}
    </svg>
  )
}

// ─── Ref badge ──────────────────────────────────────────────────────────────
function RefBadge({ label }: { label: string }) {
  const isHead = label === 'HEAD'
  const isOrigin = label.startsWith('origin/')
  const isMain = label === 'main' || label === 'origin/main'

  if (isHead) return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-accent/20 text-accent border border-accent/30">
      {label}
    </span>
  )
  if (isMain) return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-success/15 text-success border border-success/20">
      {label}
    </span>
  )
  if (isOrigin) return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground border border-border">
      {label}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary/15 text-primary border border-primary/20">
      {label}
    </span>
  )
}

// ─── Author avatar ───────────────────────────────────────────────────────────
const AVATAR_PALETTE = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
]

function authorColor(email: string): string {
  const h = email.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length]
}

function Avatar({ name, email, size = 20 }: { name: string; email: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      style={{ width: size, height: size, background: authorColor(email) }}
      className="rounded-full flex items-center justify-center text-background font-bold shrink-0"
    >
      <span style={{ fontSize: size * 0.38 }}>{initials}</span>
    </div>
  )
}

// ─── File status icon ────────────────────────────────────────────────────────
const FILE_STATUS = {
  modified: { label: 'M', cls: 'text-warning bg-warning/10' },
  added:    { label: 'A', cls: 'text-success bg-success/10' },
  deleted:  { label: 'D', cls: 'text-destructive bg-destructive/10' },
  renamed:  { label: 'R', cls: 'text-primary bg-primary/10' },
  untracked:{ label: 'U', cls: 'text-muted-foreground bg-muted' },
  staged:   { label: 'S', cls: 'text-accent bg-accent/10' },
} as const

function FileStatusBadge({ status }: { status: FileChange['status'] }) {
  const cfg = FILE_STATUS[status]
  return (
    <span className={cn('w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center shrink-0', cfg.cls)}>
      {cfg.label}
    </span>
  )
}

function ChangedFileBar({ files }: { files: FileChange[] }) {
  const total = files.reduce((s, f) => s + f.additions + f.deletions, 0)
  if (total === 0) return null
  const additions = files.reduce((s, f) => s + f.additions, 0)
  const deletions = files.reduce((s, f) => s + f.deletions, 0)
  const pct = (n: number) => `${Math.round((n / total) * 100)}%`
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-20 rounded-full overflow-hidden flex bg-border/30">
        <div style={{ width: pct(additions) }} className="bg-success" />
        <div style={{ width: pct(deletions) }} className="bg-destructive" />
      </div>
      <span className="text-[10px] text-success">+{additions}</span>
      <span className="text-[10px] text-destructive">-{deletions}</span>
    </div>
  )
}

// ─── Commit row ──────────────────────────────────────────────────────────────
interface CommitRowProps {
  commit: GraphCommit
  isSelected: boolean
  onSelect: () => void
}

function CommitRow({ commit, isSelected, onSelect }: CommitRowProps) {
  return (
    <div
      onClick={onSelect}
      style={{ height: ROW_H }}
      className={cn(
        'flex items-center gap-0 cursor-pointer group select-none border-b border-border/40',
        'transition-colors duration-75',
        isSelected ? 'bg-primary/10' : 'hover:bg-secondary/50'
      )}
    >
      {/* Selected indicator */}
      <div className={cn(
        'w-0.5 self-stretch shrink-0 transition-colors',
        isSelected ? 'bg-primary' : 'bg-transparent'
      )} />

      {/* Graph SVG */}
      <div className="flex items-center self-stretch shrink-0 pl-2">
        <GraphCell
          lane={commit.lane}
          color={commit.color}
          topLanes={commit.topLanes}
          bottomLanes={commit.bottomLanes}
          isMerge={commit.isMergeCommit}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-center gap-3 pr-3 pl-2">
        {/* Left: message + refs + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {commit.isMergeCommit && (
              <GitMerge size={11} className="text-muted-foreground shrink-0" />
            )}
            <span className={cn(
              'text-xs font-medium truncate',
              isSelected ? 'text-foreground' : 'text-foreground/90'
            )}>
              {commit.message}
            </span>
            {commit.refs.map(r => <RefBadge key={r} label={r} />)}
          </div>

          <div className="flex items-center gap-2.5 mt-1">
            <Avatar name={commit.author} email={commit.authorEmail} size={14} />
            <span className="text-[10px] text-muted-foreground">{commit.author}</span>
            <span className="text-[10px] text-muted-foreground/50">
              {formatRelativeTime(commit.date)}
            </span>
          </div>
        </div>

        {/* Right: hash + file stats */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <code className={cn(
            'text-[10px] font-mono px-1.5 py-0.5 rounded',
            isSelected ? 'bg-primary/20 text-primary' : 'text-muted-foreground/60 group-hover:text-muted-foreground'
          )}>
            {commit.shortHash}
          </code>
          {commit.changedFiles.length > 0 && (
            <span className="text-[10px] text-muted-foreground/50">
              {commit.changedFiles.length} file{commit.changedFiles.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Commit detail panel ─────────────────────────────────────────────────────
interface CommitDetailProps {
  commit: GraphCommit
  onClose?: () => void
}

function CommitDetail({ commit, onClose }: CommitDetailProps) {
  const [copied, setCopied] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(
    commit.changedFiles[0]?.path ?? null
  )

  const copyHash = () => {
    navigator.clipboard.writeText(commit.hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          {commit.isMergeCommit
            ? <GitMerge size={14} className="text-muted-foreground" />
            : <GitCommit size={14} className="text-muted-foreground" />
          }
          <button
            onClick={copyHash}
            className="flex items-center gap-1.5 font-mono text-xs text-foreground hover:text-primary transition-colors"
          >
            <code>{commit.shortHash}</code>
            {copied
              ? <Check size={11} className="text-success" />
              : <Copy size={11} className="text-muted-foreground" />
            }
          </button>
        </div>
        <div className="flex items-center gap-2">
          {commit.refs.map(r => <RefBadge key={r} label={r} />)}
          {onClose && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X size={13} />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Commit message */}
        <div className="px-4 py-3 border-b border-border/60">
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {commit.message}
          </p>
          {commit.bodyText && (
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">
              {commit.bodyText}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="px-4 py-3 border-b border-border/60 space-y-2">
          {/* Author */}
          <div className="flex items-center gap-2.5">
            <User size={12} className="text-muted-foreground shrink-0" />
            <Avatar name={commit.author} email={commit.authorEmail} size={20} />
            <div>
              <div className="text-xs font-medium text-foreground">{commit.author}</div>
              <div className="text-[10px] text-muted-foreground">{commit.authorEmail}</div>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2.5">
            <Calendar size={12} className="text-muted-foreground shrink-0" />
            <div>
              <span className="text-xs text-foreground">
                {commit.date.toLocaleDateString('en-US', {
                  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
              <span className="text-[10px] text-muted-foreground ml-2">
                ({formatRelativeTime(commit.date)})
              </span>
            </div>
          </div>

          {/* Full hash */}
          <div className="flex items-center gap-2.5">
            <Hash size={12} className="text-muted-foreground shrink-0" />
            <code className="text-[11px] font-mono text-muted-foreground break-all">
              {commit.hash}
            </code>
          </div>

          {/* Parents */}
          {commit.parents.length > 0 && (
            <div className="flex items-center gap-2.5">
              <ArrowRight size={12} className="text-muted-foreground shrink-0" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-muted-foreground">parent{commit.parents.length > 1 ? 's' : ''}:</span>
                {commit.parents.map(p => (
                  <code key={p} className="text-[11px] font-mono text-primary hover:underline cursor-pointer">
                    {truncateHash(p)}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Changed files */}
        {commit.changedFiles.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Changed files
              </span>
              <ChangedFileBar files={commit.changedFiles} />
            </div>

            <div className="divide-y divide-border/40">
              {commit.changedFiles.map(f => {
                const filename = f.path.split('/').pop() ?? f.path
                const dir = f.path.includes('/') ? f.path.split('/').slice(0, -1).join('/') + '/' : ''
                const isSelected = f.path === selectedFile
                return (
                  <button
                    key={f.path}
                    onClick={() => setSelectedFile(isSelected ? null : f.path)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors',
                      isSelected ? 'bg-primary/8' : 'hover:bg-secondary/50'
                    )}
                  >
                    <FileStatusBadge status={f.status} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-medium text-foreground">{filename}</span>
                      {dir && <span className="text-[10px] text-muted-foreground/60 ml-1">{dir}</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {f.additions > 0 && (
                        <span className="text-[10px] text-success flex items-center gap-0.5">
                          <Plus size={9} />{f.additions}
                        </span>
                      )}
                      {f.deletions > 0 && (
                        <span className="text-[10px] text-destructive flex items-center gap-0.5">
                          <Minus size={9} />{f.deletions}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Inline diff for selected file */}
            {selectedFile && (
              <div className="border-t border-border">
                <InlineDiff filePath={selectedFile} />
              </div>
            )}
          </div>
        )}

        {commit.changedFiles.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
            No file changes (merge commit)
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Inline diff (uses mockFileDiff as demo) ─────────────────────────────────
function InlineDiff({ filePath }: { filePath: string }) {
  const diff = { ...mockFileDiff, path: filePath }

  return (
    <div className="overflow-auto max-h-80 bg-background">
      <table className="w-full border-collapse text-[11px] font-mono">
        <tbody>
          {diff.hunks.map((hunk, hi) => (
            <>
              <tr key={`h-${hi}`} className="bg-primary/5 border-y border-border/20">
                <td colSpan={4} className="px-3 py-0.5 text-primary/60 italic">{hunk.header}</td>
              </tr>
              {hunk.lines.map((line, li) => {
                const cls = {
                  addition: 'bg-success/10 text-success',
                  deletion: 'bg-destructive/10 text-destructive',
                  context: 'text-muted-foreground',
                  hunk: '',
                }[line.type]
                return (
                  <tr key={`${hi}-${li}`} className={cls}>
                    <td className="select-none text-right pr-2 pl-3 opacity-40 min-w-[32px] border-r border-border/20">
                      {line.type !== 'addition' && line.type !== 'hunk' ? (line.lineNumberOld ?? '') : ''}
                    </td>
                    <td className="select-none text-right pr-2 pl-2 opacity-40 min-w-[32px] border-r border-border/20">
                      {line.type !== 'deletion' && line.type !== 'hunk' ? (line.lineNumberNew ?? '') : ''}
                    </td>
                    <td className="select-none text-center px-1 opacity-60 min-w-[14px]">
                      {line.type === 'addition' ? '+' : line.type === 'deletion' ? '-' : ' '}
                    </td>
                    <td className="pr-4 py-px whitespace-pre">{line.content}</td>
                  </tr>
                )
              })}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Toolbar: search + filters ───────────────────────────────────────────────
type BranchFilter = 'all' | 'main' | 'feat' | 'fix' | string
type AuthorFilter = 'all' | string

const BRANCH_FILTERS: { id: BranchFilter; label: string }[] = [
  { id: 'all', label: 'All branches' },
  { id: 'main', label: 'main' },
  { id: 'feat', label: 'feat/*' },
  { id: 'fix', label: 'fix/*' },
]

const ALL_AUTHORS = Array.from(new Set(mockGraphCommits.map(c => c.author)))

// ─── Main page ───────────────────────────────────────────────────────────────
export function CommitLogPage() {
  const [search, setSearch] = useState('')
  const [branchFilter, setBranchFilter] = useState<BranchFilter>('all')
  const [authorFilter, setAuthorFilter] = useState<AuthorFilter>('all')
  const [authorOpen, setAuthorOpen] = useState(false)
  const [selectedHash, setSelectedHash] = useState<string | null>(
    mockGraphCommits[0]?.hash ?? null
  )

  const filtered = useMemo(() => {
    return mockGraphCommits.filter(c => {
      const q = search.toLowerCase()
      const matchSearch = !search
        || c.message.toLowerCase().includes(q)
        || c.author.toLowerCase().includes(q)
        || c.shortHash.startsWith(q)

      const matchBranch = branchFilter === 'all'
        || (branchFilter === 'main' && c.refs.some(r => r === 'main' || r === 'origin/main'))
        || (branchFilter === 'feat' && c.refs.some(r => r.startsWith('feat/')))
        || (branchFilter === 'fix' && c.refs.some(r => r.startsWith('fix/')))
        || branchFilter === 'all'

      const matchAuthor = authorFilter === 'all' || c.author === authorFilter

      return matchSearch && matchBranch && matchAuthor
    })
  }, [search, branchFilter, authorFilter])

  const selected = mockGraphCommits.find(c => c.hash === selectedHash) ?? null

  const totalStats = useMemo(() => ({
    files: filtered.flatMap(c => c.changedFiles).length,
    additions: filtered.flatMap(c => c.changedFiles).reduce((s, f) => s + f.additions, 0),
    deletions: filtered.flatMap(c => c.changedFiles).reduce((s, f) => s + f.deletions, 0),
  }), [filtered])

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-card shrink-0">
        {/* Search */}
        <div className="flex items-center gap-2 h-7 px-2.5 rounded-md border border-border bg-background w-64">
          <Search size={12} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search commits, authors, hashes…"
            className="flex-1 text-[11px] bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={11} className="text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Branch filter pills */}
        <div className="flex items-center gap-1 bg-secondary/50 rounded-md p-0.5">
          {BRANCH_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setBranchFilter(f.id)}
              className={cn(
                'flex items-center gap-1 h-6 px-2.5 rounded text-[11px] font-medium transition-colors',
                branchFilter === f.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f.id !== 'all' && <GitBranch size={10} />}
              {f.label}
            </button>
          ))}
        </div>

        {/* Author filter */}
        <div className="relative">
          <button
            onClick={() => setAuthorOpen(o => !o)}
            className={cn(
              'flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-[11px] font-medium transition-colors',
              authorFilter !== 'all'
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:text-foreground'
            )}
          >
            <User size={11} />
            <span>{authorFilter === 'all' ? 'All authors' : authorFilter.split(' ')[0]}</span>
            <ChevronDown size={11} />
          </button>

          {authorOpen && (
            <div className="absolute top-full mt-1 left-0 z-20 bg-card border border-border rounded-lg shadow-xl py-1 w-44">
              {['all', ...ALL_AUTHORS].map(a => (
                <button
                  key={a}
                  onClick={() => { setAuthorFilter(a); setAuthorOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-left transition-colors',
                    authorFilter === a
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  {authorFilter === a && <Check size={10} className="shrink-0" />}
                  {a === 'all' ? 'All authors' : a}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>{filtered.length} commit{filtered.length !== 1 ? 's' : ''}</span>
          <span className="text-success">+{totalStats.additions}</span>
          <span className="text-destructive">-{totalStats.deletions}</span>
        </div>
      </div>

      {/* Body: list + detail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Commit list */}
        <div className={cn(
          'flex flex-col overflow-hidden border-r border-border',
          selected ? 'w-[52%]' : 'flex-1'
        )}>
          {/* Column headers */}
          <div className="flex items-center px-4 py-1.5 border-b border-border/60 bg-card/50 shrink-0">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Graph · Message · Author
            </span>
            <span className="ml-auto text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Hash
            </span>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <Search size={28} className="text-muted-foreground/30" />
                <div>
                  <p className="text-sm text-muted-foreground">No commits match your filters</p>
                  <button
                    onClick={() => { setSearch(''); setBranchFilter('all'); setAuthorFilter('all') }}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            ) : (
              filtered.map((commit) => (
                <CommitRow
                  key={commit.hash}
                  commit={commit}
                  isSelected={commit.hash === selectedHash}
                  onSelect={() => setSelectedHash(
                    selectedHash === commit.hash ? null : commit.hash
                  )}
                />
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="flex flex-col overflow-hidden" style={{ width: '48%' }}>
            <CommitDetail
              key={selected.hash}
              commit={selected}
              onClose={() => setSelectedHash(null)}
            />
          </div>
        )}

        {/* Empty state for detail */}
        {!selected && (
          <div className="hidden" />
        )}
      </div>
    </div>
  )
}
