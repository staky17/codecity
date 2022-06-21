import path from "path";
import { app, screen, dialog, ipcMain } from "electron";
const chokidar = require("chokidar");

import WindowsManager from "./windowsManager";
import DirectoryWatcher from "./directoryWatcher";
const isDev = process.env.NODE_ENV === "development";

// ウィンドウ管理
const windowsManager = new WindowsManager(isDev);
const directoryWatcher = new DirectoryWatcher();

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
  ipcMain.handle("open-dialog", async (_e, _arg) => {
    if (typeof windowsManager.windows.console === "undefined") {
      return;
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
