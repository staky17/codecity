import path from "path";
import { BrowserWindow, app, ipcMain, session, dialog } from "electron";

const isDev = process.env.NODE_ENV === "development";

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

const createWindows = () => {
  const backgroundWindow = new BrowserWindow({
    type: "desktop",
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const consoleWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.handle("open-dialog", async (_e, _arg) => {
    return (
      dialog
        // フォルダ選択ダイアログを表示する
        .showOpenDialog(consoleWindow, {
          properties: ["openDirectory"],
          title: "フォルダ選択",
        })
        .then((result) => {
          // キャンセルボタンが押されたとき
          if (result.canceled) return "";

          // 選択されたファイルの絶対パスを返す
          return result.filePaths[0];
        })
    );
  });

  // ipcMain.on('update-title', (_e, arg) => {
  //   backgroundWindow.setTitle(`Electron React TypeScript: ${arg}`);
  // });

  if (isDev) {
    // searchDevtools('REACT')
    //   .then((devtools) => {
    //     session.defaultSession.loadExtension(devtools, {
    //       allowFileAccess: true,
    //     });
    //   })
    //   .catch((err) => console.log(err));

    backgroundWindow.webContents.openDevTools({ mode: "detach" });
    consoleWindow.webContents.openDevTools({ mode: "detach" });
  }

  backgroundWindow.loadFile("dist/background/index.html");
  consoleWindow.loadFile("dist/console/index.html");
};

app.whenReady().then(createWindows);
app.once("window-all-closed", () => app.quit());
