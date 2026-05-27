const Store = require('electron-store');

const schema = {
  petSize: { type: 'number', default: 200, minimum: 100, maximum: 400 },
  opacity: { type: 'number', default: 1, minimum: 0.2, maximum: 1 },
  soundEnabled: { type: 'boolean', default: true },
  soundVolume: { type: 'number', default: 0.5, minimum: 0, maximum: 1 },
  followMouse: { type: 'boolean', default: true },
  randomEvents: { type: 'boolean', default: true },
  walkingEnabled: { type: 'boolean', default: true },
  walkFrequency: { type: 'string', default: 'medium', enum: ['low', 'medium', 'high'] },
  autoStart: { type: 'boolean', default: false },
  currentCharacter: { type: 'string', default: 'baiyu' },
  petX: { type: 'number', default: -1 },
  petY: { type: 'number', default: -1 }
};

class StateManager {
  constructor() {
    this.store = new Store({ schema });
    this.listeners = new Set();
  }

  get(key, defaultValue) {
    return this.store.get(key, defaultValue);
  }

  set(key, value) {
    this.store.set(key, value);
    this.notify(key, value);
  }

  getAll() {
    return this.store.store;
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(key, value) {
    for (const cb of this.listeners) {
      cb(key, value);
    }
  }
}

module.exports = { StateManager };
