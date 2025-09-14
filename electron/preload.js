import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("native", {
  readOqc: (date) => ipcRenderer.invoke("native:read-oqc", date),
  saveOqc: (record) => ipcRenderer.invoke("native:save-oqc", record),
  showMsg: (opts) => ipcRenderer.invoke("show-msg", opts),
});
