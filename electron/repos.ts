import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import { isValidRepo } from './git'

interface SavedRepo {
  path: string
  addedAt: number
}

function getConfigPath(): string {
  return path.join(app.getPath('userData'), 'repos.json')
}

function load(): SavedRepo[] {
  try {
    const raw = fs.readFileSync(getConfigPath(), 'utf-8')
    return JSON.parse(raw) as SavedRepo[]
  } catch {
    return []
  }
}

function save(repos: SavedRepo[]): void {
  fs.writeFileSync(getConfigPath(), JSON.stringify(repos, null, 2))
}

export function listRepos(): SavedRepo[] {
  return load()
}

export async function addRepo(repoPath: string): Promise<{ ok: boolean; error?: string }> {
  const valid = await isValidRepo(repoPath)
  if (!valid) return { ok: false, error: 'Not a valid git repository' }

  const repos = load()
  if (repos.some(r => r.path === repoPath)) return { ok: true }

  repos.unshift({ path: repoPath, addedAt: Date.now() })
  save(repos)
  return { ok: true }
}

export function removeRepo(repoPath: string): void {
  const repos = load().filter(r => r.path !== repoPath)
  save(repos)
}

export function reorderRepo(repoPath: string): void {
  const repos = load()
  const idx = repos.findIndex(r => r.path === repoPath)
  if (idx > 0) {
    const [repo] = repos.splice(idx, 1)
    repos.unshift(repo)
    save(repos)
  }
}
