import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow, nativeTheme, shell } from "electron";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function shouldDisableChromiumSandbox() {
  if (process.env.PRISM_DISABLE_CHROMIUM_SANDBOX === "1") {
    return true;
  }

  if (typeof process.getuid === "function" && process.getuid() === 0) {
    return true;
  }

  return Boolean(process.env.PROOT_DISTRO_NAME);
}

function getRendererUrl() {
  const devServerUrl = process.argv.find((arg) =>
    arg.startsWith("--dev-server-url=")
  );

  if (devServerUrl) {
    return devServerUrl.replace("--dev-server-url=", "");
  }

  return `file://${path.join(__dirname, "../renderer/index.html")}`;
}

if (shouldDisableChromiumSandbox()) {
  app.commandLine.appendSwitch("no-sandbox");
  app.commandLine.appendSwitch("disable-setuid-sandbox");
}

function createWindow() {
  nativeTheme.themeSource = "dark";

  const window = new BrowserWindow({
    width: 1460,
    height: 920,
    minWidth: 390,
    minHeight: 680,
    backgroundColor: "#050816",
    titleBarStyle: "hiddenInset",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: !shouldDisableChromiumSandbox(),
      spellcheck: true,
      webviewTag: true
    }
  });

  window.once("ready-to-show", () => {
    window.show();
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  window.loadURL(getRendererUrl());
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
