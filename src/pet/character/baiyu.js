const { Skeleton } = require('./skeleton');

function createBaiyuSkeleton() {
  const skeleton = new Skeleton();
  skeleton.addBone('body', 0, -60, 'root');
  skeleton.addBone('head', 0, -50, 'body');
  skeleton.addBone('earLeft', -18, -35, 'head');
  skeleton.addBone('earRight', 18, -35, 'head');
  skeleton.addBone('hairBack', 0, -10, 'head');
  skeleton.addBone('hairFront', 0, -30, 'head');
  skeleton.addBone('hairLeft', -30, -10, 'head');
  skeleton.addBone('hairRight', 30, -10, 'head');
  skeleton.addBone('eyeLeft', -10, -5, 'head');
  skeleton.addBone('eyeRight', 10, -5, 'head');
  skeleton.addBone('mouth', 0, 10, 'head');
  skeleton.addBone('blushLeft', -16, 3, 'head');
  skeleton.addBone('blushRight', 16, 3, 'head');
  skeleton.addBone('armLeft', -25, -10, 'body');
  skeleton.addBone('armRight', 25, -10, 'body');
  skeleton.addBone('skirt', 0, 15, 'body');
  skeleton.addBone('legLeft', -10, 50, 'body');
  skeleton.addBone('legRight', 10, 50, 'body');
  skeleton.addBone('tail1', 20, 10, 'body');
  skeleton.addBone('tail2', 15, 15, 'tail1');
  skeleton.addBone('tail3', 10, 12, 'tail2');
  return skeleton;
}

const BAIYU_PARTS = {
  // 头发后层 - 长白发
  hairBack: {
    fill: '#F5F5F5', stroke: '#D8D8D8',
    path: 'M-32,-15 C-35,-30 -30,-55 -18,-60 C-8,-63 8,-63 18,-60 C30,-55 35,-30 32,-15 C35,5 33,30 28,50 C23,62 15,70 0,72 C-15,70 -23,62 -28,50 C-33,30 -35,5 -32,-15 Z'
  },

  // 身体 - 水手服
  body: {
    fill: '#FFFFFF', stroke: '#E0E0E0',
    path: 'M-20,-25 L-22,-20 L-20,0 L-18,20 L-15,25 L15,25 L18,20 L20,0 L22,-20 L20,-25 Z'
  },
  // 水手服领子
  collar: {
    fill: '#4A90D9', stroke: '#3A7BC8',
    path: 'M-20,-25 L-15,-20 L0,-15 L15,-20 L20,-25 L18,-28 L10,-25 L0,-22 L-10,-25 L-18,-28 Z'
  },
  // 蝴蝶结
  bow: {
    fill: '#FF69B4', stroke: '#E55A9E',
    path: 'M-6,-2 C-8,-6 -12,-8 -10,-4 C-8,0 -4,2 0,0 C4,2 8,0 10,-4 C12,-8 8,-6 6,-2 C4,2 0,4 -4,2 Z'
  },
  // 裙子
  skirt: {
    fill: '#4A90D9', stroke: '#3A7BC8',
    path: 'M-18,0 C-22,10 -28,25 -25,30 L25,30 C28,25 22,10 18,0 Z'
  },

  // 头部
  head: {
    fill: '#FFFAF0', stroke: '#F0D0B0',
    path: 'M-24,-22 C-26,-32 -22,-42 -12,-48 C-4,-52 4,-52 12,-48 C22,-42 26,-32 24,-22 C26,-12 24,2 18,10 C12,16 4,20 0,20 C-4,20 -12,16 -18,10 C-24,2 -26,-12 -24,-22 Z'
  },

  // 猫耳
  earLeft: {
    fill: '#FFFFFF', stroke: '#F0D0B0', innerFill: '#FFD1DC',
    path: 'M-6,2 C-8,-2 -14,-22 -10,-28 C-6,-32 -2,-28 0,-20 C2,-12 0,-4 -6,2 Z',
    innerPath: 'M-5,0 C-7,-3 -12,-18 -9,-24 C-6,-27 -3,-24 -1,-18 C0,-12 -1,-5 -5,0 Z'
  },
  earRight: {
    fill: '#FFFFFF', stroke: '#F0D0B0', innerFill: '#FFD1DC',
    path: 'M6,2 C8,-2 14,-22 10,-28 C6,-32 2,-28 0,-20 C-2,-12 0,-4 6,2 Z',
    innerPath: 'M5,0 C7,-3 12,-18 9,-24 C6,-27 3,-24 1,-18 C0,-12 1,-5 5,0 Z'
  },

  // 刘海
  hairFront: {
    fill: '#F8F8F8', stroke: '#E0E0E0',
    path: 'M-26,-28 C-28,-38 -24,-52 -14,-55 C-8,-57 -4,-52 -6,-42 L-4,-35 C-2,-45 0,-52 2,-55 C4,-52 6,-42 8,-35 L10,-42 C12,-52 16,-55 22,-52 C28,-48 30,-38 28,-28 C26,-22 22,-18 18,-16 C12,-14 6,-12 0,-12 C-6,-12 -12,-14 -18,-16 C-22,-18 -26,-22 -26,-28 Z'
  },
  // 左侧发丝
  hairLeft: {
    fill: '#F0F0F0', stroke: '#D8D8D8',
    path: 'M-26,-15 C-30,-8 -34,5 -32,20 C-30,32 -26,42 -22,48 C-18,52 -14,48 -16,38 C-18,28 -20,15 -22,5 C-24,-5 -26,-12 -26,-15 Z'
  },
  // 右侧发丝
  hairRight: {
    fill: '#F0F0F0', stroke: '#D8D8D8',
    path: 'M26,-15 C30,-8 34,5 32,20 C30,32 26,42 22,48 C18,52 14,48 16,38 C18,28 20,15 22,5 C24,-5 26,-12 26,-15 Z'
  },

  // 眼睛 - 大萌眼
  eyeLeft: { fill: '#7B68AE', highlight: '#FFFFFF', draw: 'eye' },
  eyeRight: { fill: '#7B68AE', highlight: '#FFFFFF', draw: 'eye' },
  mouth: { fill: '#FF69B4', draw: 'mouth' },
  blushLeft: { fill: 'rgba(255,182,193,0.5)', draw: 'blush' },
  blushRight: { fill: 'rgba(255,182,193,0.5)', draw: 'blush' },

  // 手臂
  armLeft: {
    fill: '#FFFAF0', stroke: '#F0D0B0',
    path: 'M-2,-5 C-6,-4 -14,0 -14,12 C-14,20 -10,26 -6,28 C-2,30 0,26 0,20 C0,14 -2,8 -2,-5 Z'
  },
  armRight: {
    fill: '#FFFAF0', stroke: '#F0D0B0',
    path: 'M2,-5 C6,-4 14,0 14,12 C14,20 10,26 6,28 C2,30 0,26 0,20 C0,14 2,8 2,-5 Z'
  },

  // 腿
  legLeft: {
    fill: '#FFFAF0', stroke: '#F0D0B0',
    path: 'M-6,0 C-8,5 -10,15 -10,25 C-10,30 -8,32 -4,32 L4,32 C6,32 8,30 8,25 C8,15 6,5 4,0 Z'
  },
  legRight: {
    fill: '#FFFAF0', stroke: '#F0D0B0',
    path: 'M-4,0 C-6,5 -8,15 -8,25 C-8,30 -6,32 -2,32 L6,32 C8,32 10,30 10,25 C10,15 8,5 6,0 Z'
  },
  // 鞋子
  shoeLeft: {
    fill: '#8B4513', stroke: '#6B3410',
    path: 'M-8,30 C-10,32 -12,34 -10,36 L6,36 C8,36 10,34 8,32 L6,30 Z'
  },
  shoeRight: {
    fill: '#8B4513', stroke: '#6B3410',
    path: 'M-6,30 C-8,32 -10,34 -8,36 L8,36 C10,36 12,34 10,32 L8,30 Z'
  },

  // 猫尾巴
  tail1: { fill: '#F5F5F5', stroke: '#D8D8D8', path: 'M-3,0 C-5,6 -7,14 -4,20 L4,20 C7,14 5,6 3,0 Z' },
  tail2: { fill: '#EEEEEE', stroke: '#D0D0D0', path: 'M-3,0 C-4,5 -6,12 -3,18 L3,18 C6,12 4,5 3,0 Z' },
  tail3: { fill: '#E8E8E8', stroke: '#C8C8C8', path: 'M-2,0 C-3,4 -5,10 -2,15 L2,15 C5,10 3,4 2,0 Z' }
};

const EXPRESSIONS = {
  default: {
    eyeLeft: { scaleY: 1, pupilY: 0 },
    eyeRight: { scaleY: 1, pupilY: 0 },
    mouth: { path: 'M-4,0 C-2,3 2,3 4,0', open: 0 }
  },
  happy: {
    eyeLeft: { scaleY: 0.5, pupilY: 0 },
    eyeRight: { scaleY: 0.5, pupilY: 0 },
    mouth: { path: 'M-5,0 C-3,5 3,5 5,0', open: 0.4 }
  },
  sleepy: {
    eyeLeft: { scaleY: 0.3, pupilY: 2 },
    eyeRight: { scaleY: 0.3, pupilY: 2 },
    mouth: { path: 'M-3,0 C-1,2 1,2 3,0', open: 0.5 }
  },
  surprised: {
    eyeLeft: { scaleY: 1.3, pupilY: -1 },
    eyeRight: { scaleY: 1.3, pupilY: -1 },
    mouth: { path: 'M-3,0 C-3,5 3,5 3,0', open: 0.9 }
  },
  shy: {
    eyeLeft: { scaleY: 0.4, pupilY: 1 },
    eyeRight: { scaleY: 0.4, pupilY: 1 },
    mouth: { path: 'M-3,0 C-1,2 1,2 3,0', open: 0 }
  },
  curious: {
    eyeLeft: { scaleY: 1.2, pupilY: -1 },
    eyeRight: { scaleY: 1.2, pupilY: -1 },
    mouth: { path: 'M-3,0 C-1,2 1,2 3,0', open: 0.3 }
  },
  sleeping: {
    eyeLeft: { scaleY: 0, pupilY: 0 },
    eyeRight: { scaleY: 0, pupilY: 0 },
    mouth: { path: 'M-2,0 C-1,1 1,1 2,0', open: 0 }
  }
};

module.exports = { createBaiyuSkeleton, BAIYU_PARTS, EXPRESSIONS };
