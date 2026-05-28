// 白玉 - 白发猫娘萝莉 - 高质量 Canvas 2D 绘制
// 使用渐变、阴影、抗锯齿等技术提升视觉效果

const COLORS = {
  // 皮肤
  skin: '#FFF5EE',
  skinLight: '#FFFAF5',
  skinShadow: '#F5D5C8',
  skinStroke: '#E8C0B0',

  // 头发
  hair: '#F8F8FF',
  hairLight: '#FFFFFF',
  hairMid: '#F0F0F5',
  hairDark: '#E0E0E8',
  hairStroke: '#D0D0D8',

  // 眼睛
  eyeWhite: '#FFFFFF',
  eyeIrisOuter: '#6B5B95',
  eyeIrisMid: '#8B7BB5',
  eyeIrisInner: '#A898D0',
  eyePupil: '#2D1B4E',
  eyeHighlight: '#FFFFFF',
  eyeOutline: '#4A3B6B',
  eyeUpperLid: '#3D2D5E',

  // 其他
  blush: 'rgba(255,150,170,0.45)',
  mouthPink: '#FF69B4',
  mouthInner: '#FF8FAB',
  nose: '#FFB0C0',
  earInner: '#FFB6C1',

  // 服装
  sailorWhite: '#FFFFFF',
  sailorStroke: '#E8E8E8',
  sailorBlue: '#5B9BD5',
  sailorBlueDark: '#4A8BC4',
  sailorBlueLight: '#7BB3E0',
  bowPink: '#FF69B4',
  bowPinkDark: '#E0558A',

  // 其他
  shoeBrown: '#8B6914',
  shoeBrownDark: '#6B5010',
  shoeHighlight: '#A88030',
  tailTip: '#E8E8F0'
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
  if (facing === -1) ctx.scale(-1, 1);
  ctx.translate(idleSway, -walkBounce + breathe);

  // 启用抗锯齿
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  drawTail(ctx, physics);
  drawLegs(ctx);
  drawBody(ctx);
  drawSkirt(ctx);
  drawArm(ctx, -1);
  drawHead(ctx, headAngle, eyeScale, eyePupilY, mouthOpen, isBlinking, physics);
  drawArm(ctx, 1);

  ctx.restore();
}

function drawTail(ctx, physics) {
  const t1 = (physics.tail1 || 0) * 0.5;
  const t2 = (physics.tail2 || 0) * 0.3;
  const t3 = (physics.tail3 || 0) * 0.2;

  ctx.save();
  ctx.translate(24, 15);
  ctx.rotate(t1 * Math.PI / 180);

  // 尾巴渐变
  const grad = ctx.createLinearGradient(0, 0, 0, 50);
  grad.addColorStop(0, COLORS.hair);
  grad.addColorStop(1, COLORS.tailTip);

  ctx.fillStyle = grad;
  ctx.strokeStyle = COLORS.hairStroke;
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.bezierCurveTo(-7, 10, -9, 22, -5, 35);
  ctx.bezierCurveTo(-3, 40, 3, 40, 5, 35);
  ctx.bezierCurveTo(9, 22, 7, 10, 4, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 第二段
  ctx.save();
  ctx.translate(0, 35);
  ctx.rotate(t2 * Math.PI / 180);
  ctx.fillStyle = COLORS.hairMid;
  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.bezierCurveTo(-5, 8, -6, 18, -3, 28);
  ctx.bezierCurveTo(-1, 32, 1, 32, 3, 28);
  ctx.bezierCurveTo(6, 18, 5, 8, 3, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 第三段（尾尖）
  ctx.save();
  ctx.translate(0, 28);
  ctx.rotate(t3 * Math.PI / 180);
  ctx.fillStyle = COLORS.hairDark;
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.bezierCurveTo(-4, 6, -3, 14, 0, 20);
  ctx.bezierCurveTo(3, 14, 4, 6, 2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

function drawLegs(ctx) {
  // 左腿
  drawLeg(ctx, -12, 28);
  // 右腿
  drawLeg(ctx, 12, 28);
}

function drawLeg(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);

  // 腿部渐变
  const legGrad = ctx.createLinearGradient(0, 0, 0, 45);
  legGrad.addColorStop(0, COLORS.skinLight);
  legGrad.addColorStop(1, COLORS.skin);

  ctx.fillStyle = legGrad;
  ctx.strokeStyle = COLORS.skinStroke;
  ctx.lineWidth = 1.2;

  // 腿形
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.bezierCurveTo(-6, 8, -7, 18, -7, 28);
  ctx.bezierCurveTo(-7, 35, -5, 40, -3, 42);
  ctx.lineTo(3, 42);
  ctx.bezierCurveTo(5, 40, 7, 35, 7, 28);
  ctx.bezierCurveTo(7, 18, 6, 8, 5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 过膝袜
  const sockGrad = ctx.createLinearGradient(0, 15, 0, 42);
  sockGrad.addColorStop(0, '#FFFFFF');
  sockGrad.addColorStop(0.1, '#FFFFFF');
  sockGrad.addColorStop(0.15, '#FFB6C1');
  sockGrad.addColorStop(0.2, '#FFFFFF');
  sockGrad.addColorStop(1, '#F8F8F8');

  ctx.fillStyle = sockGrad;
  ctx.beginPath();
  ctx.moveTo(-6, 15);
  ctx.bezierCurveTo(-7, 22, -7, 32, -6, 40);
  ctx.lineTo(6, 40);
  ctx.bezierCurveTo(7, 32, 7, 22, 6, 15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#E0E0E0';
  ctx.stroke();

  // 袜口花边
  ctx.strokeStyle = '#FFB6C1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-6, 15);
  ctx.bezierCurveTo(-3, 13, 3, 13, 6, 15);
  ctx.stroke();

  // 鞋子
  const shoeGrad = ctx.createLinearGradient(0, 40, 0, 48);
  shoeGrad.addColorStop(0, COLORS.shoeBrown);
  shoeGrad.addColorStop(1, COLORS.shoeBrownDark);

  ctx.fillStyle = shoeGrad;
  ctx.strokeStyle = COLORS.shoeBrownDark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-7, 40);
  ctx.bezierCurveTo(-9, 42, -10, 45, -8, 47);
  ctx.lineTo(8, 47);
  ctx.bezierCurveTo(10, 45, 9, 42, 7, 40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 鞋子高光
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(0, 43, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBody(ctx) {
  ctx.save();

  // 身体渐变
  const bodyGrad = ctx.createLinearGradient(-22, -25, 22, 5);
  bodyGrad.addColorStop(0, COLORS.sailorWhite);
  bodyGrad.addColorStop(1, '#F8F8FF');

  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = COLORS.sailorStroke;
  ctx.lineWidth = 1.2;

  // 身体轮廓
  ctx.beginPath();
  ctx.moveTo(-22, -25);
  ctx.bezierCurveTo(-24, -20, -23, -5, -21, 5);
  ctx.lineTo(21, 5);
  ctx.bezierCurveTo(23, -5, 24, -20, 22, -25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 水手服领子
  const collarGrad = ctx.createLinearGradient(0, -28, 0, -15);
  collarGrad.addColorStop(0, COLORS.sailorBlueLight);
  collarGrad.addColorStop(1, COLORS.sailorBlue);

  ctx.fillStyle = collarGrad;
  ctx.strokeStyle = COLORS.sailorBlueDark;
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(-22, -25);
  ctx.bezierCurveTo(-18, -22, -10, -18, 0, -16);
  ctx.bezierCurveTo(10, -18, 18, -22, 22, -25);
  ctx.lineTo(20, -28);
  ctx.bezierCurveTo(15, -26, 8, -24, 0, -22);
  ctx.bezierCurveTo(-8, -24, -15, -26, -20, -28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 领子白色条纹
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-16, -23);
  ctx.bezierCurveTo(-8, -20, 8, -20, 16, -23);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-14, -21);
  ctx.bezierCurveTo(-7, -19, 7, -19, 14, -21);
  ctx.stroke();

  // 蝴蝶结
  drawBow(ctx, 0, -20);

  ctx.restore();
}

function drawBow(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);

  const bowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
  bowGrad.addColorStop(0, COLORS.bowPink);
  bowGrad.addColorStop(1, COLORS.bowPinkDark);

  // 左翼
  ctx.fillStyle = bowGrad;
  ctx.strokeStyle = COLORS.bowPinkDark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-5, -4, -14, -6, -12, -1);
  ctx.bezierCurveTo(-10, 3, -5, 4, 0, 0);
  ctx.fill();
  ctx.stroke();

  // 右翼
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(5, -4, 14, -6, 12, -1);
  ctx.bezierCurveTo(10, 3, 5, 4, 0, 0);
  ctx.fill();
  ctx.stroke();

  // 中心结
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(-5, -2, 3, 1.5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSkirt(ctx) {
  const skirtGrad = ctx.createLinearGradient(0, 5, 0, 35);
  skirtGrad.addColorStop(0, COLORS.sailorBlue);
  skirtGrad.addColorStop(1, COLORS.sailorBlueDark);

  ctx.fillStyle = skirtGrad;
  ctx.strokeStyle = COLORS.sailorBlueDark;
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(-21, 5);
  ctx.bezierCurveTo(-25, 12, -30, 22, -28, 30);
  ctx.bezierCurveTo(-26, 33, -10, 35, 0, 35);
  ctx.bezierCurveTo(10, 35, 26, 33, 28, 30);
  ctx.bezierCurveTo(30, 22, 25, 12, 21, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 褶皱
  ctx.strokeStyle = COLORS.sailorBlueDark;
  ctx.lineWidth = 0.8;
  for (let i = -18; i <= 18; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, 6);
    ctx.bezierCurveTo(i + (i > 0 ? 3 : -3), 15, i + (i > 0 ? 5 : -5), 25, i + (i > 0 ? 4 : -4), 34);
    ctx.stroke();
  }

  // 裙摆花边
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-27, 31);
  ctx.bezierCurveTo(-20, 34, -10, 36, 0, 36);
  ctx.bezierCurveTo(10, 36, 20, 34, 27, 31);
  ctx.stroke();
}

function drawArm(ctx, side) {
  const x = side * 27;
  ctx.save();
  ctx.translate(x, -8);

  // 袖子（白色）
  const sleeveGrad = ctx.createLinearGradient(-8, -3, 8, 10);
  sleeveGrad.addColorStop(0, COLORS.sailorWhite);
  sleeveGrad.addColorStop(1, '#F8F8FF');

  ctx.fillStyle = sleeveGrad;
  ctx.strokeStyle = COLORS.sailorStroke;
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(-7, -3);
  ctx.bezierCurveTo(-9, 2, -10, 8, -8, 12);
  ctx.lineTo(8, 12);
  ctx.bezierCurveTo(10, 8, 9, 2, 7, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 手臂（皮肤）
  const armGrad = ctx.createLinearGradient(0, 12, 0, 32);
  armGrad.addColorStop(0, COLORS.skinLight);
  armGrad.addColorStop(1, COLORS.skin);

  ctx.fillStyle = armGrad;
  ctx.strokeStyle = COLORS.skinStroke;
  ctx.beginPath();
  ctx.moveTo(-5, 12);
  ctx.bezierCurveTo(-6, 18, -5, 25, -3, 30);
  ctx.lineTo(3, 30);
  ctx.bezierCurveTo(5, 25, 6, 18, 5, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 手
  ctx.fillStyle = COLORS.skin;
  ctx.beginPath();
  ctx.ellipse(0, 33, 4.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 手指细节
  ctx.strokeStyle = COLORS.skinStroke;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-2, 30);
  ctx.lineTo(-3, 35);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 30);
  ctx.lineTo(0, 36);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(2, 30);
  ctx.lineTo(2, 35);
  ctx.stroke();

  ctx.restore();
}

function drawHead(ctx, headAngle, eyeScale, eyePupilY, mouthOpen, isBlinking, physics) {
  const earL = (physics.earLeft || 0) * 0.5;
  const earR = (physics.earRight || 0) * 0.5;
  const hairL = (physics.hairLeft || 0) * 0.3;
  const hairR = (physics.hairRight || 0) * 0.3;

  ctx.save();
  ctx.translate(0, -50);
  ctx.rotate(headAngle * Math.PI / 180);

  // === 后发 ===
  drawBackHair(ctx, hairL, hairR);

  // === 猫耳 ===
  drawEar(ctx, -20, -38, earL, -1);
  drawEar(ctx, 20, -38, earR, 1);

  // === 头部 ===
  drawFace(ctx);

  // === 前发（刘海）===
  drawBangs(ctx);

  // === 侧发 ===
  drawSideHair(ctx, hairL, hairR);

  // === 眼睛 ===
  drawAnimeEye(ctx, -12, -2, eyeScale.left, eyePupilY, isBlinking);
  drawAnimeEye(ctx, 12, -2, eyeScale.right, eyePupilY, isBlinking);

  // === 鼻子 ===
  ctx.fillStyle = COLORS.nose;
  ctx.beginPath();
  ctx.ellipse(0, 6, 1.8, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // === 嘴巴 ===
  drawMouth(ctx, mouthOpen);

  // === 腮红 ===
  drawBlush(ctx, -18, 8);
  drawBlush(ctx, 18, 8);

  ctx.restore();
}

function drawBackHair(ctx, angleL, angleR) {
  const grad = ctx.createLinearGradient(0, -50, 0, 60);
  grad.addColorStop(0, COLORS.hairLight);
  grad.addColorStop(0.3, COLORS.hair);
  grad.addColorStop(1, COLORS.hairDark);

  ctx.fillStyle = grad;
  ctx.strokeStyle = COLORS.hairStroke;
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(-34, -10);
  ctx.bezierCurveTo(-37, -25, -32, -52, -20, -58);
  ctx.bezierCurveTo(-10, -62, 10, -62, 20, -58);
  ctx.bezierCurveTo(32, -52, 37, -25, 34, -10);
  ctx.bezierCurveTo(36, 10, 34, 35, 30, 55);
  ctx.bezierCurveTo(26, 68, 18, 75, 0, 78);
  ctx.bezierCurveTo(-18, 75, -26, 68, -30, 55);
  ctx.bezierCurveTo(-34, 35, -36, 10, -34, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 发丝纹理
  ctx.strokeStyle = 'rgba(200,200,210,0.3)';
  ctx.lineWidth = 0.8;
  for (let i = -20; i <= 20; i += 10) {
    ctx.beginPath();
    ctx.moveTo(i, -10);
    ctx.bezierCurveTo(i + 3, 20, i - 2, 45, i + 1, 70);
    ctx.stroke();
  }
}

function drawEar(ctx, x, y, angle, side) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle * Math.PI / 180);

  // 外耳
  const earGrad = ctx.createLinearGradient(0, 5, 0, -25);
  earGrad.addColorStop(0, COLORS.hair);
  earGrad.addColorStop(1, COLORS.hairLight);

  ctx.fillStyle = earGrad;
  ctx.strokeStyle = COLORS.hairStroke;
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(-5 * side, 5);
  ctx.bezierCurveTo(-8 * side, -5, -12 * side, -20, -6 * side, -28);
  ctx.bezierCurveTo(-2 * side, -32, 2 * side, -28, 3 * side, -20);
  ctx.bezierCurveTo(4 * side, -10, 3 * side, 0, -5 * side, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 内耳
  const innerGrad = ctx.createLinearGradient(0, 3, 0, -22);
  innerGrad.addColorStop(0, COLORS.earInner);
  innerGrad.addColorStop(1, '#FFD1DC');

  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.moveTo(-3 * side, 3);
  ctx.bezierCurveTo(-6 * side, -5, -9 * side, -16, -5 * side, -24);
  ctx.bezierCurveTo(-2 * side, -27, 1 * side, -24, 2 * side, -16);
  ctx.bezierCurveTo(3 * side, -8, 2 * side, 0, -3 * side, 3);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawFace(ctx) {
  // 脸部渐变
  const faceGrad = ctx.createRadialGradient(0, -5, 5, 0, -5, 30);
  faceGrad.addColorStop(0, COLORS.skinLight);
  faceGrad.addColorStop(1, COLORS.skin);

  ctx.fillStyle = faceGrad;
  ctx.strokeStyle = COLORS.skinStroke;
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(-26, -20);
  ctx.bezierCurveTo(-28, -32, -24, -45, -14, -50);
  ctx.bezierCurveTo(-6, -54, 6, -54, 14, -50);
  ctx.bezierCurveTo(24, -45, 28, -32, 26, -20);
  ctx.bezierCurveTo(28, -8, 26, 5, 20, 13);
  ctx.bezierCurveTo(14, 19, 6, 22, 0, 22);
  ctx.bezierCurveTo(-6, 22, -14, 19, -20, 13);
  ctx.bezierCurveTo(-26, 5, -28, -8, -26, -20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawBangs(ctx) {
  const bangGrad = ctx.createLinearGradient(0, -55, 0, -10);
  bangGrad.addColorStop(0, COLORS.hairLight);
  bangGrad.addColorStop(0.5, COLORS.hair);
  bangGrad.addColorStop(1, COLORS.hairMid);

  ctx.fillStyle = bangGrad;
  ctx.strokeStyle = COLORS.hairStroke;
  ctx.lineWidth = 1;

  // 主刘海
  ctx.beginPath();
  ctx.moveTo(-28, -28);
  ctx.bezierCurveTo(-30, -40, -26, -55, -16, -58);
  ctx.bezierCurveTo(-10, -60, -6, -55, -8, -45);
  ctx.lineTo(-5, -35);
  ctx.bezierCurveTo(-3, -48, -1, -56, 1, -58);
  ctx.bezierCurveTo(3, -56, 5, -48, 7, -35);
  ctx.lineTo(10, -45);
  ctx.bezierCurveTo(12, -55, 16, -60, 22, -55);
  ctx.bezierCurveTo(28, -50, 30, -40, 28, -28);
  ctx.bezierCurveTo(26, -22, 22, -17, 18, -15);
  ctx.bezierCurveTo(12, -12, 6, -10, 0, -10);
  ctx.bezierCurveTo(-6, -10, -12, -12, -18, -15);
  ctx.bezierCurveTo(-22, -17, -26, -22, -28, -28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 刘海高光
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.ellipse(-10, -40, 8, 4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10, -38, 6, 3, 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawSideHair(ctx, angleL, angleR) {
  // 左侧发
  ctx.save();
  ctx.translate(-30, -8);
  ctx.rotate(angleL * Math.PI / 180);

  const sideGrad = ctx.createLinearGradient(0, -10, 0, 50);
  sideGrad.addColorStop(0, COLORS.hairMid);
  sideGrad.addColorStop(1, COLORS.hairDark);

  ctx.fillStyle = sideGrad;
  ctx.strokeStyle = COLORS.hairStroke;
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(-3, -8);
  ctx.bezierCurveTo(-6, 0, -7, 15, -5, 30);
  ctx.bezierCurveTo(-3, 42, -1, 48, 1, 45);
  ctx.bezierCurveTo(3, 40, 2, 25, 1, 10);
  ctx.bezierCurveTo(0, 0, -1, -8, -3, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 右侧发
  ctx.save();
  ctx.translate(30, -8);
  ctx.rotate(angleR * Math.PI / 180);

  ctx.fillStyle = sideGrad;
  ctx.beginPath();
  ctx.moveTo(3, -8);
  ctx.bezierCurveTo(6, 0, 7, 15, 5, 30);
  ctx.bezierCurveTo(3, 42, 1, 48, -1, 45);
  ctx.bezierCurveTo(-3, 40, -2, 25, -1, 10);
  ctx.bezierCurveTo(0, 0, 1, -8, 3, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawAnimeEye(ctx, x, y, scaleY, pupilY, isBlinking) {
  ctx.save();
  ctx.translate(x, y);

  if (isBlinking) {
    ctx.strokeStyle = COLORS.eyeOutline;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.bezierCurveTo(-4, 4, 4, 4, 8, 0);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.scale(1, scaleY);

  // 眼白
  ctx.fillStyle = COLORS.eyeWhite;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // 虹膜渐变
  const irisGrad = ctx.createRadialGradient(0, pupilY + 1, 0, 0, pupilY + 1, 9);
  irisGrad.addColorStop(0, COLORS.eyeIrisInner);
  irisGrad.addColorStop(0.4, COLORS.eyeIrisMid);
  irisGrad.addColorStop(0.7, COLORS.eyeIrisOuter);
  irisGrad.addColorStop(1, COLORS.eyePupil);

  ctx.fillStyle = irisGrad;
  ctx.beginPath();
  ctx.ellipse(0, pupilY + 1, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // 瞳孔
  ctx.fillStyle = COLORS.eyePupil;
  ctx.beginPath();
  ctx.ellipse(0, pupilY + 2, 4, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 主高光
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.ellipse(-3.5, -5, 3.5, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // 副高光
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.ellipse(2.5, 3, 2, 2.5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // 第三高光（小点）
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(-1, 5, 1, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 眼睛轮廓
  ctx.strokeStyle = COLORS.eyeOutline;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 13, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 上眼睑（加粗）
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 13, 0, -Math.PI * 0.9, -Math.PI * 0.1);
  ctx.stroke();

  // 下眼睑（细线）
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(74,59,107,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 13, 0, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  // 睫毛
  ctx.strokeStyle = COLORS.eyeUpperLid;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  // 左睫毛
  ctx.beginPath();
  ctx.moveTo(-9, -8);
  ctx.lineTo(-11, -12);
  ctx.stroke();
  // 右睫毛
  ctx.beginPath();
  ctx.moveTo(9, -8);
  ctx.lineTo(11, -12);
  ctx.stroke();

  ctx.restore();
}

function drawMouth(ctx, open) {
  if (open > 0.1) {
    // 张嘴
    ctx.fillStyle = COLORS.mouthInner;
    ctx.beginPath();
    ctx.ellipse(0, 14, 4.5, 3.5 * open, 0, 0, Math.PI * 2);
    ctx.fill();

    // 舌头
    if (open > 0.3) {
      ctx.fillStyle = '#FF9999';
      ctx.beginPath();
      ctx.ellipse(0, 15, 3, 2 * open, 0, 0, Math.PI);
      ctx.fill();
    }

    // 嘴唇轮廓
    ctx.strokeStyle = COLORS.mouthPink;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 14, 4.5, 3.5 * open, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // 闭嘴微笑
    ctx.strokeStyle = COLORS.mouthPink;
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-5, 13);
    ctx.bezierCurveTo(-2, 17, 2, 17, 5, 13);
    ctx.stroke();
  }
}

function drawBlush(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);

  // 腮红渐变
  const blushGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
  blushGrad.addColorStop(0, 'rgba(255,150,170,0.5)');
  blushGrad.addColorStop(1, 'rgba(255,150,170,0)');

  ctx.fillStyle = blushGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function createBaiyuSkeleton() {
  const { Skeleton } = require('./skeleton');
  const skeleton = new Skeleton();
  skeleton.addBone('body', 0, -60, 'root');
  skeleton.addBone('head', 0, -50, 'body');
  skeleton.addBone('earLeft', -20, -38, 'head');
  skeleton.addBone('earRight', 20, -38, 'head');
  skeleton.addBone('hairLeft', -30, -8, 'head');
  skeleton.addBone('hairRight', 30, -8, 'head');
  skeleton.addBone('tail1', 24, 15, 'body');
  skeleton.addBone('tail2', 15, 15, 'tail1');
  skeleton.addBone('tail3', 10, 12, 'tail2');
  return skeleton;
}

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
