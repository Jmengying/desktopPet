const { ipcRenderer } = require('electron');

window.configAPI = {
  getState: () => ipcRenderer.invoke('get-state'),
  updateSetting: (key, value) => ipcRenderer.send('update-setting', { key, value }),
  close: () => ipcRenderer.send('close-config'),
  onStateUpdate: (callback) => ipcRenderer.on('state-update', (_, data) => callback(data))
};
