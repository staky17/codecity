import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("myAPI", {
  update: (count: number) => ipcRenderer.send("update-title", count),
  openDialog: async () => ipcRenderer.invoke("open-dialog"),
  getCurrentConfig: () => ipcRenderer.invoke("get-current-config"),
  on: (channel: string, callback: any) =>
    ipcRenderer.on(channel, (event, ...argv) => callback(event, ...argv)),
});
