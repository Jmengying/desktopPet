# 二次元桌面宠物 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Windows desktop pet app with Electron featuring a white-haired cat girl character (白玉) that lives on the desktop with animations, interactions, walking, and customization.

**Architecture:** Multi-window Electron app — a transparent always-on-top Pet Window for the character, and a Config Window for settings. Main process manages state, windows, and system integration. Character rendered via SVG with skeletal animation.

**Tech Stack:** Electron, Node.js, HTML/CSS/JS, SVG, Canvas 2D

---

## File Structure

```
desktopPet/
├── package.json
├── src/
│   ├── main/
│   │   ├── index.js                    # Electron entry, app lifecycle
│   │   ├── window-manager.js           # Pet + Config window creation/management
│   │   ├── state-manager.js            # Persistent config (electron-store)
│   │   ├── ipc-handlers.js             # IPC message routing
│   │   └── system-integration.js       # Tray, auto-start, power monitor
│   ├── pet/
│   │   ├── index.html                  # Pet window HTML
│   │   ├── styles.css                  # Pet window styles
│   │   ├── renderer.js                 # Pet window entry, orchestration
│   │   ├── character/
│   │   │   ├── skeleton.js             # SVG skeletal system
│   │   │   ├── expression.js           # Facial expression interpolation
│   │   │   ├── physics.js              # Spring physics (hair, tail, ears)
│   │   │   └── baiyu.js               # 白玉 character definition (SVG paths)
│   │   ├── animation/
│   │   │   ├── state-machine.js        # Animation state machine
│   │   │   ├── idle.js                 # Idle animations (stand, sway, breathe)
│   │   │   ├── walk.js                 # Walking animation + desktop movement
│   │   │   ├── interact.js             # Click/drag/hover reaction animations
│   │   │   └── events.js              # Random event scheduler
│   │   ├── interaction/
│   │   │   ├── drag.js                 # Drag-to-move logic
│   │   │   ├── click.js                # Click detection & interaction
│   │   │   ├── follow.js               # Mouse follow / eye tracking
│   │   │   └── context-menu.js         # Right-click frosted glass menu
│   │   ├── effects/
│   │   │   └── particles.js            # Particle effects (stars, bubbles)
│   │   └── audio/
│   │       └── sound-manager.js        # Sound effect playback
│   └── config/
│       ├── index.html                  # Config window HTML
│       ├── styles.css                  # Config window styles
│       └── renderer.js                 # Config window logic
├── assets/
│   └── sounds/                         # Sound effect files (placeholder)
└── docs/
    └── superpowers/specs/              # Design spec
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `src/main/index.js`
- Create: `src/pet/index.html`
- Create: `src/pet/styles.css`

- [ ] **Step 1: Initialize npm project**

```bash
cd D:/desktopPet
npm init -y
```

- [ ] **Step 2: Install dependencies**

```bash
npm install electron --save-dev
npm install electron-store
```

- [ ] **Step 3: Update package.json**

```json
{
  "name": "desktop-pet",
  "version": "1.0.0",
  "description": "二次元桌面宠物 — 白玉",
  "main": "src/main/index.js",
  "scripts": {
    "start": "electron .",
    "dev": "electron . --dev"
  },
  "devDependencies": {
    "electron": "^33.0.0"
  },
  "dependencies": {
    "electron-store": "^10.0.0"
  }
}
```

- [ ] **Step 4: Create main process entry**

```javascript
// src/main/index.js
const { app } = require('electron');
const { WindowManager } = require('./window-manager');
const { StateManager } = require('./state-manager');
const { setupIPC } = require('./ipc-handlers');
const { SystemIntegration } = require('./system-integration');

let windowManager;
let stateManager;
let systemIntegration;

app.whenReady().then(() => {
  stateManager = new StateManager();
  windowManager = new WindowManager(stateManager);
  systemIntegration = new SystemIntegration(stateManager);

  setupIPC(windowManager, stateManager, systemIntegration);

  windowManager.createPetWindow();
  systemIntegration.createTray();
});

app.on('window-all-closed', (e) => {
  // Prevent app quit — pet runs in background
  e.preventDefault();
});

app.on('before-quit', () => {
  systemIntegration.cleanup();
});
```

- [ ] **Step 5: Create minimal pet window HTML**

```html
<!-- src/pet/index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'">
  <title>Desktop Pet</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <canvas id="pet-canvas"></canvas>
  <div id="context-menu" class="hidden"></div>
  <script src="renderer.js"></script>
</body>
</html>
```

```css
/* src/pet/styles.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

#pet-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 6: Verify app starts**

```bash
npm start
```

Expected: Electron window appears (not yet transparent).

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: project scaffolding with Electron setup"
```

---

## Task 2: Transparent Pet Window

**Files:**
- Create: `src/main/window-manager.js`

- [ ] **Step 1: Create WindowManager**

```javascript
// src/main/window-manager.js
const { BrowserWindow, screen } = require('electron');
const path = require('path');

class WindowManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.petWindow = null;
    this.configWindow = null;
  }

  createPetWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const petSize = this.stateManager.get('petSize', 200);

    this.petWindow = new BrowserWindow({
      width: petSize,
      height: petSize,
      x: width - petSize - 50,
      y: height - petSize - 50,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      hasShadow: false,
      webPreferences: {
        preload: path.join(__dirname, '../pet/preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    this.petWindow.setIgnoreMouseEvents(true, { forward: true });
    this.petWindow.loadFile(path.join(__dirname, '../pet/index.html'));

    // Keep always on top
    this.petWindow.setAlwaysOnTop(true, 'screen-saver');

    return this.petWindow;
  }

  getPetWindow() {
    return this.petWindow;
  }

  setIgnoreMouseEvents(ignore) {
    if (this.petWindow) {
      this.petWindow.setIgnoreMouseEvents(ignore, { forward: true });
    }
  }

  setPetPosition(x, y) {
    if (this.petWindow) {
      this.petWindow.setPosition(Math.round(x), Math.round(y));
    }
  }

  getPetBounds() {
    return this.petWindow ? this.petWindow.getBounds() : null;
  }

  openConfigWindow() {
    if (this.configWindow) {
      this.configWindow.focus();
      return;
    }

    this.configWindow = new BrowserWindow({
      width: 420,
      height: 500,
      transparent: true,
      frame: false,
      resizable: false,
      webPreferences: {
        preload: path.join(__dirname, '../config/preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    this.configWindow.loadFile(path.join(__dirname, '../config/index.html'));

    this.configWindow.on('closed', () => {
      this.configWindow = null;
    });
  }

  closeConfigWindow() {
    if (this.configWindow) {
      this.configWindow.close();
      this.configWindow = null;
    }
  }
}

module.exports = { WindowManager };
```

- [ ] **Step 2: Create pet preload script**

```javascript
// src/pet/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petAPI', {
  onStateUpdate: (callback) => ipcRenderer.on('state-update', (_, data) => callback(data)),
  sendAction: (action, data) => ipcRenderer.send('pet-action', { action, data }),
  getState: () => ipcRenderer.invoke('get-state'),
  openConfig: () => ipcRenderer.send('open-config'),
  quitApp: () => ipcRenderer.send('quit-app')
});
```

- [ ] **Step 3: Verify transparent window**

```bash
npm start
```

Expected: Transparent window on desktop, click-through works.

- [ ] **Step 4: Commit**

```bash
git add src/main/window-manager.js src/pet/preload.js
git commit -m "feat: transparent always-on-top pet window"
```

---

## Task 3: State Manager

**Files:**
- Create: `src/main/state-manager.js`

- [ ] **Step 1: Create StateManager**

```javascript
// src/main/state-manager.js
const Store = require('electron-store');

const schema = {
  petSize: { type: 'number', default: 200, minimum: 100, maximum: 400 },
  opacity: { type: 'number', default: 1, minimum: 0.2, maximum: 1 },
  soundEnabled: { type: 'boolean', default: true },
  soundVolume: { type: 'number', default: 0.5, minimum: 0, maximum: 1 },
  followMouse: { type: 'boolean', default: true },
  randomEvents: { type: 'boolean', default: true },
  walkingEnabled: { type: 'boolean', default: true },
  walkFrequency: { type: 'string', default: 'medium', enum: ['low', 'medium', 'high'] },
  autoStart: { type: 'boolean', default: false },
  currentCharacter: { type: 'string', default: 'baiyu' },
  petX: { type: 'number', default: -1 },
  petY: { type: 'number', default: -1 }
};

class StateManager {
  constructor() {
    this.store = new Store({ schema });
    this.listeners = new Set();
  }

  get(key, defaultValue) {
    return this.store.get(key, defaultValue);
  }

  set(key, value) {
    this.store.set(key, value);
    this.notify(key, value);
  }

  getAll() {
    return this.store.store;
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(key, value) {
    for (const cb of this.listeners) {
      cb(key, value);
    }
  }
}

module.exports = { StateManager };
```

- [ ] **Step 2: Commit**

```bash
git add src/main/state-manager.js
git commit -m "feat: state manager with electron-store"
```

---

## Task 4: IPC Handlers

**Files:**
- Create: `src/main/ipc-handlers.js`

- [ ] **Step 1: Create IPC handlers**

```javascript
// src/main/ipc-handlers.js
const { ipcMain, app } = require('electron');

function setupIPC(windowManager, stateManager, systemIntegration) {
  ipcMain.handle('get-state', () => {
    return stateManager.getAll();
  });

  ipcMain.on('pet-action', (_, { action, data }) => {
    switch (action) {
      case 'drag-start':
        windowManager.setIgnoreMouseEvents(false);
        break;
      case 'drag-end':
        windowManager.setIgnoreMouseEvents(true);
        break;
      case 'drag-move':
        windowManager.setPetPosition(data.x, data.y);
        break;
      case 'right-click':
        windowManager.openConfigWindow();
        break;
      case 'state-changed':
        stateManager.set(data.key, data.value);
        // Broadcast to config window if open
        break;
    }
  });

  ipcMain.on('open-config', () => {
    windowManager.openConfigWindow();
  });

  ipcMain.on('close-config', () => {
    windowManager.closeConfigWindow();
  });

  ipcMain.on('update-setting', (_, { key, value }) => {
    stateManager.set(key, value);
  });

  ipcMain.on('quit-app', () => {
    app.quit();
  });

  // State change broadcasting
  stateManager.onChange((key, value) => {
    const petWin = windowManager.getPetWindow();
    if (petWin) petWin.webContents.send('state-update', { key, value });
  });
}

module.exports = { setupIPC };
```

- [ ] **Step 2: Commit**

```bash
git add src/main/ipc-handlers.js
git commit -m "feat: IPC message routing"
```

---

## Task 5: System Integration (Tray, Auto-start, Power Monitor)

**Files:**
- Create: `src/main/system-integration.js`

- [ ] **Step 1: Create SystemIntegration**

```javascript
// src/main/system-integration.js
const { Tray, Menu, nativeImage, powerMonitor } = require('electron');
const path = require('path');

class SystemIntegration {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.tray = null;
    this.idleCheckInterval = null;
    this.lastInputTime = Date.now();
    this.idleState = 'active'; // active, idle, sleeping
  }

  createTray() {
    const iconPath = path.join(__dirname, '../../assets/icons/tray.png');
    // Create a simple 16x16 icon programmatically if not exists
    const icon = nativeImage.createEmpty();
    this.tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
      { label: '显示宠物', click: () => {} },
      { type: 'separator' },
      { label: '退出', click: () => require('electron').app.quit() }
    ]);

    this.tray.setToolTip('白玉 — 桌面宠物');
    this.tray.setContextMenu(contextMenu);

    this.startIdleDetection();
  }

  startIdleDetection() {
    // Use powerMonitor for system idle detection
    this.idleCheckInterval = setInterval(() => {
      const idleTime = powerMonitor.getSystemIdleTime();
      let newState = 'active';

      if (idleTime > 300) {
        newState = 'sleeping';
      } else if (idleTime > 60) {
        newState = 'idle';
      }

      if (newState !== this.idleState) {
        this.idleState = newState;
        // Notify pet window via state manager
        this.stateManager.notify('idleState', newState);
      }
    }, 5000);
  }

  getIdleState() {
    return this.idleState;
  }

  setAutoStart(enabled) {
    const { app } = require('electron');
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: app.getPath('exe')
    });
  }

  cleanup() {
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
    }
    if (this.tray) {
      this.tray.destroy();
    }
  }
}

module.exports = { SystemIntegration };
```

- [ ] **Step 2: Create assets directory**

```bash
mkdir -p D:/desktopPet/assets/icons
mkdir -p D:/desktopPet/assets/sounds
```

- [ ] **Step 3: Commit**

```bash
git add src/main/system-integration.js assets/
git commit -m "feat: system tray, auto-start, idle detection"
```

---

## Task 6: Character Skeleton System

**Files:**
- Create: `src/pet/character/skeleton.js`
- Create: `src/pet/character/baiyu.js`

- [ ] **Step 1: Create Skeleton system**

```javascript
// src/pet/character/skeleton.js
class Bone {
  constructor(name, x, y, parent = null) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.parent = parent;
    this.children = [];
    this.worldX = 0;
    this.worldY = 0;
    this.worldRotation = 0;
  }

  addChild(child) {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  updateWorldTransform() {
    if (this.parent) {
      const rad = this.parent.worldRotation * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      this.worldX = this.parent.worldX + (this.x * cos - this.y * sin);
      this.worldY = this.parent.worldY + (this.x * sin + this.y * cos);
      this.worldRotation = this.parent.worldRotation + this.rotation;
    } else {
      this.worldX = this.x;
      this.worldY = this.y;
      this.worldRotation = this.rotation;
    }

    for (const child of this.children) {
      child.updateWorldTransform();
    }
  }
}

class Skeleton {
  constructor() {
    this.root = new Bone('root', 0, 0);
    this.bones = new Map();
    this.bones.set('root', this.root);
  }

  addBone(name, x, y, parentName = 'root') {
    const parent = this.bones.get(parentName);
    const bone = new Bone(name, x, y, parent);
    parent.addChild(bone);
    this.bones.set(name, bone);
    return bone;
  }

  getBone(name) {
    return this.bones.get(name);
  }

  update() {
    this.root.updateWorldTransform();
  }
}

module.exports = { Skeleton, Bone };
```

- [ ] **Step 2: Create 白玉 character definition**

```javascript
// src/pet/character/baiyu.js
const { Skeleton } = require('./skeleton');

function createBaiyuSkeleton() {
  const skeleton = new Skeleton();

  // Root at center-bottom of character
  skeleton.addBone('body', 0, -80, 'root');
  skeleton.addBone('head', 0, -60, 'body');

  // Ears
  skeleton.addBone('earLeft', -20, -25, 'head');
  skeleton.addBone('earRight', 20, -25, 'head');

  // Hair
  skeleton.addBone('hairBack', 0, -10, 'head');
  skeleton.addBone('hairFront', 0, -20, 'head');
  skeleton.addBone('hairLeft', -25, -5, 'head');
  skeleton.addBone('hairRight', 25, -5, 'head');

  // Face parts
  skeleton.addBone('eyeLeft', -12, -5, 'head');
  skeleton.addBone('eyeRight', 12, -5, 'head');
  skeleton.addBone('mouth', 0, 8, 'head');
  skeleton.addBone('blushLeft', -18, 2, 'head');
  skeleton.addBone('blushRight', 18, 2, 'head');

  // Arms
  skeleton.addBone('armLeft', -30, -20, 'body');
  skeleton.addBone('armRight', 30, -20, 'body');

  // Tail
  skeleton.addBone('tail1', 15, 20, 'body');
  skeleton.addBone('tail2', 10, 15, 'tail1');
  skeleton.addBone('tail3', 5, 10, 'tail2');

  return skeleton;
}

// SVG path data for each body part
const BAIYU_PARTS = {
  body: {
    fill: '#FFF5F5',
    stroke: '#FFB6C1',
    path: 'M-18,-40 C-20,-45 -22,-50 -18,-55 L18,-55 C22,-50 20,-45 18,-40 L20,0 C20,5 15,10 0,10 C-15,10 -20,5 -20,0 Z'
  },
  head: {
    fill: '#FFFAF0',
    stroke: '#FFB6C1',
    path: 'M-25,-20 C-28,-30 -25,-40 -15,-45 C-5,-50 5,-50 15,-45 C25,-40 28,-30 25,-20 C28,-10 25,5 15,12 C5,18 -5,18 -15,12 C-25,5 -28,-10 -25,-20 Z'
  },
  earLeft: {
    fill: '#FFFFFF',
    stroke: '#FFB6C1',
    innerFill: '#FFD1DC',
    path: 'M-5,0 L-12,-20 L0,-18 Z',
    innerPath: 'M-4,-2 L-10,-16 L-1,-15 Z'
  },
  earRight: {
    fill: '#FFFFFF',
    stroke: '#FFB6C1',
    innerFill: '#FFD1DC',
    path: 'M5,0 L12,-20 L0,-18 Z',
    innerPath: 'M4,-2 L10,-16 L1,-15 Z'
  },
  eyeLeft: {
    fill: '#6B5B95',
    highlight: '#FFFFFF',
    draw: 'eye'
  },
  eyeRight: {
    fill: '#6B5B95',
    highlight: '#FFFFFF',
    draw: 'eye'
  },
  mouth: {
    fill: '#FF69B4',
    draw: 'mouth'
  },
  blushLeft: {
    fill: 'rgba(255,182,193,0.4)',
    draw: 'blush'
  },
  blushRight: {
    fill: 'rgba(255,182,193,0.4)',
    draw: 'blush'
  },
  armLeft: {
    fill: '#FFFAF0',
    stroke: '#FFB6C1',
    path: 'M0,-5 C-5,-5 -12,0 -10,15 C-8,20 -2,22 0,18 C2,22 8,20 10,15 C12,0 5,-5 0,-5 Z'
  },
  armRight: {
    fill: '#FFFAF0',
    stroke: '#FFB6C1',
    path: 'M0,-5 C-5,-5 -12,0 -10,15 C-8,20 -2,22 0,18 C2,22 8,20 10,15 C12,0 5,-5 0,-5 Z'
  },
  hairFront: {
    fill: '#F0F0F0',
    stroke: '#D0D0D0',
    path: 'M-28,-25 C-30,-35 -25,-50 -15,-48 C-10,-47 -8,-40 -10,-30 L-8,-25 C-5,-35 -2,-45 0,-48 C2,-45 5,-35 8,-25 L10,-30 C8,-40 10,-47 15,-48 C25,-50 30,-35 28,-25 C25,-20 20,-15 15,-12 C10,-10 5,-8 0,-8 C-5,-8 -10,-10 -15,-12 C-20,-15 -25,-20 -28,-25 Z'
  },
  hairBack: {
    fill: '#E8E8E8',
    stroke: '#C0C0C0',
    path: 'M-30,-15 C-32,-25 -28,-45 -15,-50 C-5,-53 5,-53 15,-50 C28,-45 32,-25 30,-15 C32,0 30,20 25,35 C20,45 10,50 0,50 C-10,50 -20,45 -25,35 C-30,20 -32,0 -30,-15 Z'
  },
  hairLeft: {
    fill: '#E8E8E8',
    stroke: '#C0C0C0',
    path: 'M-25,-10 C-28,-5 -30,10 -28,25 C-26,35 -22,40 -18,38 C-15,36 -14,30 -16,20 C-18,10 -20,0 -25,-10 Z'
  },
  hairRight: {
    fill: '#E8E8E8',
    stroke: '#C0C0C0',
    path: 'M25,-10 C28,-5 30,10 28,25 C26,35 22,40 18,38 C15,36 14,30 16,20 C18,10 20,0 25,-10 Z'
  },
  tail1: {
    fill: '#F0F0F0',
    stroke: '#D0D0D0',
    path: 'M-4,0 C-6,5 -8,12 -5,18 L5,18 C8,12 6,5 4,0 Z'
  },
  tail2: {
    fill: '#E8E8E8',
    stroke: '#C0C0C0',
    path: 'M-3,0 C-5,4 -7,10 -4,15 L4,15 C7,10 5,4 3,0 Z'
  },
  tail3: {
    fill: '#E0E0E0',
    stroke: '#B0B0B0',
    path: 'M-2,0 C-4,3 -5,8 -3,12 L3,12 C5,8 4,3 2,0 Z'
  }
};

// Default expression (smile)
const EXPRESSIONS = {
  default: {
    eyeLeft: { scaleY: 1, pupilY: 0 },
    eyeRight: { scaleY: 1, pupilY: 0 },
    mouth: { path: 'M-5,0 C-3,3 3,3 5,0', open: 0 }
  },
  happy: {
    eyeLeft: { scaleY: 0.6, pupilY: 0 },
    eyeRight: { scaleY: 0.6, pupilY: 0 },
    mouth: { path: 'M-6,0 C-4,5 4,5 6,0', open: 0.3 }
  },
  sleepy: {
    eyeLeft: { scaleY: 0.3, pupilY: 2 },
    eyeRight: { scaleY: 0.3, pupilY: 2 },
    mouth: { path: 'M-4,0 C-2,2 2,2 4,0', open: 0.5 }
  },
  surprised: {
    eyeLeft: { scaleY: 1.3, pupilY: -1 },
    eyeRight: { scaleY: 1.3, pupilY: -1 },
    mouth: { path: 'M-3,0 C-3,4 3,4 3,0', open: 0.8 }
  },
  shy: {
    eyeLeft: { scaleY: 0.5, pupilY: 1 },
    eyeRight: { scaleY: 0.5, pupilY: 1 },
    mouth: { path: 'M-3,0 C-1,2 1,2 3,0', open: 0 }
  },
  curious: {
    eyeLeft: { scaleY: 1.1, pupilY: -1 },
    eyeRight: { scaleY: 1.1, pupilY: -1 },
    mouth: { path: 'M-4,0 C-2,2 2,2 4,0', open: 0.2 }
  },
  sleeping: {
    eyeLeft: { scaleY: 0, pupilY: 0 },
    eyeRight: { scaleY: 0, pupilY: 0 },
    mouth: { path: 'M-3,0 C-1,1 1,1 3,0', open: 0 }
  }
};

module.exports = { createBaiyuSkeleton, BAIYU_PARTS, EXPRESSIONS };
```

- [ ] **Step 3: Commit**

```bash
git add src/pet/character/
git commit -m "feat: character skeleton system and 白玉 definition"
```

---

## Task 7: Character Renderer

**Files:**
- Create: `src/pet/character/expression.js`
- Create: `src/pet/character/physics.js`
- Create: `src/pet/renderer.js`

- [ ] **Step 1: Create Expression system**

```javascript
// src/pet/character/expression.js
class ExpressionSystem {
  constructor() {
    this.current = 'default';
    this.target = 'default';
    this.progress = 1;
    this.speed = 0.1;
    this.blendValues = {};
  }

  setExpression(name, speed = 0.1) {
    if (this.current === name) return;
    this.target = name;
    this.progress = 0;
    this.speed = speed;
  }

  update(expressions) {
    if (this.progress < 1) {
      this.progress = Math.min(1, this.progress + this.speed);
    }

    if (this.progress >= 1 && this.current !== this.target) {
      this.current = this.target;
    }

    const currentExpr = expressions[this.current] || expressions.default;
    const targetExpr = expressions[this.target] || expressions.default;

    this.blendValues = {
      eyeLeft: {
        scaleY: this.lerp(currentExpr.eyeLeft.scaleY, targetExpr.eyeLeft.scaleY, this.progress),
        pupilY: this.lerp(currentExpr.eyeLeft.pupilY, targetExpr.eyeLeft.pupilY, this.progress)
      },
      eyeRight: {
        scaleY: this.lerp(currentExpr.eyeRight.scaleY, targetExpr.eyeRight.scaleY, this.progress),
        pupilY: this.lerp(currentExpr.eyeRight.pupilY, targetExpr.eyeRight.pupilY, this.progress)
      },
      mouth: {
        open: this.lerp(currentExpr.mouth.open, targetExpr.mouth.open, this.progress)
      }
    };

    return this.blendValues;
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }
}

module.exports = { ExpressionSystem };
```

- [ ] **Step 2: Create Physics system**

```javascript
// src/pet/character/physics.js
class Spring {
  constructor(stiffness = 0.15, damping = 0.7) {
    this.stiffness = stiffness;
    this.damping = damping;
    this.value = 0;
    this.velocity = 0;
    this.target = 0;
  }

  update() {
    const force = (this.target - this.value) * this.stiffness;
    this.velocity += force;
    this.velocity *= this.damping;
    this.value += this.velocity;
    return this.value;
  }

  setTarget(target) {
    this.target = target;
  }
}

class PhysicsSystem {
  constructor() {
    this.springs = {
      earLeft: new Spring(0.2, 0.6),
      earRight: new Spring(0.2, 0.6),
      tail1: new Spring(0.1, 0.8),
      tail2: new Spring(0.08, 0.8),
      tail3: new Spring(0.06, 0.8),
      hairLeft: new Spring(0.1, 0.75),
      hairRight: new Spring(0.1, 0.75),
      body: new Spring(0.12, 0.7)
    };
    this.time = 0;
  }

  update(dt, characterVelocity = { x: 0, y: 0 }) {
    this.time += dt;

    // Ear twitching
    const earTwitch = Math.sin(this.time * 3) * 2;
    this.springs.earLeft.setTarget(earTwitch + characterVelocity.x * 0.5);
    this.springs.earRight.setTarget(-earTwitch - characterVelocity.x * 0.5);

    // Tail sway
    const tailSway = Math.sin(this.time * 2) * 8;
    this.springs.tail1.setTarget(tailSway + characterVelocity.x * 2);
    this.springs.tail2.setTarget(tailSway * 0.7);
    this.springs.tail3.setTarget(tailSway * 0.4);

    // Hair physics
    this.springs.hairLeft.setTarget(characterVelocity.x * 1.5 + Math.sin(this.time * 1.5) * 1);
    this.springs.hairRight.setTarget(-characterVelocity.x * 1.5 - Math.sin(this.time * 1.5) * 1);

    // Body bounce (walking)
    this.springs.body.setTarget(Math.abs(characterVelocity.x) > 0.5 ? Math.sin(this.time * 8) * 2 : 0);

    const result = {};
    for (const [key, spring] of Object.entries(this.springs)) {
      result[key] = spring.update();
    }
    return result;
  }
}

module.exports = { PhysicsSystem, Spring };
```

- [ ] **Step 3: Create main renderer**

```javascript
// src/pet/renderer.js
const { createBaiyuSkeleton, BAIYU_PARTS, EXPRESSIONS } = require('./character/baiyu');
const { ExpressionSystem } = require('./character/expression');
const { PhysicsSystem } = require('./character/physics');
const { AnimationStateMachine } = require('./animation/state-machine');
const { DragInteraction } = require('./interaction/drag');
const { ClickInteraction } = require('./interaction/click');
const { FollowSystem } = require('./interaction/follow');
const { ContextMenu } = require('./interaction/context-menu');
const { RandomEventScheduler } = require('./animation/events');
const { SoundManager } = require('./audio/sound-manager');

class PetRenderer {
  constructor() {
    this.canvas = document.getElementById('pet-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.skeleton = createBaiyuSkeleton();
    this.expression = new ExpressionSystem();
    this.physics = new PhysicsSystem();
    this.animState = new AnimationStateMachine();
    this.follow = new FollowSystem();
    this.contextMenu = new ContextMenu();
    this.sound = new SoundManager();
    this.randomEvents = new RandomEventScheduler();

    this.width = 200;
    this.height = 200;
    this.scale = 1;
    this.opacity = 1;
    this.lastTime = performance.now();
    this.velocity = { x: 0, y: 0 };

    this.setupCanvas();
    this.setupInteractions();
    this.startRenderLoop();
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  setupInteractions() {
    new DragInteraction(this.canvas, this);
    new ClickInteraction(this.canvas, this);
    this.contextMenu.init(this.canvas, this);
  }

  onStateUpdate(state) {
    if (state.key === 'petSize') this.setScale(state.value / 200);
    if (state.key === 'opacity') this.opacity = state.value;
    if (state.key === 'soundEnabled') this.sound.setEnabled(state.value);
    if (state.key === 'soundVolume') this.sound.setVolume(state.value);
    if (state.key === 'followMouse') this.follow.setEnabled(state.value);
    if (state.key === 'randomEvents') this.randomEvents.setEnabled(state.value);
    if (state.key === 'walkingEnabled') this.animState.setWalkingEnabled(state.value);
    if (state.key === 'idleState') this.animState.setIdleState(state.value);
  }

  setScale(s) {
    this.scale = s;
  }

  triggerInteraction(type) {
    this.animState.trigger(type);
    this.expression.setExpression(type === 'click' ? 'happy' : 'surprised', 0.15);
    this.sound.play(type);
  }

  startRenderLoop() {
    const loop = (now) => {
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;

      this.update(dt);
      this.render();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update(dt) {
    const velocity = this.animState.getVelocity();
    this.velocity = velocity;

    this.skeleton.update();
    this.physics.update(dt, velocity);
    this.animState.update(dt);
    this.follow.update(this.skeleton, dt);
    this.expression.update(EXPRESSIONS);
    this.randomEvents.update(dt, this);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();

    ctx.globalAlpha = this.opacity;
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(this.scale, this.scale);

    const physicsValues = this.physics.update(0, this.velocity);
    const expressionValues = this.expression.blendValues;

    this.renderCharacter(ctx, physicsValues, expressionValues);

    ctx.restore();
  }

  renderCharacter(ctx, physics, expr) {
    const parts = BAIYU_PARTS;

    // Draw order: hairBack, tail, body, arms, head, face, hairFront, ears
    this.drawPart(ctx, 'hairBack', parts.hairBack, physics);
    this.drawPart(ctx, 'tail1', parts.tail1, physics);
    this.drawPart(ctx, 'tail2', parts.tail2, physics);
    this.drawPart(ctx, 'tail3', parts.tail3, physics);
    this.drawPart(ctx, 'body', parts.body, physics);
    this.drawPart(ctx, 'armLeft', parts.armLeft, physics);
    this.drawPart(ctx, 'head', parts.head, physics);
    this.drawPart(ctx, 'hairFront', parts.hairFront, physics);
    this.drawPart(ctx, 'hairLeft', parts.hairLeft, physics);
    this.drawPart(ctx, 'hairRight', parts.hairRight, physics);

    // Eyes
    this.drawEye(ctx, 'eyeLeft', parts.eyeLeft, expr, physics);
    this.drawEye(ctx, 'eyeRight', parts.eyeRight, expr, physics);

    // Mouth
    this.drawMouth(ctx, parts.mouth, expr);

    // Blush
    this.drawBlush(ctx, 'blushLeft', parts.blushLeft);
    this.drawBlush(ctx, 'blushRight', parts.blushRight);

    // Ears
    this.drawPart(ctx, 'earLeft', parts.earLeft, physics);
    this.drawPart(ctx, 'earRight', parts.earRight, physics);

    this.drawPart(ctx, 'armRight', parts.armRight, physics);
  }

  drawPart(ctx, name, part, physics) {
    const bone = this.skeleton.getBone(name);
    if (!bone || !part.path) return;

    ctx.save();
    ctx.translate(bone.worldX, bone.worldY);
    ctx.rotate(bone.worldRotation * Math.PI / 180);

    const path = new Path2D(part.path);
    ctx.fillStyle = part.fill;
    ctx.fill(path);
    if (part.stroke) {
      ctx.strokeStyle = part.stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke(path);
    }

    // Inner part (for ears)
    if (part.innerPath) {
      const inner = new Path2D(part.innerPath);
      ctx.fillStyle = part.innerFill;
      ctx.fill(inner);
    }

    ctx.restore();
  }

  drawEye(ctx, name, part, expr, physics) {
    const bone = this.skeleton.getBone(name);
    if (!bone) return;

    const eyeExpr = expr[name] || { scaleY: 1, pupilY: 0 };

    ctx.save();
    ctx.translate(bone.worldX, bone.worldY);

    ctx.scale(1, eyeExpr.scaleY);

    // Eye white
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris
    ctx.fillStyle = part.fill;
    ctx.beginPath();
    ctx.ellipse(0, eyeExpr.pupilY, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#2D1B4E';
    ctx.beginPath();
    ctx.ellipse(0, eyeExpr.pupilY + 1, 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = part.highlight;
    ctx.beginPath();
    ctx.ellipse(-2, -3, 2, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawMouth(ctx, part, expr) {
    const bone = this.skeleton.getBone('mouth');
    if (!bone) return;

    const mouthExpr = expr.mouth || { open: 0 };

    ctx.save();
    ctx.translate(bone.worldX, bone.worldY);

    if (mouthExpr.open > 0.1) {
      ctx.fillStyle = '#FF9999';
      ctx.beginPath();
      ctx.ellipse(0, 2, 4, 3 * mouthExpr.open, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = part.fill;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.quadraticCurveTo(0, 3, 4, 0);
    ctx.stroke();

    ctx.restore();
  }

  drawBlush(ctx, name, part) {
    const bone = this.skeleton.getBone(name);
    if (!bone) return;

    ctx.save();
    ctx.translate(bone.worldX, bone.worldY);
    ctx.fillStyle = part.fill;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  const renderer = new PetRenderer();

  if (window.petAPI) {
    window.petAPI.onStateUpdate((data) => renderer.onStateUpdate(data));
    window.petAPI.getState().then((state) => {
      if (state) renderer.onStateUpdate({ key: 'opacity', value: state.opacity });
      if (state) renderer.onStateUpdate({ key: 'soundEnabled', value: state.soundEnabled });
    });
  }
});
```

- [ ] **Step 4: Commit**

```bash
git add src/pet/character/expression.js src/pet/character/physics.js src/pet/renderer.js
git commit -m "feat: character renderer with expression and physics systems"
```

---

## Task 8: Animation State Machine & Idle Animations

**Files:**
- Create: `src/pet/animation/state-machine.js`
- Create: `src/pet/animation/idle.js`

- [ ] **Step 1: Create Animation State Machine**

```javascript
// src/pet/animation/state-machine.js
class AnimationStateMachine {
  constructor() {
    this.state = 'idle';
    this.previousState = 'idle';
    this.stateTime = 0;
    this.walkingEnabled = true;
    this.idleState = 'active';
    this.velocity = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };
    this.targetPosition = null;
    this.walkSpeed = 1.5;
    this.facing = 1; // 1 = right, -1 = left

    this.idleAnimTime = 0;
    this.idleAnimType = 'stand'; // stand, sway, breathe
  }

  setWalkingEnabled(enabled) {
    this.walkingEnabled = enabled;
    if (!enabled && this.state === 'walking') {
      this.setState('idle');
    }
  }

  setIdleState(state) {
    this.idleState = state;
  }

  setState(newState) {
    this.previousState = this.state;
    this.state = newState;
    this.stateTime = 0;
  }

  trigger(type) {
    switch (type) {
      case 'click':
        this.setState('interact_blink');
        break;
      case 'drag-start':
        this.setState('dragged');
        break;
      case 'drag-end':
        this.setState('idle');
        break;
    }
  }

  getVelocity() {
    return this.velocity;
  }

  update(dt) {
    this.stateTime += dt;

    switch (this.state) {
      case 'idle':
        this.updateIdle(dt);
        break;
      case 'walking':
        this.updateWalking(dt);
        break;
      case 'interact_blink':
        if (this.stateTime > 0.8) this.setState('idle');
        break;
      case 'dragged':
        this.velocity = { x: 0, y: 0 };
        break;
    }
  }

  updateIdle(dt) {
    this.velocity = { x: 0, y: 0 };
    this.idleAnimTime += dt;

    // Idle animation cycling
    const cycle = this.idleAnimTime % 10;
    if (cycle < 4) {
      this.idleAnimType = 'stand';
    } else if (cycle < 7) {
      this.idleAnimType = 'breathe';
    } else {
      this.idleAnimType = 'sway';
    }

    // Start walking if enabled
    if (this.walkingEnabled && this.stateTime > this.getWalkDelay()) {
      this.startWalking();
    }
  }

  getWalkDelay() {
    const delays = { low: 90, medium: 45, high: 20 };
    const base = delays['medium'] || 45;
    return base + Math.random() * base;
  }

  startWalking() {
    this.setState('walking');
    // Random direction
    this.facing = Math.random() > 0.5 ? 1 : -1;
    const distance = 100 + Math.random() * 300;
    this.targetPosition = {
      x: this.position.x + distance * this.facing,
      y: this.position.y
    };
  }

  updateWalking(dt) {
    if (!this.targetPosition) {
      this.setState('idle');
      return;
    }

    const dx = this.targetPosition.x - this.position.x;
    const dir = Math.sign(dx);

    if (Math.abs(dx) < 5) {
      // Reached target
      this.velocity = { x: 0, y: 0 };
      if (Math.random() < 0.7) {
        this.setState('idle');
      } else {
        // Continue walking
        this.startWalking();
      }
      return;
    }

    this.velocity = { x: dir * this.walkSpeed, y: 0 };
    this.position.x += this.velocity.x;
    this.facing = dir;

    // Check screen bounds (assume window is screen-wide)
    const screenWidth = window.innerWidth;
    if (this.position.x < -screenWidth / 2 + 50 || this.position.x > screenWidth / 2 - 50) {
      this.targetPosition = null;
      this.setState('idle');
    }
  }

  getIdleAnim() {
    return this.idleAnimType;
  }

  getFacing() {
    return this.facing;
  }

  getState() {
    return this.state;
  }

  getStateTime() {
    return this.stateTime;
  }
}

module.exports = { AnimationStateMachine };
```

- [ ] **Step 2: Create Idle animations**

```javascript
// src/pet/animation/idle.js
class IdleAnimations {
  constructor() {
    this.time = 0;
    this.blinkTimer = 0;
    this.blinkDuration = 0.15;
    this.isBlinking = false;
    this.nextBlink = 2 + Math.random() * 4;
  }

  update(dt, animType) {
    this.time += dt;
    this.updateBlink(dt);

    const result = {
      bodyOffset: { x: 0, y: 0 },
      headTilt: 0,
      isBlinking: this.isBlinking
    };

    switch (animType) {
      case 'stand':
        result.bodyOffset.y = Math.sin(this.time * 1.5) * 1;
        break;
      case 'breathe':
        result.bodyOffset.y = Math.sin(this.time * 2) * 2;
        result.headTilt = Math.sin(this.time * 1.2) * 1;
        break;
      case 'sway':
        result.bodyOffset.x = Math.sin(this.time * 1.8) * 3;
        result.bodyOffset.y = Math.sin(this.time * 2.5) * 1.5;
        result.headTilt = Math.sin(this.time * 1.5) * 2;
        break;
    }

    return result;
  }

  updateBlink(dt) {
    if (this.isBlinking) {
      this.blinkTimer -= dt;
      if (this.blinkTimer <= 0) {
        this.isBlinking = false;
        this.nextBlink = 2 + Math.random() * 4;
      }
    } else {
      this.nextBlink -= dt;
      if (this.nextBlink <= 0) {
        this.isBlinking = true;
        this.blinkTimer = this.blinkDuration;
      }
    }
  }
}

module.exports = { IdleAnimations };
```

- [ ] **Step 3: Commit**

```bash
git add src/pet/animation/
git commit -m "feat: animation state machine and idle animations"
```

---

## Task 9: Walking Animation

**Files:**
- Create: `src/pet/animation/walk.js`

- [ ] **Step 1: Create Walk animation**

```javascript
// src/pet/animation/walk.js
class WalkAnimation {
  constructor() {
    this.time = 0;
    this.stepPhase = 0;
  }

  update(dt, velocity) {
    this.time += dt;

    const isWalking = Math.abs(velocity.x) > 0.1;

    if (isWalking) {
      this.stepPhase += dt * 8; // Step frequency
    }

    const result = {
      bodyBounce: 0,
      legPhase: 0,
      armSwing: 0,
      headBob: 0,
      isWalking
    };

    if (isWalking) {
      result.bodyBounce = Math.abs(Math.sin(this.stepPhase)) * 3;
      result.legPhase = Math.sin(this.stepPhase);
      result.armSwing = Math.sin(this.stepPhase) * 15;
      result.headBob = Math.sin(this.stepPhase * 2) * 1.5;
    }

    return result;
  }

  reset() {
    this.time = 0;
    this.stepPhase = 0;
  }
}

module.exports = { WalkAnimation };
```

- [ ] **Step 2: Commit**

```bash
git add src/pet/animation/walk.js
git commit -m "feat: walking animation"
```

---

## Task 10: Interaction — Drag & Click

**Files:**
- Create: `src/pet/interaction/drag.js`
- Create: `src/pet/interaction/click.js`

- [ ] **Step 1: Create Drag interaction**

```javascript
// src/pet/interaction/drag.js
class DragInteraction {
  constructor(canvas, renderer) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.dragThreshold = 5;

    this.setupListeners();
  }

  setupListeners() {
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      this.startX = e.screenX;
      this.startY = e.screenY;
      this.isDragging = false;

      if (window.petAPI) {
        window.petAPI.sendAction('drag-start');
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (e.buttons !== 1) return;

      const dx = e.screenX - this.startX;
      const dy = e.screenY - this.startY;

      if (!this.isDragging && Math.sqrt(dx * dx + dy * dy) > this.dragThreshold) {
        this.isDragging = true;
        this.renderer.triggerInteraction('drag-start');
      }

      if (this.isDragging && window.petAPI) {
        window.petAPI.sendAction('drag-move', {
          x: e.screenX - this.renderer.width / 2,
          y: e.screenY - this.renderer.height / 2
        });
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.renderer.triggerInteraction('drag-end');
        if (window.petAPI) {
          window.petAPI.sendAction('drag-end');
        }
      }
    });
  }
}

module.exports = { DragInteraction };
```

- [ ] **Step 2: Create Click interaction**

```javascript
// src/pet/interaction/click.js
class ClickInteraction {
  constructor(canvas, renderer) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.dragInteraction = null;

    this.setupListeners();
  }

  setDragInteraction(drag) {
    this.dragInteraction = drag;
  }

  setupListeners() {
    this.canvas.addEventListener('click', (e) => {
      // Only trigger click if not dragging
      if (this.dragInteraction && this.dragInteraction.isDragging) return;

      this.renderer.triggerInteraction('click');
      this.renderer.expression.setExpression('happy', 0.15);

      // Reset expression after a delay
      setTimeout(() => {
        this.renderer.expression.setExpression('default', 0.08);
      }, 1500);
    });

    this.canvas.addEventListener('mouseenter', () => {
      this.renderer.expression.setExpression('curious', 0.1);
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.renderer.expression.setExpression('default', 0.08);
    });
  }
}

module.exports = { ClickInteraction };
```

- [ ] **Step 3: Commit**

```bash
git add src/pet/interaction/drag.js src/pet/interaction/click.js
git commit -m "feat: drag and click interactions"
```

---

## Task 11: Mouse Follow System

**Files:**
- Create: `src/pet/interaction/follow.js`

- [ ] **Step 1: Create Follow system**

```javascript
// src/pet/interaction/follow.js
class FollowSystem {
  constructor() {
    this.enabled = true;
    this.mouseX = 0;
    this.mouseY = 0;
    this.followRadius = 200;
    this.eyeMaxAngle = 15;
    this.headMaxAngle = 8;
    this.lerpSpeed = 0.08;

    this.currentEyeAngle = 0;
    this.currentHeadAngle = 0;

    this.setupListeners();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.currentEyeAngle = 0;
      this.currentHeadAngle = 0;
    }
  }

  setupListeners() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  update(skeleton, dt) {
    if (!this.enabled) return;

    const head = skeleton.getBone('head');
    if (!head) return;

    // Calculate angle from character to mouse
    const dx = this.mouseX - (window.innerWidth / 2);
    const dy = this.mouseY - (window.innerHeight / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.followRadius) {
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const factor = 1 - distance / this.followRadius;

      const targetEyeAngle = angle * factor * (this.eyeMaxAngle / 180);
      const targetHeadAngle = angle * factor * (this.headMaxAngle / 180);

      this.currentEyeAngle += (targetEyeAngle - this.currentEyeAngle) * this.lerpSpeed;
      this.currentHeadAngle += (targetHeadAngle - this.currentHeadAngle) * this.lerpSpeed;
    } else {
      this.currentEyeAngle += (0 - this.currentEyeAngle) * this.lerpSpeed * 0.5;
      this.currentHeadAngle += (0 - this.currentHeadAngle) * this.lerpSpeed * 0.5;
    }

    // Apply to bones
    const eyeLeft = skeleton.getBone('eyeLeft');
    const eyeRight = skeleton.getBone('eyeRight');
    if (eyeLeft) eyeLeft.rotation = this.currentEyeAngle;
    if (eyeRight) eyeRight.rotation = this.currentEyeAngle;
    head.rotation = this.currentHeadAngle;
  }
}

module.exports = { FollowSystem };
```

- [ ] **Step 2: Commit**

```bash
git add src/pet/interaction/follow.js
git commit -m "feat: mouse follow and eye tracking system"
```

---

## Task 12: Context Menu (Frosted Glass)

**Files:**
- Create: `src/pet/interaction/context-menu.js`

- [ ] **Step 1: Create Context Menu**

```javascript
// src/pet/interaction/context-menu.js
class ContextMenu {
  constructor() {
    this.visible = false;
    this.menuElement = null;
    this.renderer = null;
  }

  init(canvas, renderer) {
    this.renderer = renderer;
    this.createMenuElement();

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.show(e.clientX, e.clientY);
    });

    document.addEventListener('click', (e) => {
      if (this.visible && !this.menuElement.contains(e.target)) {
        this.hide();
      }
    });
  }

  createMenuElement() {
    this.menuElement = document.createElement('div');
    this.menuElement.id = 'context-menu';
    this.menuElement.style.cssText = `
      position: fixed;
      display: none;
      background: rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 14px;
      padding: 8px 0;
      min-width: 190px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      z-index: 10000;
      font-family: 'Microsoft YaHei', sans-serif;
      font-size: 13px;
      color: #333;
    `;

    const items = [
      { icon: '👗', label: '更换角色', action: 'change-character' },
      { icon: '🎀', label: '装扮设置', action: 'costume' },
      { type: 'separator' },
      { icon: '🔊', label: '音效开关', action: 'toggle-sound', toggle: true },
      { icon: '🖱️', label: '鼠标跟随', action: 'toggle-follow', toggle: true },
      { icon: '✨', label: '随机动作', action: 'toggle-events', toggle: true },
      { icon: '🚶', label: '桌面走动', action: 'toggle-walking', toggle: true },
      { type: 'separator' },
      { icon: '🚀', label: '开机自启', action: 'toggle-autostart', toggle: true },
      { type: 'separator' },
      { icon: 'ℹ️', label: '关于我们', action: 'about' },
      { icon: '🚪', label: '退出软件', action: 'quit', color: '#e74c3c' }
    ];

    items.forEach(item => {
      if (item.type === 'separator') {
        const sep = document.createElement('div');
        sep.style.cssText = 'height: 1px; background: rgba(255,255,255,0.4); margin: 4px 12px;';
        this.menuElement.appendChild(sep);
        return;
      }

      const menuItem = document.createElement('div');
      menuItem.style.cssText = `
        padding: 9px 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        border-radius: 8px;
        margin: 0 6px;
        color: ${item.color || '#333'};
        transition: background 0.15s;
      `;
      menuItem.innerHTML = `
        <span>${item.icon}</span>
        <span>${item.label}</span>
        ${item.toggle ? '<span style="margin-left:auto;opacity:0.5;font-size:12px;">ON</span>' : ''}
      `;

      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.background = 'rgba(255,255,255,0.25)';
      });
      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.background = 'transparent';
      });
      menuItem.addEventListener('click', () => {
        this.handleAction(item.action);
        this.hide();
      });

      this.menuElement.appendChild(menuItem);
    });

    document.body.appendChild(this.menuElement);
  }

  show(x, y) {
    this.menuElement.style.left = `${x}px`;
    this.menuElement.style.top = `${y}px`;
    this.menuElement.style.display = 'block';
    this.visible = true;
  }

  hide() {
    this.menuElement.style.display = 'none';
    this.visible = false;
  }

  handleAction(action) {
    if (!window.petAPI) return;

    switch (action) {
      case 'change-character':
      case 'costume':
      case 'about':
        window.petAPI.openConfig();
        break;
      case 'toggle-sound':
        window.petAPI.sendAction('toggle', { key: 'soundEnabled' });
        break;
      case 'toggle-follow':
        window.petAPI.sendAction('toggle', { key: 'followMouse' });
        break;
      case 'toggle-events':
        window.petAPI.sendAction('toggle', { key: 'randomEvents' });
        break;
      case 'toggle-walking':
        window.petAPI.sendAction('toggle', { key: 'walkingEnabled' });
        break;
      case 'toggle-autostart':
        window.petAPI.sendAction('toggle', { key: 'autoStart' });
        break;
      case 'quit':
        window.petAPI.quitApp();
        break;
    }
  }
}

module.exports = { ContextMenu };
```

- [ ] **Step 2: Commit**

```bash
git add src/pet/interaction/context-menu.js
git commit -m "feat: frosted glass context menu"
```

---

## Task 13: Random Events System

**Files:**
- Create: `src/pet/animation/events.js`

- [ ] **Step 1: Create Random Event Scheduler**

```javascript
// src/pet/animation/events.js
class RandomEventScheduler {
  constructor() {
    this.enabled = true;
    this.cooldown = 10;
    this.timeSinceLastEvent = 0;
    this.nextEventDelay = 30 + Math.random() * 90;

    this.events = [
      { name: 'yawn', weight: 20, condition: (idle) => idle > 30, expression: 'sleepy' },
      { name: 'doze', weight: 15, condition: (idle) => idle > 60, expression: 'sleeping' },
      { name: 'wave', weight: 25, condition: () => true, expression: 'happy' },
      { name: 'look-around', weight: 20, condition: () => true, expression: 'curious' },
      { name: 'jump', weight: 15, condition: () => true, expression: 'happy' },
      { name: 'stretch', weight: 10, condition: (idle) => idle > 45, expression: 'sleepy' },
      { name: 'play-tail', weight: 10, condition: () => true, expression: 'happy' }
    ];
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  update(dt, renderer) {
    if (!this.enabled) return;

    this.timeSinceLastEvent += dt;

    if (this.timeSinceLastEvent < this.nextEventDelay) return;
    if (this.timeSinceLastEvent < this.cooldown) return;

    // Pick a random event based on weights
    const idleTime = renderer.animState.stateTime;
    const eligible = this.events.filter(e => e.condition(idleTime));

    if (eligible.length === 0) return;

    const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;

    for (const event of eligible) {
      random -= event.weight;
      if (random <= 0) {
        this.triggerEvent(event, renderer);
        break;
      }
    }
  }

  triggerEvent(event, renderer) {
    this.timeSinceLastEvent = 0;
    this.nextEventDelay = 30 + Math.random() * 90;

    renderer.expression.setExpression(event.expression, 0.1);
    renderer.animState.trigger(event.name);
    renderer.sound.play(event.name);

    // Reset expression after animation
    setTimeout(() => {
      renderer.expression.setExpression('default', 0.08);
    }, 3000);
  }
}

module.exports = { RandomEventScheduler };
```

- [ ] **Step 2: Commit**

```bash
git add src/pet/animation/events.js
git commit -m "feat: random event scheduler"
```

---

## Task 14: Sound Manager

**Files:**
- Create: `src/pet/audio/sound-manager.js`

- [ ] **Step 1: Create Sound Manager**

```javascript
// src/pet/audio/sound-manager.js
class SoundManager {
  constructor() {
    this.enabled = true;
    this.volume = 0.5;
    this.sounds = {};
    this.audioContext = null;

    this.initAudioContext();
  }

  initAudioContext() {
    // Lazy init on first user interaction
    const init = () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      document.removeEventListener('click', init);
    };
    document.addEventListener('click', init);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  play(eventType) {
    if (!this.enabled || !this.audioContext) return;

    // Generate procedural sound based on event type
    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const sounds = {
      click: { freq: 800, duration: 0.1, type: 'sine' },
      'drag-start': { freq: 400, duration: 0.05, type: 'sine' },
      'drag-end': { freq: 600, duration: 0.08, type: 'sine' },
      yawn: { freq: 300, duration: 0.5, type: 'sine' },
      wave: { freq: 700, duration: 0.15, type: 'sine' },
      jump: { freq: 500, duration: 0.2, type: 'sine' },
      'look-around': { freq: 600, duration: 0.1, type: 'sine' },
      stretch: { freq: 350, duration: 0.3, type: 'sine' },
      'play-tail': { freq: 650, duration: 0.12, type: 'sine' },
      doze: { freq: 250, duration: 0.4, type: 'sine' }
    };

    const sound = sounds[eventType] || sounds.click;

    oscillator.type = sound.type;
    oscillator.frequency.setValueAtTime(sound.freq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      sound.freq * 1.5,
      ctx.currentTime + sound.duration * 0.3
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      sound.freq * 0.8,
      ctx.currentTime + sound.duration
    );

    gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + sound.duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + sound.duration);
  }
}

module.exports = { SoundManager };
```

- [ ] **Step 2: Commit**

```bash
git add src/pet/audio/sound-manager.js
git commit -m "feat: procedural sound manager"
```

---

## Task 15: Config Window

**Files:**
- Create: `src/config/index.html`
- Create: `src/config/styles.css`
- Create: `src/config/renderer.js`
- Create: `src/config/preload.js`

- [ ] **Step 1: Create Config preload**

```javascript
// src/config/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('configAPI', {
  getState: () => ipcRenderer.invoke('get-state'),
  updateSetting: (key, value) => ipcRenderer.send('update-setting', { key, value }),
  close: () => ipcRenderer.send('close-config'),
  onStateUpdate: (callback) => ipcRenderer.on('state-update', (_, data) => callback(data))
});
```

- [ ] **Step 2: Create Config HTML**

```html
<!-- src/config/index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'">
  <title>设置</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="window">
    <div class="titlebar">
      <span>✨ 设置</span>
      <button class="close-btn" id="close-btn">✕</button>
    </div>
    <div class="tabs">
      <button class="tab active" data-tab="character">角色</button>
      <button class="tab" data-tab="costume">装扮</button>
      <button class="tab" data-tab="general">通用</button>
    </div>
    <div class="tab-content" id="tab-character">
      <div class="section">
        <label>选择角色</label>
        <div class="character-grid">
          <div class="character-card selected" data-char="baiyu">🐱 白玉</div>
          <div class="character-card" data-char="rabbit">🐰 小兔</div>
          <div class="character-card" data-char="fox">🦊 小狐</div>
        </div>
      </div>
      <div class="section">
        <label>尺寸调节</label>
        <div class="slider-row">
          <span>50%</span>
          <input type="range" id="petSize" min="100" max="400" value="200">
          <span>200%</span>
        </div>
      </div>
      <div class="section">
        <label>透明度</label>
        <div class="slider-row">
          <span>20%</span>
          <input type="range" id="opacity" min="20" max="100" value="100">
          <span>100%</span>
        </div>
      </div>
    </div>
    <div class="tab-content hidden" id="tab-costume">
      <div class="section">
        <label>配饰</label>
        <div class="costume-grid">
          <div class="costume-item selected">🎀 蝴蝶结</div>
          <div class="costume-item">🌸 花朵</div>
          <div class="costume-item">⭐ 星星</div>
        </div>
      </div>
    </div>
    <div class="tab-content hidden" id="tab-general">
      <div class="section">
        <div class="toggle-row">
          <span>🔊 音效</span>
          <input type="checkbox" id="soundEnabled" checked>
        </div>
      </div>
      <div class="section">
        <label>音量</label>
        <div class="slider-row">
          <span>0%</span>
          <input type="range" id="soundVolume" min="0" max="100" value="50">
          <span>100%</span>
        </div>
      </div>
      <div class="section">
        <div class="toggle-row">
          <span>🖱️ 鼠标跟随</span>
          <input type="checkbox" id="followMouse" checked>
        </div>
      </div>
      <div class="section">
        <div class="toggle-row">
          <span>✨ 随机动作</span>
          <input type="checkbox" id="randomEvents" checked>
        </div>
      </div>
      <div class="section">
        <div class="toggle-row">
          <span>🚶 桌面走动</span>
          <input type="checkbox" id="walkingEnabled" checked>
        </div>
      </div>
      <div class="section">
        <div class="toggle-row">
          <span>🚀 开机自启</span>
          <input type="checkbox" id="autoStart">
        </div>
      </div>
    </div>
  </div>
  <script src="renderer.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create Config CSS**

```css
/* src/config/styles.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', sans-serif;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.window {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  width: 380px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.titlebar {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  font-weight: 600;
  color: #333;
  -webkit-app-region: drag;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.close-btn:hover {
  color: #333;
}

.tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.tab {
  flex: 1;
  padding: 10px;
  text-align: center;
  font-size: 13px;
  color: #999;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.tab.active {
  color: #e91e63;
  border-bottom-color: #e91e63;
}

.tab-content {
  padding: 16px 20px;
}

.tab-content.hidden {
  display: none;
}

.section {
  margin-bottom: 16px;
}

.section label {
  display: block;
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}

.character-grid {
  display: flex;
  gap: 12px;
}

.character-card {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
}

.character-card.selected {
  border-color: #e91e63;
  background: rgba(255, 182, 193, 0.3);
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #666;
}

.slider-row input[type="range"] {
  flex: 1;
  accent-color: #e91e63;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.toggle-row input[type="checkbox"] {
  accent-color: #e91e63;
  width: 18px;
  height: 18px;
}

.costume-grid {
  display: flex;
  gap: 10px;
}

.costume-item {
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  border: 2px solid transparent;
  cursor: pointer;
  font-size: 13px;
}

.costume-item.selected {
  border-color: #e91e63;
  background: rgba(255, 182, 193, 0.3);
}
```

- [ ] **Step 4: Create Config renderer**

```javascript
// src/config/renderer.js
document.addEventListener('DOMContentLoaded', async () => {
  // Tab switching
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
    });
  });

  // Close button
  document.getElementById('close-btn').addEventListener('click', () => {
    if (window.configAPI) window.configAPI.close();
  });

  // Load current state
  if (window.configAPI) {
    const state = await window.configAPI.getState();

    // Set initial values
    if (state.petSize) document.getElementById('petSize').value = state.petSize;
    if (state.opacity) document.getElementById('opacity').value = state.opacity * 100;
    if (state.soundEnabled !== undefined) document.getElementById('soundEnabled').checked = state.soundEnabled;
    if (state.soundVolume) document.getElementById('soundVolume').value = state.soundVolume * 100;
    if (state.followMouse !== undefined) document.getElementById('followMouse').checked = state.followMouse;
    if (state.randomEvents !== undefined) document.getElementById('randomEvents').checked = state.randomEvents;
    if (state.walkingEnabled !== undefined) document.getElementById('walkingEnabled').checked = state.walkingEnabled;
    if (state.autoStart !== undefined) document.getElementById('autoStart').checked = state.autoStart;

    // Character selection
    document.querySelectorAll('.character-card').forEach(card => {
      if (card.dataset.char === state.currentCharacter) {
        card.classList.add('selected');
      }
      card.addEventListener('click', () => {
        document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        window.configAPI.updateSetting('currentCharacter', card.dataset.char);
      });
    });

    // Costume selection
    document.querySelectorAll('.costume-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.costume-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
      });
    });
  }

  // Slider handlers
  document.getElementById('petSize').addEventListener('input', (e) => {
    if (window.configAPI) window.configAPI.updateSetting('petSize', parseInt(e.target.value));
  });

  document.getElementById('opacity').addEventListener('input', (e) => {
    if (window.configAPI) window.configAPI.updateSetting('opacity', parseInt(e.target.value) / 100);
  });

  document.getElementById('soundVolume').addEventListener('input', (e) => {
    if (window.configAPI) window.configAPI.updateSetting('soundVolume', parseInt(e.target.value) / 100);
  });

  // Toggle handlers
  ['soundEnabled', 'followMouse', 'randomEvents', 'walkingEnabled', 'autoStart'].forEach(key => {
    document.getElementById(key).addEventListener('change', (e) => {
      if (window.configAPI) window.configAPI.updateSetting(key, e.target.checked);
    });
  });
});
```

- [ ] **Step 5: Commit**

```bash
git add src/config/
git commit -m "feat: config window with settings UI"
```

---

## Task 16: Final Integration & Polish

**Files:**
- Modify: `src/pet/index.html`
- Modify: `src/pet/renderer.js`
- Modify: `src/main/index.js`

- [ ] **Step 1: Update pet index.html with canvas and menu container**

```html
<!-- src/pet/index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'">
  <title>Desktop Pet</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <canvas id="pet-canvas"></canvas>
  <script src="renderer.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify all features work**

Run `npm start` and verify:
- [ ] Transparent window with character visible
- [ ] Click-through on transparent areas
- [ ] Character renders correctly (white hair, cat ears, blush)
- [ ] Idle animations (stand, breathe, sway)
- [ ] Mouse follow (eyes and head track mouse)
- [ ] Click interaction (happy expression + sound)
- [ ] Drag to move
- [ ] Right-click context menu (frosted glass)
- [ ] Context menu toggle switches work
- [ ] Desktop walking (character moves across screen)
- [ ] Random events trigger periodically
- [ ] Sound effects play on interactions
- [ ] Config window opens from context menu
- [ ] Settings changes apply in real-time

- [ ] **Step 3: Commit final state**

```bash
git add .
git commit -m "feat: complete desktop pet with all core features"
```

---

## Spec Coverage Checklist

| Spec Requirement | Task |
|-----------------|------|
| 透明置顶常驻 | Task 2 |
| 点击穿透 | Task 2 |
| 拖拽移动 | Task 10 |
| 点击交互 | Task 10 |
| 右键菜单 | Task 12 |
| 鼠标跟随/注视 | Task 11 |
| 待机动画 | Task 8 |
| 随机事件 | Task 13 |
| 状态联动（闲置/活跃） | Task 5 + Task 13 |
| 桌面走动 | Task 9 |
| 装扮切换 | Task 15 |
| 音效系统 | Task 14 |
| 开机自启 | Task 5 + Task 15 |
| 配置窗口 | Task 15 |
| 白玉角色渲染 | Task 6 + Task 7 |
| 表情系统 | Task 7 |
| 物理模拟（头发/尾巴/耳朵） | Task 7 |
| 性能优化（帧率/内存） | Task 7 |
| 系统托盘 | Task 5 |
