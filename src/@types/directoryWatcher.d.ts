interface Callbacks {
  notifyNewRepo: () => Promise<any>;
  notifyNewFile: (path: string) => Promise<any>;
  notifyUpdateFile: (path: string) => Promise<any>;
  notifyRemoveFile: (path: string) => Promise<any>;
}
