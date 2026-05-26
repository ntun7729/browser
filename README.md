# Prism Browser

Prism Browser is a polished v1 browser shell built with Electron, Vite, React, and TypeScript. The project is tuned for practical development on laptops and for running inside Ubuntu under Termux `proot` where heavy packaging layers would make setup harder than it needs to be.

## Why this architecture

- Electron provides the most practical path to a real multi-tab browser shell with embedded web content, stable navigation controls, and mature Linux support.
- Vite keeps renderer iteration fast and simple.
- React plus small local state keeps the UI maintainable without adding a state-management framework on day one.
- Plain CSS delivers a premium visual treatment without bringing in a design system dependency chain that would make Termux and proot setup heavier.

## Project structure

```text
browser/
├── electron/              # Native shell, window boot, secure preload bridge
├── scripts/               # Lightweight dev helpers
├── src/                   # Browser UI, state, and components
├── index.html             # Renderer entry
├── package.json           # Scripts and dependencies
├── tsconfig*.json         # Separate app and Electron TypeScript configs
└── vite.config.ts         # Renderer build configuration
```

## Features in v1

- Multi-tab browsing shell with persistent active tab state
- Search-or-address omnibar with direct URL and search handling
- Back, forward, reload, and home navigation controls
- Premium two-pane browser layout with responsive adaptation for narrow windows
- Quick-launch panel for common developer and setup destinations
- TypeScript-first structure that can grow into bookmarks, history, and split view

## Install on a laptop or Linux desktop

1. Install Node.js 20 or newer.
2. Clone the repository.
3. Run `npm install`.
4. Run `npm run dev`.

For a production-style local run:

1. Run `npm run build`.
2. Run `npm start`.

## Install and run in Termux with proot Ubuntu

This app needs a graphical Linux session. The simplest path is Termux + `proot-distro` Ubuntu + Termux:X11.

### 1. Prepare Termux on Android

Install these apps:

- Termux
- Termux:X11

Then inside Termux:

```bash
pkg update
pkg install x11-repo proot-distro git
proot-distro install ubuntu
proot-distro login ubuntu
```

### 2. Install Ubuntu packages inside proot

```bash
apt update
apt install -y curl git ca-certificates build-essential \
  libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 libatspi2.0-0 \
  libasound2 libdrm2 libgbm1 libxkbcommon0 libxdamage1 libxrandr2 \
  libxcomposite1 libxfixes3 libpango-1.0-0 libcairo2 libx11-xcb1
```

Install Node.js 20+:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### 3. Start a GUI session

In Termux outside Ubuntu:

```bash
termux-x11 :0 &
```

Back inside Ubuntu:

```bash
export DISPLAY=:0
export ELECTRON_OZONE_PLATFORM_HINT=auto
export PRISM_DISABLE_CHROMIUM_SANDBOX=1
```

### 4. Run Prism

```bash
git clone https://github.com/ntun7729/browser.git
cd browser
npm install
npm run dev
```

If GPU acceleration is unstable on your device, try:

```bash
export ELECTRON_DISABLE_GPU=1
npm run dev
```

If the app starts but renders a blank or unstable window in your specific Android setup, try this slightly more defensive launch:

```bash
export LIBGL_ALWAYS_SOFTWARE=1
export ELECTRON_DISABLE_GPU=1
export PRISM_DISABLE_CHROMIUM_SANDBOX=1
npm run dev
```

## Next development targets

- persistent bookmarks and history
- split-view browsing
- session restore and pinned workspace profiles
- reader mode and download management
- Linux packaging once the shell and UX stabilize
