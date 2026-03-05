import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as git from './git'
import * as repos from './repos'

// ESM does not have __dirname — reconstruct it from import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isDev = !app.isPackaged

// ─── Window ──────────────────────────────────────────────────────────────────

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    // Custom title bar — TitleBar.tsx renders the window chrome
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    frame: false,
    backgroundColor: '#0B0E14',   // --background dark
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,   // show after ready-to-show to avoid white flash
  })

  // Load app
  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Show only when ready to avoid flash of unstyled content
  win.once('ready-to-show', () => {
    win?.show()
  })

  // Forward maximize/unmaximize events to renderer
  win.on('maximize', () => win?.webContents.send('window:maximize-changed', true))
  win.on('unmaximize', () => win?.webContents.send('window:maximize-changed', false))

  win.on('closed', () => { win = null })
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow()

  // macOS: re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ─── IPC: Window controls ────────────────────────────────────────────────────

ipcMain.on('window:minimize', () => win?.minimize())
ipcMain.on('window:maximize', () => {
  if (win?.isMaximized()) win.unmaximize()
  else win?.maximize()
})
ipcMain.on('window:close', () => win?.close())

ipcMain.handle('window:is-maximized', () => win?.isMaximized() ?? false)

// ─── IPC: Repositories ───────────────────────────────────────────────────────

ipcMain.handle('repos:list', () => repos.listRepos())

ipcMain.handle('repos:add', async (_e, repoPath: string) => {
  return repos.addRepo(repoPath)
})

ipcMain.handle('repos:remove', (_e, repoPath: string) => {
  repos.removeRepo(repoPath)
})

ipcMain.handle('repos:open-dialog', async () => {
  const result = await dialog.showOpenDialog(win!, {
    title: 'Open Repository',
    properties: ['openDirectory'],
    buttonLabel: 'Open Repository',
  })
  if (result.canceled || result.filePaths.length === 0) return null

  const repoPath = result.filePaths[0]
  const addResult = await repos.addRepo(repoPath)
  if (!addResult.ok) return { error: addResult.error }
  return { path: repoPath }
})

// ─── IPC: Git operations ─────────────────────────────────────────────────────

function wrapGit<T>(fn: () => Promise<T>): Promise<{ data?: T; error?: string }> {
  return fn()
    .then(data => ({ data }))
    .catch((err: Error) => ({ error: err.message }))
}

ipcMain.handle('git:status', (_e, repoPath: string) =>
  wrapGit(() => git.getStatus(repoPath))
)

ipcMain.handle('git:log', (_e, repoPath: string, maxCount?: number) =>
  wrapGit(() => git.getLog(repoPath, maxCount))
)

ipcMain.handle('git:branches', (_e, repoPath: string) =>
  wrapGit(() => git.getBranches(repoPath))
)

ipcMain.handle('git:diff', (_e, repoPath: string, filePath: string, staged?: boolean) =>
  wrapGit(() => git.getDiff(repoPath, filePath, staged))
)

ipcMain.handle('git:commit-diff', (_e, repoPath: string, hash: string) =>
  wrapGit(() => git.getCommitDiff(repoPath, hash))
)

ipcMain.handle('git:stage', (_e, repoPath: string, files: string[]) =>
  wrapGit(() => git.stageFiles(repoPath, files))
)

ipcMain.handle('git:unstage', (_e, repoPath: string, files: string[]) =>
  wrapGit(() => git.unstageFiles(repoPath, files))
)

ipcMain.handle('git:discard', (_e, repoPath: string, files: string[]) =>
  wrapGit(() => git.discardChanges(repoPath, files))
)

ipcMain.handle('git:commit', (_e, repoPath: string, message: string) =>
  wrapGit(() => git.commit(repoPath, message))
)

ipcMain.handle('git:fetch', (_e, repoPath: string) =>
  wrapGit(() => git.fetch(repoPath))
)

ipcMain.handle('git:pull', (_e, repoPath: string) =>
  wrapGit(() => git.pull(repoPath))
)

ipcMain.handle('git:push', (_e, repoPath: string, force?: boolean) =>
  wrapGit(() => git.push(repoPath, force))
)

ipcMain.handle('git:checkout', (_e, repoPath: string, branch: string) =>
  wrapGit(() => git.checkoutBranch(repoPath, branch))
)

ipcMain.handle('git:create-branch', (_e, repoPath: string, name: string) =>
  wrapGit(() => git.createBranch(repoPath, name))
)

ipcMain.handle('git:tags', (_e, repoPath: string) =>
  wrapGit(() => git.getTags(repoPath))
)

// ─── IPC: App ────────────────────────────────────────────────────────────────

ipcMain.handle('app:version', () => app.getVersion())

ipcMain.handle('app:open-external', (_e, url: string) => {
  shell.openExternal(url)
})
