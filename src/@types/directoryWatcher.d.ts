interface Callbacks {
  notifyNewRepo: (path: string) => Promise<void>;
  notifyNewFile: (path: string) => Promise<void>;
  notifyUpdateFile: (path: string) => Promise<void>;
  notifyRemoveFile: (path: string) => Promise<void>;
}
