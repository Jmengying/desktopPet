const { createBaiyuSkeleton, BAIYU_PARTS, EXPRESSIONS } = require('./character/baiyu');
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
    this.animState = 'idle';
    this.stateTime = 0;
    this.idleAnimTime = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.nextBlink = 2 + Math.random() * 4;

    // Walking state
    this.walkingEnabled = true;
    this.walkTarget = null;
    this.position = { x: 0, y: 0 };
    this.walkSpeed = 90; // pixels per second
    this.nextWalkDelay = 30 + Math.random() * 60;
    this.screenWidth = 1920; // updated via IPC

    // Mouse follow
    this.followEnabled = true;
    this.mouseX = 0;
    this.mouseY = 0;
    this.followRadius = 200;
    this.eyeMaxAngle = 15;
    this.headMaxAngle = 8;
    this.currentEyeAngle = 0;
    this.currentHeadAngle = 0;

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
      // Listen for response
      window.petAPI.onStateUpdate((data) => {
        if (data.key === 'screenWidth') this.screenWidth = data.value;
      });
    }
  }

  setupInteractions() {
    // Mouse move for follow (use screen coordinates)
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.screenX;
      this.mouseY = e.screenY;
    });

    // Mouse enter: disable click-through so we can receive clicks
    this.canvas.addEventListener('mouseenter', () => {
      this.expression.setExpression('curious', 0.1);
      if (window.petAPI) window.petAPI.sendAction('mouse-enter');
    });

    // Mouse leave: re-enable click-through
    this.canvas.addEventListener('mouseleave', () => {
      this.expression.setExpression('default', 0.08);
      if (window.petAPI) window.petAPI.sendAction('mouse-leave');
    });

    // Click
    this.canvas.addEventListener('click', () => {
      if (this.isDragging) return;
      this.triggerInteraction('click');
      this.expression.setExpression('happy', 0.15);
      this.playSound('click');
      setTimeout(() => this.expression.setExpression('default', 0.08), 1500);
    });

    // Drag
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
        this.expression.setExpression('surprised', 0.15);
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
        this.expression.setExpression('default', 0.08);
        if (window.petAPI) window.petAPI.sendAction('drag-end');
      }
    });

    // Right-click context menu
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e.clientX, e.clientY);
    });
  }

  showContextMenu(x, y) {
    let menu = document.getElementById('context-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'context-menu';
      document.body.appendChild(menu);
    }

    const items = [
      { icon: '\u{1F50A}', label: '音效开关', action: 'toggle-sound', state: () => this.soundEnabled },
      { icon: '\u{1F5B1}️', label: '鼠标跟随', action: 'toggle-follow', state: () => this.followEnabled },
      { icon: '✨', label: '随机动作', action: 'toggle-events', state: () => this.randomEventsEnabled },
      { icon: '\u{1F6B6}', label: '桌面走动', action: 'toggle-walking', state: () => this.walkingEnabled },
      { type: 'separator' },
      { icon: '⚙️', label: '设置', action: 'open-config' },
      { type: 'separator' },
      { icon: '\u{1F6AA}', label: '退出软件', action: 'quit', color: '#e74c3c' }
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

    // Close on click outside
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
    if (state.key === 'idleState') this.handleIdleState(state.value);
    if (state.key === 'screenWidth') this.screenWidth = state.value;
    if (state.key === 'petSize') {
      this.scale = state.value / 200;
    }
  }

  handleIdleState(state) {
    if (state === 'sleeping') {
      this.expression.setExpression('sleeping', 0.05);
    } else if (state === 'idle') {
      this.expression.setExpression('sleepy', 0.08);
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
    this.expression.update(EXPRESSIONS);
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

      // Edge detection using screen width
      const halfScreen = this.screenWidth / 2;
      if (this.position.x < -halfScreen + 100 || this.position.x > halfScreen - 100) {
        this.walkTarget = null;
        this.velocity = { x: 0, y: 0 };
        this.facing = -this.facing; // turn around
      }

      // Move the window
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
      this.currentEyeAngle *= 0.95;
      this.currentHeadAngle *= 0.95;
      return;
    }

    // Use screen center for follow calculation
    const centerX = window.screenX + window.innerWidth / 2;
    const centerY = window.screenY + window.innerHeight / 2;
    const dx = this.mouseX - centerX;
    const dy = this.mouseY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.followRadius) {
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const factor = 1 - dist / this.followRadius;
      const targetEye = angle * factor * (this.eyeMaxAngle / 180);
      const targetHead = angle * factor * (this.headMaxAngle / 180);
      this.currentEyeAngle += (targetEye - this.currentEyeAngle) * 0.08;
      this.currentHeadAngle += (targetHead - this.currentHeadAngle) * 0.08;
    } else {
      this.currentEyeAngle += (0 - this.currentEyeAngle) * 0.04;
      this.currentHeadAngle += (0 - this.currentHeadAngle) * 0.04;
    }
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
        this.expression.setExpression(ev.expr, 0.1);
        this.playSound('event');
        this.eventCooldown = 10;
        this.eventTimer = 0;
        this.nextEventDelay = 30 + Math.random() * 90;
        setTimeout(() => this.expression.setExpression('default', 0.08), 3000);
        break;
      }
    }
  }

  render(dt) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(this.scale, this.scale);

    if (this.facing === -1) ctx.scale(-1, 1);

    const physics = this.physics.springs;
    const expr = this.expression.blendValues;

    // Idle animation offsets (frame-rate independent)
    this.idleAnimTime += dt;
    const idleSway = Math.sin(this.idleAnimTime * 1.8) * 2;
    const breathe = Math.sin(this.idleAnimTime * 2) * 1.5;

    // Walk bounce
    const walkBounce = Math.abs(this.velocity.x) > 0.1 ? Math.abs(Math.sin(Date.now() * 0.008)) * 3 : 0;

    // Draw order: hairBack, tail, legs, body, collar, skirt, arms, head, face, hair, ears

    // Hair back layer
    this.drawPart(ctx, 'hairBack', BAIYU_PARTS.hairBack, physics);

    // Tail
    this.drawPart(ctx, 'tail1', BAIYU_PARTS.tail1, physics);
    this.drawPart(ctx, 'tail2', BAIYU_PARTS.tail2, physics);
    this.drawPart(ctx, 'tail3', BAIYU_PARTS.tail3, physics);

    // Legs (behind body)
    this.drawPart(ctx, 'legLeft', BAIYU_PARTS.legLeft, physics);
    this.drawPart(ctx, 'legRight', BAIYU_PARTS.legRight, physics);
    this.drawPart(ctx, 'shoeLeft', BAIYU_PARTS.shoeLeft, physics);
    this.drawPart(ctx, 'shoeRight', BAIYU_PARTS.shoeRight, physics);

    ctx.save();
    ctx.translate(idleSway, -walkBounce + breathe);

    // Body & clothing
    this.drawPart(ctx, 'body', BAIYU_PARTS.body, physics);
    this.drawPart(ctx, 'collar', BAIYU_PARTS.collar, physics);
    this.drawPart(ctx, 'bow', BAIYU_PARTS.bow, physics);
    this.drawPart(ctx, 'skirt', BAIYU_PARTS.skirt, physics);
    this.drawPart(ctx, 'armLeft', BAIYU_PARTS.armLeft, physics);

    // Head
    this.drawPart(ctx, 'head', BAIYU_PARTS.head, physics);

    // Face (rotates with head)
    ctx.save();
    ctx.rotate(this.currentHeadAngle * Math.PI / 180);
    this.drawPart(ctx, 'hairFront', BAIYU_PARTS.hairFront, physics);
    this.drawPart(ctx, 'hairLeft', BAIYU_PARTS.hairLeft, physics);
    this.drawPart(ctx, 'hairRight', BAIYU_PARTS.hairRight, physics);
    this.drawEye(ctx, 'eyeLeft', BAIYU_PARTS.eyeLeft, expr);
    this.drawEye(ctx, 'eyeRight', BAIYU_PARTS.eyeRight, expr);
    this.drawNose(ctx);
    this.drawMouth(ctx, BAIYU_PARTS.mouth, expr);
    this.drawBlush(ctx, 'blushLeft', BAIYU_PARTS.blushLeft);
    this.drawBlush(ctx, 'blushRight', BAIYU_PARTS.blushRight);
    this.drawPart(ctx, 'earLeft', BAIYU_PARTS.earLeft, physics);
    this.drawPart(ctx, 'earRight', BAIYU_PARTS.earRight, physics);
    ctx.restore();

    this.drawPart(ctx, 'armRight', BAIYU_PARTS.armRight, physics);
    ctx.restore();

    ctx.restore();
  }

  drawPart(ctx, name, part, physics) {
    const bone = this.skeleton.getBone(name);
    if (!bone || !part.path) return;
    ctx.save();
    ctx.translate(bone.worldX, bone.worldY);
    ctx.rotate(bone.worldRotation * Math.PI / 180);
    const path = new Path2D(part.path);
    ctx.fillStyle = part.fill;
    ctx.fill(path);
    if (part.stroke) {
      ctx.strokeStyle = part.stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke(path);
    }
    if (part.innerPath) {
      ctx.fillStyle = part.innerFill;
      ctx.fill(new Path2D(part.innerPath));
    }
    ctx.restore();
  }

  drawEye(ctx, name, part, expr) {
    const bone = this.skeleton.getBone(name);
    if (!bone) return;
    const eyeExpr = expr[name] || { scaleY: 1, pupilY: 0 };
    ctx.save();
    ctx.translate(bone.worldX, bone.worldY);

    if (this.isBlinking) {
      // Blink: curved line
      ctx.strokeStyle = '#4A3B6B';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.quadraticCurveTo(0, 3, 7, 0);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.scale(1, eyeExpr.scaleY);

    // Eye white (slightly oval)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris (large, colorful)
    const gradient = ctx.createRadialGradient(0, eyeExpr.pupilY, 0, 0, eyeExpr.pupilY, 8);
    gradient.addColorStop(0, '#9B7ED8');
    gradient.addColorStop(0.6, part.fill);
    gradient.addColorStop(1, '#4A3B6B');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, eyeExpr.pupilY + 1, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#2D1B4E';
    ctx.beginPath();
    ctx.ellipse(0, eyeExpr.pupilY + 2, 3.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main highlight (big)
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(-3, -4, 3, 3.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Secondary highlight (small)
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.ellipse(2, 2, 1.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye outline
    ctx.strokeStyle = '#4A3B6B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  drawMouth(ctx, part, expr) {
    const bone = this.skeleton.getBone('mouth');
    if (!bone) return;
    const mouthExpr = expr.mouth || { open: 0 };
    ctx.save();
    ctx.translate(bone.worldX, bone.worldY);
    if (mouthExpr.open > 0.1) {
      ctx.fillStyle = '#FF9999';
      ctx.beginPath();
      ctx.ellipse(0, 2, 4, 3 * mouthExpr.open, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = part.fill;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.quadraticCurveTo(0, 3, 4, 0);
    ctx.stroke();
    ctx.restore();
  }

  drawBlush(ctx, name, part) {
    const bone = this.skeleton.getBone(name);
    if (!bone) return;
    ctx.save();
    ctx.translate(bone.worldX, bone.worldY);
    ctx.fillStyle = part.fill;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawNose(ctx) {
    const bone = this.skeleton.getBone('head');
    if (!bone) return;
    ctx.save();
    ctx.translate(bone.worldX, bone.worldY + 3);
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.ellipse(0, 0, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
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
