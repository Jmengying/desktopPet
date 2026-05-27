const { createBaiyuSkeleton, drawCharacter, EXPRESSIONS } = require('./character/baiyu');
const { ExpressionSystem } = require('./character/expression');
const { PhysicsSystem } = require('./character/physics');

class PetRenderer {
  constructor() {
    this.canvas = document.getElementById('pet-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.skeleton = createBaiyuSkeleton();
    this.expression = new ExpressionSystem();
    this.physics = new PhysicsSystem();

    this.width = 250;
    this.height = 300;
    this.scale = 1;
    this.opacity = 1;
    this.lastTime = performance.now();
    this.velocity = { x: 0, y: 0 };
    this.facing = 1;
    this.stateTime = 0;
    this.idleAnimTime = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.nextBlink = 2 + Math.random() * 4;

    // Walking state
    this.walkingEnabled = true;
    this.walkTarget = null;
    this.position = { x: 0, y: 0 };
    this.walkSpeed = 90;
    this.nextWalkDelay = 30 + Math.random() * 60;
    this.screenWidth = 1920;

    // Mouse follow
    this.followEnabled = true;
    this.mouseX = 0;
    this.mouseY = 0;
    this.followRadius = 300;
    this.eyeMaxAngle = 15;
    this.headMaxAngle = 10;
    this.currentEyeAngle = 0;
    this.currentHeadAngle = 0;
    this.targetHeadAngle = 0;
    this.targetEyeScale = { left: 1, right: 1 };
    this.targetPupilY = 0;

    // Random events
    this.randomEventsEnabled = true;
    this.eventTimer = 0;
    this.nextEventDelay = 30 + Math.random() * 90;
    this.eventCooldown = 0;

    // Sound
    this.soundEnabled = true;
    this.soundVolume = 0.5;
    this.audioContext = null;

    // Drag state
    this.isDragging = false;

    // Current expression state (for smooth transitions)
    this.currentEyeScale = { left: 1, right: 1 };
    this.currentPupilY = 0;
    this.currentMouthOpen = 0;

    this.setupCanvas();
    this.setupInteractions();
    this.requestScreenSize();
    this.startRenderLoop();
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  requestScreenSize() {
    if (window.petAPI) {
      window.petAPI.sendAction('get-screen-size');
      window.petAPI.onStateUpdate((data) => {
        if (data.key === 'screenWidth') this.screenWidth = data.value;
      });
    }
  }

  setupInteractions() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.screenX;
      this.mouseY = e.screenY;
    });

    this.canvas.addEventListener('mouseenter', () => {
      this.triggerExpression('curious');
      if (window.petAPI) window.petAPI.sendAction('mouse-enter');
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.triggerExpression('default');
      if (window.petAPI) window.petAPI.sendAction('mouse-leave');
    });

    this.canvas.addEventListener('click', () => {
      if (this.isDragging) return;
      this.triggerInteraction('click');
      this.triggerExpression('happy');
      this.playSound('click');
      setTimeout(() => this.triggerExpression('default'), 1500);
    });

    let dragStartX, dragStartY;
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      dragStartX = e.screenX;
      dragStartY = e.screenY;
      this.isDragging = false;
      if (window.petAPI) window.petAPI.sendAction('drag-start');
    });

    document.addEventListener('mousemove', (e) => {
      if (e.buttons !== 1) return;
      const dx = e.screenX - dragStartX;
      const dy = e.screenY - dragStartY;
      if (!this.isDragging && Math.sqrt(dx*dx + dy*dy) > 5) {
        this.isDragging = true;
        this.triggerExpression('surprised');
      }
      if (this.isDragging && window.petAPI) {
        window.petAPI.sendAction('drag-move', {
          x: e.screenX - this.width / 2,
          y: e.screenY - this.height / 2
        });
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.triggerExpression('default');
        if (window.petAPI) window.petAPI.sendAction('drag-end');
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e.clientX, e.clientY);
    });
  }

  triggerExpression(name) {
    const expr = EXPRESSIONS[name] || EXPRESSIONS.default;
    this.targetEyeScale = { ...expr.eyeScale };
    this.targetPupilY = expr.eyePupilY;
    this.currentMouthOpen = expr.mouthOpen;
  }

  showContextMenu(x, y) {
    let menu = document.getElementById('context-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'context-menu';
      document.body.appendChild(menu);
    }

    const items = [
      { icon: '🔊', label: '音效开关', action: 'toggle-sound', state: () => this.soundEnabled },
      { icon: '🖱️', label: '鼠标跟随', action: 'toggle-follow', state: () => this.followEnabled },
      { icon: '✨', label: '随机动作', action: 'toggle-events', state: () => this.randomEventsEnabled },
      { icon: '🚶', label: '桌面走动', action: 'toggle-walking', state: () => this.walkingEnabled },
      { type: 'separator' },
      { icon: '⚙️', label: '设置', action: 'open-config' },
      { type: 'separator' },
      { icon: '🚪', label: '退出软件', action: 'quit', color: '#e74c3c' }
    ];

    menu.innerHTML = '';
    menu.style.cssText = `
      position:fixed;left:${x}px;top:${y}px;display:block;
      background:rgba(255,255,255,0.35);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
      border:1px solid rgba(255,255,255,0.5);border-radius:14px;padding:8px 0;min-width:180px;
      box-shadow:0 8px 32px rgba(0,0,0,0.08);z-index:10000;font-family:'Microsoft YaHei',sans-serif;font-size:13px;color:#333;
    `;

    items.forEach(item => {
      if (item.type === 'separator') {
        const sep = document.createElement('div');
        sep.style.cssText = 'height:1px;background:rgba(255,255,255,0.4);margin:4px 12px;';
        menu.appendChild(sep);
        return;
      }
      const el = document.createElement('div');
      const isOn = item.state ? item.state() : false;
      el.style.cssText = `padding:9px 20px;cursor:pointer;display:flex;align-items:center;gap:10px;border-radius:8px;margin:0 6px;color:${item.color||'#333'};`;
      el.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>${item.state?`<span style="margin-left:auto;opacity:0.5;font-size:12px">${isOn?'ON':'OFF'}</span>`:''}`;
      el.addEventListener('mouseenter', () => el.style.background='rgba(255,255,255,0.25)');
      el.addEventListener('mouseleave', () => el.style.background='transparent');
      el.addEventListener('click', () => {
        menu.style.display = 'none';
        this.handleMenuAction(item.action);
      });
      menu.appendChild(el);
    });

    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        menu.style.display = 'none';
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }

  handleMenuAction(action) {
    switch (action) {
      case 'toggle-sound':
        this.soundEnabled = !this.soundEnabled;
        if (window.petAPI) window.petAPI.sendAction('state-changed', { key: 'soundEnabled', value: this.soundEnabled });
        break;
      case 'toggle-follow':
        this.followEnabled = !this.followEnabled;
        if (window.petAPI) window.petAPI.sendAction('state-changed', { key: 'followMouse', value: this.followEnabled });
        break;
      case 'toggle-events':
        this.randomEventsEnabled = !this.randomEventsEnabled;
        if (window.petAPI) window.petAPI.sendAction('state-changed', { key: 'randomEvents', value: this.randomEventsEnabled });
        break;
      case 'toggle-walking':
        this.walkingEnabled = !this.walkingEnabled;
        if (window.petAPI) window.petAPI.sendAction('state-changed', { key: 'walkingEnabled', value: this.walkingEnabled });
        break;
      case 'open-config':
        if (window.petAPI) window.petAPI.openConfig();
        break;
      case 'quit':
        if (window.petAPI) window.petAPI.quitApp();
        break;
    }
  }

  onStateUpdate(state) {
    if (state.key === 'opacity') this.opacity = state.value;
    if (state.key === 'soundEnabled') this.soundEnabled = state.value;
    if (state.key === 'soundVolume') this.soundVolume = state.value;
    if (state.key === 'followMouse') this.followEnabled = state.value;
    if (state.key === 'randomEvents') this.randomEventsEnabled = state.value;
    if (state.key === 'walkingEnabled') this.walkingEnabled = state.value;
    if (state.key === 'screenWidth') this.screenWidth = state.value;
    if (state.key === 'idleState') this.handleIdleState(state.value);
    if (state.key === 'petSize') this.scale = state.value / 200;
  }

  handleIdleState(state) {
    if (state === 'sleeping') {
      this.triggerExpression('sleeping');
    } else if (state === 'idle') {
      this.triggerExpression('sleepy');
    }
  }

  triggerInteraction(type) {
    this.stateTime = 0;
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const sounds = {
        click: { freq: 800, dur: 0.1 },
        walk: { freq: 400, dur: 0.05 },
        event: { freq: 600, dur: 0.15 }
      };
      const s = sounds[type] || sounds.click;
      osc.frequency.setValueAtTime(s.freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(s.freq * 1.5, ctx.currentTime + s.dur * 0.3);
      osc.frequency.exponentialRampToValueAtTime(s.freq * 0.8, ctx.currentTime + s.dur);
      gain.gain.setValueAtTime(this.soundVolume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s.dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + s.dur);
    } catch (e) {}
  }

  startRenderLoop() {
    const loop = (now) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;
      this.update(dt);
      this.render(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update(dt) {
    this.stateTime += dt;
    this.updateBlink(dt);
    this.updateWalking(dt);
    this.updateFollow();
    this.updateRandomEvents(dt);
    this.physics.update(dt, this.velocity);

    // Smooth expression transitions
    const lerpSpeed = 0.1;
    this.currentEyeScale.left += (this.targetEyeScale.left - this.currentEyeScale.left) * lerpSpeed;
    this.currentEyeScale.right += (this.targetEyeScale.right - this.currentEyeScale.right) * lerpSpeed;
    this.currentPupilY += (this.targetPupilY - this.currentPupilY) * lerpSpeed;

    this.skeleton.update();
  }

  updateBlink(dt) {
    if (this.isBlinking) {
      this.blinkTimer -= dt;
      if (this.blinkTimer <= 0) {
        this.isBlinking = false;
        this.nextBlink = 2 + Math.random() * 4;
      }
    } else {
      this.nextBlink -= dt;
      if (this.nextBlink <= 0) {
        this.isBlinking = true;
        this.blinkTimer = 0.15;
      }
    }
  }

  updateWalking(dt) {
    if (!this.walkingEnabled || this.isDragging) {
      this.velocity = { x: 0, y: 0 };
      return;
    }

    if (this.walkTarget) {
      const dx = this.walkTarget - this.position.x;
      const dir = Math.sign(dx);
      if (Math.abs(dx) < 5) {
        this.walkTarget = null;
        this.velocity = { x: 0, y: 0 };
        this.nextWalkDelay = 10 + Math.random() * 30;
        return;
      }
      const speed = this.walkSpeed * dt;
      this.velocity = { x: dir * this.walkSpeed, y: 0 };
      this.position.x += dir * speed;
      this.facing = dir;

      const halfScreen = this.screenWidth / 2;
      if (this.position.x < -halfScreen + 100 || this.position.x > halfScreen - 100) {
        this.walkTarget = null;
        this.velocity = { x: 0, y: 0 };
        this.facing = -this.facing;
      }

      if (window.petAPI) {
        window.petAPI.sendAction('walk-move', { x: this.position.x });
      }
    } else {
      this.velocity = { x: 0, y: 0 };
      this.nextWalkDelay -= dt;
      if (this.nextWalkDelay <= 0) {
        const dist = 100 + Math.random() * 300;
        this.walkTarget = this.position.x + dist * (Math.random() > 0.5 ? 1 : -1);
      }
    }
  }

  updateFollow() {
    if (!this.followEnabled) {
      this.targetHeadAngle *= 0.95;
      return;
    }

    const centerX = window.screenX + window.innerWidth / 2;
    const centerY = window.screenY + window.innerHeight / 2;
    const dx = this.mouseX - centerX;
    const dy = this.mouseY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.followRadius) {
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const factor = 1 - dist / this.followRadius;
      this.targetHeadAngle = angle * factor * (this.headMaxAngle / 180);
    } else {
      this.targetHeadAngle *= 0.95;
    }

    this.currentHeadAngle += (this.targetHeadAngle - this.currentHeadAngle) * 0.08;
  }

  updateRandomEvents(dt) {
    if (!this.randomEventsEnabled) return;
    this.eventCooldown -= dt;
    this.eventTimer += dt;
    if (this.eventTimer < this.nextEventDelay || this.eventCooldown > 0) return;

    const events = [
      { name: 'yawn', weight: 20, expr: 'sleepy', cond: this.stateTime > 30 },
      { name: 'doze', weight: 15, expr: 'sleeping', cond: this.stateTime > 60 },
      { name: 'wave', weight: 25, expr: 'happy', cond: true },
      { name: 'look', weight: 20, expr: 'curious', cond: true },
      { name: 'jump', weight: 15, expr: 'happy', cond: true },
      { name: 'stretch', weight: 10, expr: 'sleepy', cond: this.stateTime > 45 }
    ].filter(e => e.cond);

    if (events.length === 0) return;

    const total = events.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    for (const ev of events) {
      r -= ev.weight;
      if (r <= 0) {
        this.triggerExpression(ev.expr);
        this.playSound('event');
        this.eventCooldown = 10;
        this.eventTimer = 0;
        this.nextEventDelay = 30 + Math.random() * 90;
        setTimeout(() => this.triggerExpression('default'), 3000);
        break;
      }
    }
  }

  render(dt) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Center character in canvas
    ctx.translate(this.width / 2, this.height * 0.4);

    // Apply scale
    if (this.scale !== 1) {
      ctx.scale(this.scale, this.scale);
    }

    // Idle animation
    this.idleAnimTime += dt;
    const idleSway = Math.sin(this.idleAnimTime * 1.8) * 2;
    const breathe = Math.sin(this.idleAnimTime * 2) * 1.5;
    const walkBounce = Math.abs(this.velocity.x) > 0.1 ? Math.abs(Math.sin(Date.now() * 0.008)) * 3 : 0;

    // Draw the character
    drawCharacter(ctx, {
      facing: this.facing,
      idleSway,
      breathe,
      walkBounce,
      headAngle: this.currentHeadAngle,
      eyeScale: this.currentEyeScale,
      eyePupilY: this.currentPupilY,
      mouthOpen: this.currentMouthOpen,
      isBlinking: this.isBlinking,
      physics: {
        earLeft: this.physics.springs.earLeft.value,
        earRight: this.physics.springs.earRight.value,
        tail1: this.physics.springs.tail1.value,
        tail2: this.physics.springs.tail2.value,
        tail3: this.physics.springs.tail3.value,
        hairLeft: this.physics.springs.hairLeft.value,
        hairRight: this.physics.springs.hairRight.value
      }
    });

    ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const renderer = new PetRenderer();
  if (window.petAPI) {
    window.petAPI.onStateUpdate((data) => renderer.onStateUpdate(data));
    window.petAPI.getState().then((state) => {
      if (state) {
        renderer.onStateUpdate({ key: 'opacity', value: state.opacity });
        renderer.onStateUpdate({ key: 'soundEnabled', value: state.soundEnabled });
        renderer.onStateUpdate({ key: 'soundVolume', value: state.soundVolume });
        renderer.onStateUpdate({ key: 'followMouse', value: state.followMouse });
        renderer.onStateUpdate({ key: 'randomEvents', value: state.randomEvents });
        renderer.onStateUpdate({ key: 'walkingEnabled', value: state.walkingEnabled });
        renderer.onStateUpdate({ key: 'petSize', value: state.petSize });
      }
    }).catch(() => {});
  }
});
