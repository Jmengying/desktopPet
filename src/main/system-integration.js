const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');

class SystemIntegration {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.tray = null;
  }

  createTray() {
    // Create a simple 16x16 icon for the tray
    const icon = nativeImage.createEmpty();
    this.tray = new Tray(icon);
    this.tray.setToolTip('Desktop Pet - 白玉');

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show Pet', click: () => {} },
      { type: 'separator' },
      { label: 'Quit', role: 'quit' },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  cleanup() {
    if (this.tray) {
      this.tray.destroy();
    }
  }
}

module.exports = { SystemIntegration };
