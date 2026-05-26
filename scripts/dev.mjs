import { spawn } from "node:child_process";
import net from "node:net";

const rendererPort = 5173;
const rendererUrl = `http://127.0.0.1:${rendererPort}`;

function waitForPort(port, timeoutMs = 30000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.connect(port, "127.0.0.1");

      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });

      socket.once("error", () => {
        socket.destroy();

        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timed out waiting for port ${port}`));
          return;
        }

        setTimeout(tryConnect, 300);
      });
    };

    tryConnect();
  });
}

const renderer = spawn(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["exec", "vite", "--", "--host", "0.0.0.0", "--port", String(rendererPort)],
  {
    stdio: "inherit",
    env: { ...process.env, BROWSER: "none" }
  }
);

const stopChildren = () => {
  renderer.kill("SIGTERM");
};

process.on("SIGINT", stopChildren);
process.on("SIGTERM", stopChildren);

waitForPort(rendererPort)
  .then(() => {
    const electron = spawn(
      process.platform === "win32" ? "npx.cmd" : "npx",
      ["electron", ".", `--dev-server-url=${rendererUrl}`],
      {
        stdio: "inherit",
        env: process.env
      }
    );

    electron.on("exit", (code) => {
      stopChildren();
      process.exit(code ?? 0);
    });
  })
  .catch((error) => {
    console.error(error);
    stopChildren();
    process.exit(1);
  });
