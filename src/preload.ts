import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("myAPI", {
  update: (count: number) => ipcRenderer.send("update-title", count),
  openDialog: async () => ipcRenderer.invoke("open-dialog"),
});

// contextBridge.exposeInMainWorld("myAPI", {
//   openDialog: async () => ipcRenderer.invoke("open-dialog"),
// });
