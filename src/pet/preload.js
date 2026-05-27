// src/pet/preload.js
const { ipcRenderer } = require('electron');

window.petAPI = {
  onStateUpdate: (callback) => ipcRenderer.on('state-update', (_, data) => callback(data)),
  sendAction: (action, data) => ipcRenderer.send('pet-action', { action, data }),
  getState: () => ipcRenderer.invoke('get-state'),
  openConfig: () => ipcRenderer.send('open-config'),
  quitApp: () => ipcRenderer.send('quit-app')
};
