const { ipcMain, app, screen } = require('electron');

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
      case 'mouse-enter':
        windowManager.setIgnoreMouseEvents(false);
        break;
      case 'mouse-leave':
        windowManager.setIgnoreMouseEvents(true);
        break;
      case 'state-changed':
        stateManager.set(data.key, data.value);
        break;
      case 'walk-move':
        // Convert relative position to screen position
        const { width } = screen.getPrimaryDisplay().workAreaSize;
        const petBounds = windowManager.getPetBounds();
        if (petBounds) {
          const screenCenterX = width / 2;
          const newX = screenCenterX + data.x - petBounds.width / 2;
          windowManager.setPetPosition(newX, petBounds.y);
        }
        break;
      case 'get-screen-size':
        const { width: sw } = screen.getPrimaryDisplay().workAreaSize;
        const petWin = windowManager.getPetWindow();
        if (petWin) petWin.webContents.send('state-update', { key: 'screenWidth', value: sw });
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

  // State change broadcasting to both windows
  stateManager.onChange((key, value) => {
    // Auto-start setting
    if (key === 'autoStart') {
      systemIntegration.setAutoStart(value);
    }

    // Broadcast to pet window
    const petWin = windowManager.getPetWindow();
    if (petWin && !petWin.isDestroyed()) {
      petWin.webContents.send('state-update', { key, value });
    }

    // Broadcast to config window
    const configWin = windowManager.configWindow;
    if (configWin && !configWin.isDestroyed()) {
      configWin.webContents.send('state-update', { key, value });
    }
  });
}

module.exports = { setupIPC };
