const { BrowserWindow } = require('electron');
const path = require('path');

class WindowManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.petWindow = null;
  }

  createPetWindow() {
    this.petWindow = new BrowserWindow({
      width: 300,
      height: 300,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    this.petWindow.loadFile(path.join(__dirname, '..', 'pet', 'index.html'));
    this.petWindow.setIgnoreMouseEvents(false);

    return this.petWindow;
  }

  getPetWindow() {
    return this.petWindow;
  }
}

module.exports = { WindowManager };
