import { BrowserWindow, screen, dialog, ipcMain } from "electron";
const chokidar = require("chokidar");
import path from "path";

class WindowsManager {
  public windows: Windows;
  private isDev: boolean;

  constructor(isDev: boolean) {
    this.isDev = isDev;
    this.windows = {
      background: undefined,
      console: undefined,
    };
  }
  createWindow(windowType: WindowType) {
    if (typeof this.windows[windowType] !== "undefined") return;

    switch (windowType) {
      case "background":
        const primaryDisplay = screen.getPrimaryDisplay();

        this.windows.background = new BrowserWindow({
          x: 0,
          y: 0,
          width: primaryDisplay.workAreaSize.width,
          height: primaryDisplay.workAreaSize.height,
          type: "desktop",
          frame: false,
          hasShadow: false,
          transparent: true,
          webPreferences: {
            preload: path.join(__dirname, "preload.js"),
          },
        });
        break;

      case "console":
        this.windows.console = new BrowserWindow({
          webPreferences: {
            preload: path.join(__dirname, "preload.js"),
          },
        });

        ipcMain.handle("open-dialog", async (_e, _arg) => {
          return (
            dialog
              // フォルダ選択ダイアログを表示する
              .showOpenDialog({
                properties: ["openDirectory"],
                title: "フォルダ選択",
              })
              .then((result) => {
                // キャンセルボタンが押されたとき
                if (result.canceled) return "";

                const WATCHING_DIR = result.filePaths[0];

                const watcher = chokidar.watch(WATCHING_DIR, {
                  ignored: /[\/\\]\./,
                  persistent: true,
                  usePolling: true,
                });

                watcher.on("ready", async () => {
                  console.log("ready watching...");
                  watcher.on("add", (path: string) => {
                    console.log(path + " added.");
                  });
                });

                // 選択されたファイルの絶対パスを返す
                return result.filePaths[0];
              })
          );
        });

        this.windows.console.setMenuBarVisibility(false);
        break;
    }

    if (this.isDev)
      this.windows[windowType]?.webContents.openDevTools({ mode: "detach" });

    this.windows[windowType]?.loadFile(`dist/${windowType}/index.html`);

    this.windows[windowType]?.on("closed", () => {
      this.windows[windowType] = undefined;
    });
  }

  fitBackgroundToScreen() {
    if (typeof this.windows.background === "undefined") return;
    const primaryDisplay = screen.getPrimaryDisplay();

    this.windows.background.setBounds({
      x: 0,
      y: 0,
      width: primaryDisplay.workAreaSize.width,
      height: primaryDisplay.workAreaSize.height,
    });
  }
}

export default WindowsManager;
