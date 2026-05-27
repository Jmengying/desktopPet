// src/pet/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petAPI', {
  onStateUpdate: (callback) => ipcRenderer.on('state-update', (_, data) => callback(data)),
  sendAction: (action, data) => ipcRenderer.send('pet-action', { action, data }),
  getState: () => ipcRenderer.invoke('get-state'),
  openConfig: () => ipcRenderer.send('open-config'),
  quitApp: () => ipcRenderer.send('quit-app')
});
