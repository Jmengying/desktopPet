const { ipcMain } = require('electron');

function setupIPC(windowManager, stateManager, systemIntegration) {
  ipcMain.handle('get-state', () => {
    return stateManager.getState();
  });
}

module.exports = { setupIPC };
