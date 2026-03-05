import simpleGit, { type SimpleGit, type LogResult, type StatusResult, type BranchSummary } from 'simple-git'
import * as path from 'path'

function git(repoPath: string): SimpleGit {
  return simpleGit(repoPath)
}

// ─── Repository info ────────────────────────────────────────────────────────

export async function getRepoName(repoPath: string): Promise<string> {
  return path.basename(repoPath)
}

export async function isValidRepo(repoPath: string): Promise<boolean> {
  try {
    await git(repoPath).checkIsRepo()
    return true
  } catch {
    return false
  }
}

// ─── Status ─────────────────────────────────────────────────────────────────

export async function getStatus(repoPath: string): Promise<StatusResult> {
  return git(repoPath).status()
}

// ─── Branches ───────────────────────────────────────────────────────────────

export async function getBranches(repoPath: string): Promise<BranchSummary> {
  return git(repoPath).branch(['-vv', '--all'])
}

export async function checkoutBranch(repoPath: string, branch: string): Promise<void> {
  await git(repoPath).checkout(branch)
}

export async function createBranch(repoPath: string, name: string): Promise<void> {
  await git(repoPath).checkoutLocalBranch(name)
}

// ─── Log ────────────────────────────────────────────────────────────────────

export async function getLog(repoPath: string, maxCount = 60): Promise<LogResult> {
  return git(repoPath).log({
    '--all': null,
    '--decorate': 'full',
    maxCount,
  })
}

export async function getCommitDiff(repoPath: string, hash: string): Promise<string> {
  return git(repoPath).show([hash, '--stat', '--patch', '--format='])
}

// ─── Working tree ────────────────────────────────────────────────────────────

export async function getDiff(repoPath: string, filePath: string, staged = false): Promise<string> {
  if (staged) {
    return git(repoPath).diff(['--cached', '--', filePath])
  }
  return git(repoPath).diff(['--', filePath])
}

export async function stageFiles(repoPath: string, files: string[]): Promise<void> {
  await git(repoPath).add(files)
}

export async function unstageFiles(repoPath: string, files: string[]): Promise<void> {
  await git(repoPath).reset(['HEAD', '--', ...files])
}

export async function discardChanges(repoPath: string, files: string[]): Promise<void> {
  await git(repoPath).checkout(['--', ...files])
}

// ─── Commit ──────────────────────────────────────────────────────────────────

export async function commit(repoPath: string, message: string): Promise<{ hash: string }> {
  const result = await git(repoPath).commit(message)
  return { hash: result.commit }
}

export async function amendCommit(repoPath: string, message: string): Promise<void> {
  await git(repoPath).commit(message, ['--amend'])
}

// ─── Remote ──────────────────────────────────────────────────────────────────

export async function fetch(repoPath: string): Promise<void> {
  await git(repoPath).fetch(['--all', '--prune'])
}

export async function pull(repoPath: string): Promise<void> {
  await git(repoPath).pull()
}

export async function push(repoPath: string, force = false): Promise<void> {
  const args = force ? ['--force-with-lease'] : []
  await git(repoPath).push(args)
}

// ─── Tags ────────────────────────────────────────────────────────────────────

export async function getTags(repoPath: string): Promise<string[]> {
  const result = await git(repoPath).tags()
  return result.all
}
