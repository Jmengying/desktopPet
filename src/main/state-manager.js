class StateManager {
  constructor() {
    this.state = {
      mood: 'happy',
      position: { x: 100, y: 100 },
    };
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
  }
}

module.exports = { StateManager };
