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
  e.preventDefault();
});

app.on('before-quit', () => {
  systemIntegration.cleanup();
});
