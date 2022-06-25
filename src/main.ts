import path from "path";
import { app, screen, dialog, ipcMain } from "electron";

import WindowsManager from "./windowsManager";
import DirectoryWatcher from "./directoryWatcher";
import { getFileInfo } from "./fileInfoAnalyzer";
const isDev = process.env.NODE_ENV === "development";

// ウィンドウ管理
const windowsManager = new WindowsManager(isDev);
const directoryWatcher = new DirectoryWatcher({
  notifyNewRepo: async () => {
    // 新しいフォルダを監視し始めたことをbackgroundに通知するコード
    windowsManager.windows.background?.webContents.send("reset");
  },
  notifyNewFile: async (path: string) => {
    // 新しいファイルをbackgroundに通知するコード
    windowsManager.windows.background?.webContents.send(
      "addFile",
      await getFileInfo(path)
    );
  },
  notifyUpdateFile: async (path: string) => {
    // 更新されたファイルをbackgroundに通知するコード
    windowsManager.windows.background?.webContents.send(
      "updateFile",
      await getFileInfo(path)
    );
  },
  notifyRemoveFile: async (path: string) => {
    // 削除されたファイルをbackgroundに通知するコード
    windowsManager.windows.background?.webContents.send("removeFile", {
      mime: null,
      charset: null,
      size: null,
      lineCount: null,
      path: path,
    });
  },
});

if (isDev) {
  require("electron-reload")(__dirname, {
    electron: path.resolve(
      __dirname,
      process.platform === "win32"
        ? "../node_modules/electron/dist/electron.exe"
        : "../node_modules/.bin/electron"
    ),
  });
}

app.whenReady().then(() => {
  // 準備ができたら背景を表示
  windowsManager.createWindow("background");

  // ディスプレイの追加，大きさ変更，削除されたら，背景のウィンドウサイズを画面に合わせる
  screen.on("display-added", () => {
    windowsManager.fitBackgroundToScreen();
  });
  screen.on("display-metrics-changed", () => {
    windowsManager.fitBackgroundToScreen();
  });
  screen.on("display-removed", () => {
    windowsManager.fitBackgroundToScreen();
  });
  ipcMain.handle("get-current-config", (_e, _arg) => {
    return {
      targetPath: directoryWatcher.targetPath,
    };
  });
  ipcMain.handle("open-dialog", async (_e, _arg) => {
    if (typeof windowsManager.windows.console === "undefined") {
      return "";
    }
    return (
      dialog
        // フォルダ選択ダイアログを表示する
        .showOpenDialog(windowsManager.windows.console, {
          properties: ["openDirectory"],
          title: "フォルダ選択",
        })
        .then((result) => {
          // キャンセルボタンが押されたとき
          if (result.canceled) return "";

          directoryWatcher.watchPath(result.filePaths[0]);

          // 選択されたファイルの絶対パスを返す
          return result.filePaths[0];
        })
    );
  });
});

app.on("activate", () => {
  // ドッグアイコンをクリックしたら背景とコンソールを表示
  windowsManager.createWindow("background");
  windowsManager.createWindow("console");
});

// すべてのウィンドウが停止したらアプリを終了
app.once("window-all-closed", () => app.quit());
