const { Tray, Menu, nativeImage, powerMonitor } = require('electron');

class SystemIntegration {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.tray = null;
    this.idleCheckInterval = null;
    this.lastInputTime = Date.now();
    this.idleState = 'active';
  }

  createTray() {
    // Create a programmatic 16x16 pink circle icon
    const icon = this.createTrayIcon();
    this.tray = new Tray(icon);
    this.tray.setToolTip('白玉 — 桌面宠物');

    const contextMenu = Menu.buildFromTemplate([
      { label: '显示宠物', click: () => {} },
      { type: 'separator' },
      { label: '退出', click: () => require('electron').app.quit() }
    ]);

    this.tray.setContextMenu(contextMenu);
    this.startIdleDetection();
  }

  createTrayIcon() {
    const size = 16;
    const canvas = Buffer.alloc(size * size * 4);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const dx = x - size / 2;
        const dy = y - size / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < size / 2 - 1) {
          canvas[idx] = 255;     // R
          canvas[idx + 1] = 182; // G
          canvas[idx + 2] = 193; // B
          canvas[idx + 3] = 255; // A
        } else {
          canvas[idx + 3] = 0;
        }
      }
    }

    return nativeImage.createFromBuffer(canvas, { width: size, height: size });
  }

  startIdleDetection() {
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
