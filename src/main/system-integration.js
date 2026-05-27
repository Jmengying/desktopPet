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
