import chokidar from "chokidar";

class DirectoryWatcher {
  public targetPath: string;
  private watcher?: chokidar.FSWatcher;
  private notifyNewRepo: (path: string) => Promise<void>;
  private notifyNewFile: (path: string) => Promise<void>;
  private notifyUpdateFile: (path: string) => Promise<void>;
  private notifyRemoveFile: (path: string) => Promise<void>;

  constructor(callbacks: Callbacks) {
    this.targetPath = "";
    this.notifyNewRepo = callbacks.notifyNewRepo;
    this.notifyNewFile = callbacks.notifyNewFile;
    this.notifyUpdateFile = callbacks.notifyUpdateFile;
    this.notifyRemoveFile = callbacks.notifyRemoveFile;
  }

  watchPath(path: string) {
    this.unwatchPath();

    this.targetPath = path;

    this.watcher = chokidar.watch(path, {
      ignored: [/[\\\/]\./, /.*node_modules.*/],
      // ignored: (mypath) => mypath.includes("node_modules"),
      persistent: true,
      usePolling: false,
      followSymlinks: false,
      depth: 5,
      ignorePermissionErrors: true,
    });

    this.watcher.on("ready", async () => {
      // 新しくフォルダを監視することを通知する
      await this.notifyNewRepo(path);
      // すでにあるファイルを通知する
      this.notifyExistingFiles();

      // 新しくファイルを見つけて通知する
      this.watcher?.on("add", this.notifyNewFile);
      // ファイルの変更を見つけて通知する
      this.watcher?.on("change", this.notifyUpdateFile);
      // ファイルの変更を見つけて通知する
      this.watcher?.on("unlink", this.notifyRemoveFile);
      // 新しいフォルダを見つけて通知する
      // this.watcher?.on("addDir", this.notifyNewFile);
    });
  }

  unwatchPath() {
    if (typeof this.watcher !== "undefined") {
      this.watcher.close();
      this.watcher = undefined;
      this.targetPath = "";
    }
  }

  async notifyExistingFiles() {
    const allFiles = this.watcher?.getWatched();
    if (typeof allFiles === "undefined") return;

    const paths = Object.entries(allFiles)
      .map(([path, basenames]) => basenames.map((name) => `${path}/${name}`))
      .flat();

    for (let path of paths) {
      await this.notifyNewFile(path);
    }
  }
}

export default DirectoryWatcher;
