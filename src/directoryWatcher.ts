import chokidar from "chokidar";
const _ = require("lodash");

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
      const allFiles = this.watcher?.getWatched();
      if (typeof allFiles === "undefined") {
        return;
      }
      const formattedAllFiles = Object.entries(allFiles)
        .map(([path, basenames]) => basenames.map((name) => `${path}/${name}`))
        .flat();

      this.pathString2Tree(formattedAllFiles, function (tree) {
        console.log("tree: ", JSON.stringify(tree[0]));
      });

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

  pathString2Tree(paths: string[], callBack: (tree) => void): void {
    var tree = [];

    //ループする！
    _.each(paths, function (path: string) {
      // currentLevelを rootに初期化する
      var pathParts = path.split("/");
      pathParts.shift();
      // currentLevelを rootに初期化する
      var currentLevel = tree;

      _.each(pathParts, function (part: string) {
        // pathが既存しているかどうかをチェックする
        var existingPath = _.find(currentLevel, {
          name: part,
        });

        if (existingPath) {
          // Pathはすでにツリー構造に入っているので、追加しない
          // current levelを下の子供階層に設定し直す
          currentLevel = existingPath.children;
        } else {
          var newPart = {
            name: part,
            children: [],
          };

          currentLevel.push(newPart);
          currentLevel = newPart.children;
        }
      });
    });

    callBack(tree);
  }
}

export default DirectoryWatcher;
