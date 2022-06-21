import chokidar from "chokidar";

class DirectoryWatcher {
  private watcher?: chokidar.FSWatcher;
  watchPath(path: string) {
    this.unwatchPath();
    this.watcher = chokidar.watch(path, {
      ignored: /[\/\\]\./,
      persistent: true,
      usePolling: true,
    });

    this.watcher.on("ready", async () => {
      console.log("ready watching...");
      this.watcher?.on("add", (path: string) => {
        console.log(path + " added.");
      });
    });
  }

  unwatchPath() {
    if (typeof this.watcher !== "undefined") {
      this.watcher.close();
      this.watcher = undefined;
    }
  }
}

export default DirectoryWatcher;
