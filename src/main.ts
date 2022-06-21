import path from "path";
import { app, screen } from "electron";

import WindowsManager from "./windowsManager";

const isDev = process.env.NODE_ENV === "development";

// ウィンドウ管理
const windowsManager = new WindowsManager(isDev);

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
});

// ipcMain.on('update-title', (_e, arg) => {
//   backgroundWindow.setTitle(`Electron React TypeScript: ${arg}`);
// });

app.on("activate", () => {
  // ドッグアイコンをクリックしたら背景とコンソールを表示
  windowsManager.createWindow("background");
  windowsManager.createWindow("console");
});

// すべてのウィンドウが停止したらアプリを終了
app.once("window-all-closed", () => app.quit());
