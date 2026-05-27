class StateManager {
  constructor() {
    this.state = {
      mood: 'happy',
      position: { x: 100, y: 100 },
    };
  }

  get(key, defaultValue) {
    return this.state[key] !== undefined ? this.state[key] : defaultValue;
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
  }
}

module.exports = { StateManager };
