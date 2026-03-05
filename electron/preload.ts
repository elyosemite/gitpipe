import { contextBridge, ipcRenderer } from 'electron'

// ─── Type-safe IPC bridge ────────────────────────────────────────────────────
// Exposed as window.electronAPI in the renderer (React app).
// Never expose the full ipcRenderer — only named, scoped methods.

const api = {
  // ── Window controls ────────────────────────────────────────────────────────
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),
    onMaximizeChange: (cb: (maximized: boolean) => void): (() => void) => {
      const handler = (_e: Electron.IpcRendererEvent, value: boolean) => cb(value)
      ipcRenderer.on('window:maximize-changed', handler)
      return () => { ipcRenderer.off('window:maximize-changed', handler) }
    },
  },

  // ── Repositories ──────────────────────────────────────────────────────────
  repos: {
    list: () => ipcRenderer.invoke('repos:list'),
    add: (repoPath: string) => ipcRenderer.invoke('repos:add', repoPath),
    remove: (repoPath: string) => ipcRenderer.invoke('repos:remove', repoPath),
    openDialog: () => ipcRenderer.invoke('repos:open-dialog'),
  },

  // ── Git operations ────────────────────────────────────────────────────────
  git: {
    status: (repoPath: string) => ipcRenderer.invoke('git:status', repoPath),
    log: (repoPath: string, maxCount?: number) => ipcRenderer.invoke('git:log', repoPath, maxCount),
    branches: (repoPath: string) => ipcRenderer.invoke('git:branches', repoPath),
    diff: (repoPath: string, filePath: string, staged?: boolean) =>
      ipcRenderer.invoke('git:diff', repoPath, filePath, staged),
    commitDiff: (repoPath: string, hash: string) =>
      ipcRenderer.invoke('git:commit-diff', repoPath, hash),
    stage: (repoPath: string, files: string[]) =>
      ipcRenderer.invoke('git:stage', repoPath, files),
    unstage: (repoPath: string, files: string[]) =>
      ipcRenderer.invoke('git:unstage', repoPath, files),
    discard: (repoPath: string, files: string[]) =>
      ipcRenderer.invoke('git:discard', repoPath, files),
    commit: (repoPath: string, message: string) =>
      ipcRenderer.invoke('git:commit', repoPath, message),
    fetch: (repoPath: string) => ipcRenderer.invoke('git:fetch', repoPath),
    pull: (repoPath: string) => ipcRenderer.invoke('git:pull', repoPath),
    push: (repoPath: string, force?: boolean) =>
      ipcRenderer.invoke('git:push', repoPath, force),
    checkout: (repoPath: string, branch: string) =>
      ipcRenderer.invoke('git:checkout', repoPath, branch),
    createBranch: (repoPath: string, name: string) =>
      ipcRenderer.invoke('git:create-branch', repoPath, name),
    tags: (repoPath: string) => ipcRenderer.invoke('git:tags', repoPath),
  },

  // ── App info ──────────────────────────────────────────────────────────────
  app: {
    version: (): Promise<string> => ipcRenderer.invoke('app:version'),
    openExternal: (url: string) => ipcRenderer.invoke('app:open-external', url),
    platform: process.platform as NodeJS.Platform,
  },
} as const

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
