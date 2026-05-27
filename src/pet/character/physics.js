class Spring {
  constructor(stiffness = 0.15, damping = 0.7) {
    this.stiffness = stiffness;
    this.damping = damping;
    this.value = 0;
    this.velocity = 0;
    this.target = 0;
  }

  update() {
    const force = (this.target - this.value) * this.stiffness;
    this.velocity += force;
    this.velocity *= this.damping;
    this.value += this.velocity;
    return this.value;
  }

  setTarget(target) {
    this.target = target;
  }
}

class PhysicsSystem {
  constructor() {
    this.springs = {
      earLeft: new Spring(0.2, 0.6),
      earRight: new Spring(0.2, 0.6),
      tail1: new Spring(0.1, 0.8),
      tail2: new Spring(0.08, 0.8),
      tail3: new Spring(0.06, 0.8),
      hairLeft: new Spring(0.1, 0.75),
      hairRight: new Spring(0.1, 0.75),
      body: new Spring(0.12, 0.7)
    };
    this.time = 0;
  }

  update(dt, characterVelocity = { x: 0, y: 0 }) {
    this.time += dt;
    const earTwitch = Math.sin(this.time * 3) * 2;
    this.springs.earLeft.setTarget(earTwitch + characterVelocity.x * 0.5);
    this.springs.earRight.setTarget(-earTwitch - characterVelocity.x * 0.5);
    const tailSway = Math.sin(this.time * 2) * 8;
    this.springs.tail1.setTarget(tailSway + characterVelocity.x * 2);
    this.springs.tail2.setTarget(tailSway * 0.7);
    this.springs.tail3.setTarget(tailSway * 0.4);
    this.springs.hairLeft.setTarget(characterVelocity.x * 1.5 + Math.sin(this.time * 1.5) * 1);
    this.springs.hairRight.setTarget(-characterVelocity.x * 1.5 - Math.sin(this.time * 1.5) * 1);
    this.springs.body.setTarget(Math.abs(characterVelocity.x) > 0.5 ? Math.sin(this.time * 8) * 2 : 0);

    const result = {};
    for (const [key, spring] of Object.entries(this.springs)) {
      result[key] = spring.update();
    }
    return result;
  }
}

module.exports = { PhysicsSystem, Spring };
