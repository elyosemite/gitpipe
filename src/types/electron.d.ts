import type { ElectronAPI } from '../../electron/preload'

declare global {
  interface Window {
    /** Available only when running inside Electron */
    electronAPI?: ElectronAPI
  }
}

export {}
