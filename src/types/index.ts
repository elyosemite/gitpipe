export type ProjectType = 'code' | 'docs' | 'ai' | 'mixed'

export interface Project {
  id: string
  name: string
  path: string
  type: ProjectType
  description?: string
  language?: string
  currentBranch: string
  lastActivity: Date
  hasUncommittedChanges: boolean
  aheadBy: number
  behindBy: number
  starred: boolean
  tags: string[]
}

export interface Branch {
  name: string
  isRemote: boolean
  isCurrent: boolean
  lastCommitHash: string
  lastCommitMessage: string
  lastCommitDate: Date
  aheadBy?: number
  behindBy?: number
}

export interface Commit {
  hash: string
  shortHash: string
  message: string
  author: string
  authorEmail: string
  date: Date
  parents: string[]
  refs: string[]
}

export interface FileChange {
  path: string
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked' | 'staged'
  additions: number
  deletions: number
  oldPath?: string
}

export interface DiffLine {
  type: 'context' | 'addition' | 'deletion' | 'hunk'
  content: string
  lineNumberOld?: number
  lineNumberNew?: number
}

export interface DiffHunk {
  header: string
  lines: DiffLine[]
}

export interface FileDiff {
  path: string
  hunks: DiffHunk[]
  binary: boolean
}

export type Theme = 'light' | 'dark' | 'system'

export interface LaneConn {
  lane: number
  /** CSS color string, e.g. hsl(var(--primary)) */
  color: string
}

export interface GraphCommit extends Commit {
  lane: number
  /** CSS color for this commit's lane */
  color: string
  /** Active lane connections entering this row from above */
  topLanes: LaneConn[]
  /** Active lane connections leaving this row downward */
  bottomLanes: LaneConn[]
  isMergeCommit?: boolean
  bodyText?: string
  changedFiles: FileChange[]
}
