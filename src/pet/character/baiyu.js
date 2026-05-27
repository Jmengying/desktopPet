// 白玉 - 白发猫娘萝莉角色定义
// 使用 Canvas 2D 直接绘制，不用 SVG 路径

const COLORS = {
  skin: '#FFFAF0',
  skinStroke: '#F0D0B0',
  hair: '#F5F5F5',
  hairStroke: '#D8D8D8',
  hairDark: '#E8E8E8',
  eyeIris: '#7B68AE',
  eyeIrisLight: '#9B7ED8',
  eyePupil: '#2D1B4E',
  eyeWhite: '#FFFFFF',
  blush: 'rgba(255,182,193,0.5)',
  mouth: '#FF69B4',
  earInner: '#FFD1DC',
  sailorWhite: '#FFFFFF',
  sailorStroke: '#E0E0E0',
  sailorBlue: '#4A90D9',
  sailorBlueStroke: '#3A7BC8',
  bowPink: '#FF69B4',
  bowStroke: '#E55A9E',
  shoeBrown: '#8B4513',
  shoeStroke: '#6B3410',
  nose: '#FFB6C1',
  tail: '#F5F5F5'
};

function drawCharacter(ctx, state) {
  const {
    facing = 1,
    idleSway = 0,
    breathe = 0,
    walkBounce = 0,
    headAngle = 0,
    eyeScale = { left: 1, right: 1 },
    eyePupilY = 0,
    mouthOpen = 0,
    isBlinking = false,
    physics = {}
  } = state;

  ctx.save();

  // Apply facing direction
  if (facing === -1) ctx.scale(-1, 1);

  // Apply idle sway and walk bounce
  ctx.translate(idleSway, -walkBounce + breathe);

  // Draw from bottom to top

  // === TAIL ===
  drawTail(ctx, physics);

  // === LEGS ===
  drawLegs(ctx);

  // === BODY (SAILOR UNIFORM) ===
  drawBody(ctx);

  // === SKIRT ===
  drawSkirt(ctx);

  // === LEFT ARM ===
  drawArm(ctx, -1);

  // === HEAD ===
  drawHead(ctx, headAngle, eyeScale, eyePupilY, mouthOpen, isBlinking, physics);

  // === RIGHT ARM ===
  drawArm(ctx, 1);

  ctx.restore();
}

function drawTail(ctx, physics) {
  const tailAngle = (physics.tail1 || 0) * 0.5;
  ctx.save();
  ctx.translate(22, 10);
  ctx.rotate(tailAngle * Math.PI / 180);

  // Tail segment 1
  ctx.fillStyle = COLORS.tail;
  ctx.strokeStyle = COLORS.hairStroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.bezierCurveTo(-6, 8, -8, 18, -4, 28);
  ctx.lineTo(4, 28);
  ctx.bezierCurveTo(8, 18, 6, 8, 3, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tail segment 2
  const tail2Angle = (physics.tail2 || 0) * 0.3;
  ctx.save();
  ctx.translate(0, 28);
  ctx.rotate(tail2Angle * Math.PI / 180);
  ctx.fillStyle = COLORS.hairDark;
  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.bezierCurveTo(-5, 6, -6, 14, -3, 22);
  ctx.lineTo(3, 22);
  ctx.bezierCurveTo(6, 14, 5, 6, 3, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tail tip
  const tail3Angle = (physics.tail3 || 0) * 0.2;
  ctx.save();
  ctx.translate(0, 22);
  ctx.rotate(tail3Angle * Math.PI / 180);
  ctx.fillStyle = '#E0E0E0';
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.bezierCurveTo(-4, 5, -4, 12, 0, 18);
  ctx.bezierCurveTo(4, 12, 4, 5, 2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

function drawLegs(ctx) {
  // Left leg
  ctx.fillStyle = COLORS.skin;
  ctx.strokeStyle = COLORS.skinStroke;
  ctx.lineWidth = 1.5;

  ctx.save();
  ctx.translate(-10, 25);
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(-6, 20);
  ctx.lineTo(-7, 40);
  ctx.lineTo(7, 40);
  ctx.lineTo(6, 20);
  ctx.lineTo(5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Left shoe
  ctx.fillStyle = COLORS.shoeBrown;
  ctx.strokeStyle = COLORS.shoeStroke;
  ctx.beginPath();
  ctx.moveTo(-8, 38);
  ctx.lineTo(-10, 42);
  ctx.lineTo(-10, 46);
  ctx.lineTo(10, 46);
  ctx.lineTo(10, 42);
  ctx.lineTo(8, 38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Right leg
  ctx.fillStyle = COLORS.skin;
  ctx.strokeStyle = COLORS.skinStroke;
  ctx.save();
  ctx.translate(10, 25);
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(-6, 20);
  ctx.lineTo(-7, 40);
  ctx.lineTo(7, 40);
  ctx.lineTo(6, 20);
  ctx.lineTo(5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right shoe
  ctx.fillStyle = COLORS.shoeBrown;
  ctx.strokeStyle = COLORS.shoeStroke;
  ctx.beginPath();
  ctx.moveTo(-8, 38);
  ctx.lineTo(-10, 42);
  ctx.lineTo(-10, 46);
  ctx.lineTo(10, 46);
  ctx.lineTo(10, 42);
  ctx.lineTo(8, 38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawBody(ctx) {
  // Sailor uniform top
  ctx.fillStyle = COLORS.sailorWhite;
  ctx.strokeStyle = COLORS.sailorStroke;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(-20, -25);
  ctx.lineTo(-22, -18);
  ctx.lineTo(-20, 5);
  ctx.lineTo(20, 5);
  ctx.lineTo(22, -18);
  ctx.lineTo(20, -25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sailor collar (blue)
  ctx.fillStyle = COLORS.sailorBlue;
  ctx.strokeStyle = COLORS.sailorBlueStroke;
  ctx.beginPath();
  ctx.moveTo(-20, -25);
  ctx.lineTo(-16, -20);
  ctx.lineTo(0, -15);
  ctx.lineTo(16, -20);
  ctx.lineTo(20, -25);
  ctx.lineTo(18, -28);
  ctx.lineTo(10, -25);
  ctx.lineTo(0, -22);
  ctx.lineTo(-10, -25);
  ctx.lineTo(-18, -28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Collar stripes
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-14, -22);
  ctx.lineTo(0, -17);
  ctx.lineTo(14, -22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-12, -20);
  ctx.lineTo(0, -16);
  ctx.lineTo(12, -20);
  ctx.stroke();

  // Bow
  ctx.fillStyle = COLORS.bowPink;
  ctx.strokeStyle = COLORS.bowStroke;
  ctx.lineWidth = 1.5;
  // Left wing
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.bezierCurveTo(-8, -22, -14, -18, -10, -14);
  ctx.bezierCurveTo(-6, -10, -2, -14, 0, -18);
  ctx.fill();
  ctx.stroke();
  // Right wing
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.bezierCurveTo(8, -22, 14, -18, 10, -14);
  ctx.bezierCurveTo(6, -10, 2, -14, 0, -18);
  ctx.fill();
  ctx.stroke();
  // Center knot
  ctx.beginPath();
  ctx.arc(0, -18, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawSkirt(ctx) {
  ctx.fillStyle = COLORS.sailorBlue;
  ctx.strokeStyle = COLORS.sailorBlueStroke;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(-20, 5);
  ctx.bezierCurveTo(-24, 15, -28, 25, -26, 30);
  ctx.lineTo(26, 30);
  ctx.bezierCurveTo(28, 25, 24, 15, 20, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Skirt pleats
  ctx.strokeStyle = COLORS.sailorBlueStroke;
  ctx.lineWidth = 0.8;
  for (let i = -15; i <= 15; i += 7) {
    ctx.beginPath();
    ctx.moveTo(i, 6);
    ctx.lineTo(i + (i > 0 ? 2 : -2), 29);
    ctx.stroke();
  }
}

function drawArm(ctx, side) {
  const x = side * 25;
  ctx.fillStyle = COLORS.skin;
  ctx.strokeStyle = COLORS.skinStroke;
  ctx.lineWidth = 1.5;

  ctx.save();
  ctx.translate(x, -10);

  // Upper arm (sleeve)
  ctx.fillStyle = COLORS.sailorWhite;
  ctx.strokeStyle = COLORS.sailorStroke;
  ctx.beginPath();
  ctx.moveTo(-6, -3);
  ctx.lineTo(-8, 8);
  ctx.lineTo(8, 8);
  ctx.lineTo(6, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lower arm (skin)
  ctx.fillStyle = COLORS.skin;
  ctx.strokeStyle = COLORS.skinStroke;
  ctx.beginPath();
  ctx.moveTo(-5, 8);
  ctx.bezierCurveTo(-6, 15, -5, 22, -3, 28);
  ctx.lineTo(3, 28);
  ctx.bezierCurveTo(5, 22, 6, 15, 5, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hand
  ctx.beginPath();
  ctx.ellipse(0, 30, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawHead(ctx, headAngle, eyeScale, eyePupilY, mouthOpen, isBlinking, physics) {
  const earAngleL = (physics.earLeft || 0) * 0.5;
  const earAngleR = (physics.earRight || 0) * 0.5;
  const hairAngleL = (physics.hairLeft || 0) * 0.3;
  const hairAngleR = (physics.hairRight || 0) * 0.3;

  ctx.save();
  ctx.translate(0, -50);

  // Apply head rotation
  ctx.rotate(headAngle * Math.PI / 180);

  // === BACK HAIR ===
  ctx.fillStyle = COLORS.hairDark;
  ctx.strokeStyle = COLORS.hairStroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-32, -10);
  ctx.bezierCurveTo(-35, -25, -30, -50, -18, -55);
  ctx.bezierCurveTo(-8, -58, 8, -58, 18, -55);
  ctx.bezierCurveTo(30, -50, 35, -25, 32, -10);
  ctx.bezierCurveTo(34, 10, 32, 35, 28, 55);
  ctx.bezierCurveTo(24, 65, 16, 72, 0, 74);
  ctx.bezierCurveTo(-16, 72, -24, 65, -28, 55);
  ctx.bezierCurveTo(-32, 35, -34, 10, -32, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === CAT EARS ===
  // Left ear
  ctx.save();
  ctx.translate(-18, -35);
  ctx.rotate(earAngleL * Math.PI / 180);
  ctx.fillStyle = COLORS.hair;
  ctx.strokeStyle = COLORS.hairStroke;
  ctx.beginPath();
  ctx.moveTo(-5, 5);
  ctx.lineTo(-12, -22);
  ctx.lineTo(3, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Inner ear
  ctx.fillStyle = COLORS.earInner;
  ctx.beginPath();
  ctx.moveTo(-4, 3);
  ctx.lineTo(-10, -18);
  ctx.lineTo(1, -15);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Right ear
  ctx.save();
  ctx.translate(18, -35);
  ctx.rotate(earAngleR * Math.PI / 180);
  ctx.fillStyle = COLORS.hair;
  ctx.strokeStyle = COLORS.hairStroke;
  ctx.beginPath();
  ctx.moveTo(5, 5);
  ctx.lineTo(12, -22);
  ctx.lineTo(-3, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Inner ear
  ctx.fillStyle = COLORS.earInner;
  ctx.beginPath();
  ctx.moveTo(4, 3);
  ctx.lineTo(10, -18);
  ctx.lineTo(-1, -15);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === HEAD (FACE) ===
  ctx.fillStyle = COLORS.skin;
  ctx.strokeStyle = COLORS.skinStroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-24, -20);
  ctx.bezierCurveTo(-26, -30, -22, -42, -12, -48);
  ctx.bezierCurveTo(-4, -52, 4, -52, 12, -48);
  ctx.bezierCurveTo(22, -42, 26, -30, 24, -20);
  ctx.bezierCurveTo(26, -10, 24, 2, 18, 10);
  ctx.bezierCurveTo(12, 16, 4, 20, 0, 20);
  ctx.bezierCurveTo(-4, 20, -12, 16, -18, 10);
  ctx.bezierCurveTo(-24, 2, -26, -10, -24, -20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === HAIR (FRONT - BANGS) ===
  ctx.fillStyle = COLORS.hair;
  ctx.strokeStyle = COLORS.hairStroke;
  ctx.lineWidth = 1;
  // Main bangs
  ctx.beginPath();
  ctx.moveTo(-26, -26);
  ctx.bezierCurveTo(-28, -36, -24, -50, -14, -53);
  ctx.bezierCurveTo(-8, -55, -4, -50, -6, -40);
  ctx.lineTo(-4, -32);
  ctx.bezierCurveTo(-2, -42, 0, -50, 2, -53);
  ctx.bezierCurveTo(4, -50, 6, -42, 8, -32);
  ctx.lineTo(10, -40);
  ctx.bezierCurveTo(12, -50, 16, -53, 22, -50);
  ctx.bezierCurveTo(28, -46, 30, -36, 28, -26);
  ctx.bezierCurveTo(26, -20, 22, -16, 18, -14);
  ctx.bezierCurveTo(12, -12, 6, -10, 0, -10);
  ctx.bezierCurveTo(-6, -10, -12, -12, -18, -14);
  ctx.bezierCurveTo(-22, -16, -26, -20, -26, -26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Left side hair
  ctx.save();
  ctx.translate(-28, -8);
  ctx.rotate(hairAngleL * Math.PI / 180);
  ctx.fillStyle = COLORS.hairDark;
  ctx.beginPath();
  ctx.moveTo(-2, -5);
  ctx.bezierCurveTo(-5, 0, -6, 15, -4, 30);
  ctx.bezierCurveTo(-2, 40, 0, 45, 2, 42);
  ctx.bezierCurveTo(4, 38, 3, 25, 2, 10);
  ctx.bezierCurveTo(1, 0, 0, -5, -2, -5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Right side hair
  ctx.save();
  ctx.translate(28, -8);
  ctx.rotate(hairAngleR * Math.PI / 180);
  ctx.fillStyle = COLORS.hairDark;
  ctx.beginPath();
  ctx.moveTo(2, -5);
  ctx.bezierCurveTo(5, 0, 6, 15, 4, 30);
  ctx.bezierCurveTo(2, 40, 0, 45, -2, 42);
  ctx.bezierCurveTo(-4, 38, -3, 25, -2, 10);
  ctx.bezierCurveTo(-1, 0, 0, -5, 2, -5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // === EYES ===
  drawAnimeEye(ctx, -10, -5, eyeScale.left, eyePupilY, isBlinking);
  drawAnimeEye(ctx, 10, -5, eyeScale.right, eyePupilY, isBlinking);

  // === NOSE ===
  ctx.fillStyle = COLORS.nose;
  ctx.beginPath();
  ctx.ellipse(0, 3, 2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // === MOUTH ===
  if (mouthOpen > 0.1) {
    // Open mouth
    ctx.fillStyle = '#FF9999';
    ctx.beginPath();
    ctx.ellipse(0, 12, 4, 3 * mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.mouth;
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    // Closed mouth (small smile)
    ctx.strokeStyle = COLORS.mouth;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, 11);
    ctx.quadraticCurveTo(0, 15, 4, 11);
    ctx.stroke();
  }

  // === BLUSH ===
  ctx.fillStyle = COLORS.blush;
  ctx.beginPath();
  ctx.ellipse(-16, 5, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(16, 5, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawAnimeEye(ctx, x, y, scaleY, pupilY, isBlinking) {
  ctx.save();
  ctx.translate(x, y);

  if (isBlinking) {
    // Blink: curved line
    ctx.strokeStyle = '#4A3B6B';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.quadraticCurveTo(0, 4, 7, 0);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.scale(1, scaleY);

  // Eye white
  ctx.fillStyle = COLORS.eyeWhite;
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Iris (gradient)
  const grad = ctx.createRadialGradient(0, pupilY + 1, 0, 0, pupilY + 1, 8);
  grad.addColorStop(0, COLORS.eyeIrisLight);
  grad.addColorStop(0.5, COLORS.eyeIris);
  grad.addColorStop(1, COLORS.eyePupil);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, pupilY + 1, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupil
  ctx.fillStyle = COLORS.eyePupil;
  ctx.beginPath();
  ctx.ellipse(0, pupilY + 2, 3.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main highlight
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.ellipse(-3, -4, 3, 3.5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Secondary highlight
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(2, 3, 1.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye outline
  ctx.strokeStyle = '#4A3B6B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 12, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Upper eyelid line (thicker)
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 12, 0, -Math.PI * 0.85, -Math.PI * 0.15);
  ctx.stroke();

  ctx.restore();
}

// Skeleton for physics system
function createBaiyuSkeleton() {
  const { Skeleton } = require('./skeleton');
  const skeleton = new Skeleton();
  skeleton.addBone('body', 0, -60, 'root');
  skeleton.addBone('head', 0, -50, 'body');
  skeleton.addBone('earLeft', -18, -35, 'head');
  skeleton.addBone('earRight', 18, -35, 'head');
  skeleton.addBone('hairLeft', -28, -8, 'head');
  skeleton.addBone('hairRight', 28, -8, 'head');
  skeleton.addBone('tail1', 22, 10, 'body');
  skeleton.addBone('tail2', 15, 15, 'tail1');
  skeleton.addBone('tail3', 10, 12, 'tail2');
  return skeleton;
}

// Expressions
const EXPRESSIONS = {
  default: { eyeScale: { left: 1, right: 1 }, eyePupilY: 0, mouthOpen: 0 },
  happy: { eyeScale: { left: 0.5, right: 0.5 }, eyePupilY: 0, mouthOpen: 0.4 },
  sleepy: { eyeScale: { left: 0.3, right: 0.3 }, eyePupilY: 2, mouthOpen: 0.5 },
  surprised: { eyeScale: { left: 1.3, right: 1.3 }, eyePupilY: -1, mouthOpen: 0.9 },
  shy: { eyeScale: { left: 0.4, right: 0.4 }, eyePupilY: 1, mouthOpen: 0 },
  curious: { eyeScale: { left: 1.2, right: 1.2 }, eyePupilY: -1, mouthOpen: 0.3 },
  sleeping: { eyeScale: { left: 0, right: 0 }, eyePupilY: 0, mouthOpen: 0 }
};

module.exports = { createBaiyuSkeleton, drawCharacter, EXPRESSIONS, COLORS };
