import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("prismDesktop", {
  platform: process.platform,
  version: process.versions.electron
});
