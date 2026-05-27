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
