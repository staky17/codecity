import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("myAPI", {
  update: (count: number) => ipcRenderer.send("update-title", count),
  openDialog: async () => ipcRenderer.invoke("open-dialog"),

  on: (channel: string, callback: any) =>
    ipcRenderer.on(channel, (event, ...argv) => callback(event, ...argv)),
});
