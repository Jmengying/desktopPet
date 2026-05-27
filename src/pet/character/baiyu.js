const { Skeleton } = require('./skeleton');

function createBaiyuSkeleton() {
  const skeleton = new Skeleton();
  skeleton.addBone('body', 0, -80, 'root');
  skeleton.addBone('head', 0, -60, 'body');
  skeleton.addBone('earLeft', -20, -25, 'head');
  skeleton.addBone('earRight', 20, -25, 'head');
  skeleton.addBone('hairBack', 0, -10, 'head');
  skeleton.addBone('hairFront', 0, -20, 'head');
  skeleton.addBone('hairLeft', -25, -5, 'head');
  skeleton.addBone('hairRight', 25, -5, 'head');
  skeleton.addBone('eyeLeft', -12, -5, 'head');
  skeleton.addBone('eyeRight', 12, -5, 'head');
  skeleton.addBone('mouth', 0, 8, 'head');
  skeleton.addBone('blushLeft', -18, 2, 'head');
  skeleton.addBone('blushRight', 18, 2, 'head');
  skeleton.addBone('armLeft', -30, -20, 'body');
  skeleton.addBone('armRight', 30, -20, 'body');
  skeleton.addBone('tail1', 15, 20, 'body');
  skeleton.addBone('tail2', 10, 15, 'tail1');
  skeleton.addBone('tail3', 5, 10, 'tail2');
  return skeleton;
}

const BAIYU_PARTS = {
  body: {
    fill: '#FFF5F5', stroke: '#FFB6C1',
    path: 'M-18,-40 C-20,-45 -22,-50 -18,-55 L18,-55 C22,-50 20,-45 18,-40 L20,0 C20,5 15,10 0,10 C-15,10 -20,5 -20,0 Z'
  },
  head: {
    fill: '#FFFAF0', stroke: '#FFB6C1',
    path: 'M-25,-20 C-28,-30 -25,-40 -15,-45 C-5,-50 5,-50 15,-45 C25,-40 28,-30 25,-20 C28,-10 25,5 15,12 C5,18 -5,18 -15,12 C-25,5 -28,-10 -25,-20 Z'
  },
  earLeft: {
    fill: '#FFFFFF', stroke: '#FFB6C1', innerFill: '#FFD1DC',
    path: 'M-5,0 L-12,-20 L0,-18 Z',
    innerPath: 'M-4,-2 L-10,-16 L-1,-15 Z'
  },
  earRight: {
    fill: '#FFFFFF', stroke: '#FFB6C1', innerFill: '#FFD1DC',
    path: 'M5,0 L12,-20 L0,-18 Z',
    innerPath: 'M4,-2 L10,-16 L1,-15 Z'
  },
  eyeLeft: { fill: '#6B5B95', highlight: '#FFFFFF', draw: 'eye' },
  eyeRight: { fill: '#6B5B95', highlight: '#FFFFFF', draw: 'eye' },
  mouth: { fill: '#FF69B4', draw: 'mouth' },
  blushLeft: { fill: 'rgba(255,182,193,0.4)', draw: 'blush' },
  blushRight: { fill: 'rgba(255,182,193,0.4)', draw: 'blush' },
  armLeft: {
    fill: '#FFFAF0', stroke: '#FFB6C1',
    path: 'M0,-5 C-5,-5 -12,0 -10,15 C-8,20 -2,22 0,18 C2,22 8,20 10,15 C12,0 5,-5 0,-5 Z'
  },
  armRight: {
    fill: '#FFFAF0', stroke: '#FFB6C1',
    path: 'M0,-5 C-5,-5 -12,0 -10,15 C-8,20 -2,22 0,18 C2,22 8,20 10,15 C12,0 5,-5 0,-5 Z'
  },
  hairFront: {
    fill: '#F0F0F0', stroke: '#D0D0D0',
    path: 'M-28,-25 C-30,-35 -25,-50 -15,-48 C-10,-47 -8,-40 -10,-30 L-8,-25 C-5,-35 -2,-45 0,-48 C2,-45 5,-35 8,-25 L10,-30 C8,-40 10,-47 15,-48 C25,-50 30,-35 28,-25 C25,-20 20,-15 15,-12 C10,-10 5,-8 0,-8 C-5,-8 -10,-10 -15,-12 C-20,-15 -25,-20 -28,-25 Z'
  },
  hairBack: {
    fill: '#E8E8E8', stroke: '#C0C0C0',
    path: 'M-30,-15 C-32,-25 -28,-45 -15,-50 C-5,-53 5,-53 15,-50 C28,-45 32,-25 30,-15 C32,0 30,20 25,35 C20,45 10,50 0,50 C-10,50 -20,45 -25,35 C-30,20 -32,0 -30,-15 Z'
  },
  hairLeft: {
    fill: '#E8E8E8', stroke: '#C0C0C0',
    path: 'M-25,-10 C-28,-5 -30,10 -28,25 C-26,35 -22,40 -18,38 C-15,36 -14,30 -16,20 C-18,10 -20,0 -25,-10 Z'
  },
  hairRight: {
    fill: '#E8E8E8', stroke: '#C0C0C0',
    path: 'M25,-10 C28,-5 30,10 28,25 C26,35 22,40 18,38 C15,36 14,30 16,20 C18,10 20,0 25,-10 Z'
  },
  tail1: { fill: '#F0F0F0', stroke: '#D0D0D0', path: 'M-4,0 C-6,5 -8,12 -5,18 L5,18 C8,12 6,5 4,0 Z' },
  tail2: { fill: '#E8E8E8', stroke: '#C0C0C0', path: 'M-3,0 C-5,4 -7,10 -4,15 L4,15 C7,10 5,4 3,0 Z' },
  tail3: { fill: '#E0E0E0', stroke: '#B0B0B0', path: 'M-2,0 C-4,3 -5,8 -3,12 L3,12 C5,8 4,3 2,0 Z' }
};

const EXPRESSIONS = {
  default: {
    eyeLeft: { scaleY: 1, pupilY: 0 },
    eyeRight: { scaleY: 1, pupilY: 0 },
    mouth: { path: 'M-5,0 C-3,3 3,3 5,0', open: 0 }
  },
  happy: {
    eyeLeft: { scaleY: 0.6, pupilY: 0 },
    eyeRight: { scaleY: 0.6, pupilY: 0 },
    mouth: { path: 'M-6,0 C-4,5 4,5 6,0', open: 0.3 }
  },
  sleepy: {
    eyeLeft: { scaleY: 0.3, pupilY: 2 },
    eyeRight: { scaleY: 0.3, pupilY: 2 },
    mouth: { path: 'M-4,0 C-2,2 2,2 4,0', open: 0.5 }
  },
  surprised: {
    eyeLeft: { scaleY: 1.3, pupilY: -1 },
    eyeRight: { scaleY: 1.3, pupilY: -1 },
    mouth: { path: 'M-3,0 C-3,4 3,4 3,0', open: 0.8 }
  },
  shy: {
    eyeLeft: { scaleY: 0.5, pupilY: 1 },
    eyeRight: { scaleY: 0.5, pupilY: 1 },
    mouth: { path: 'M-3,0 C-1,2 1,2 3,0', open: 0 }
  },
  curious: {
    eyeLeft: { scaleY: 1.1, pupilY: -1 },
    eyeRight: { scaleY: 1.1, pupilY: -1 },
    mouth: { path: 'M-4,0 C-2,2 2,2 4,0', open: 0.2 }
  },
  sleeping: {
    eyeLeft: { scaleY: 0, pupilY: 0 },
    eyeRight: { scaleY: 0, pupilY: 0 },
    mouth: { path: 'M-3,0 C-1,1 1,1 3,0', open: 0 }
  }
};

module.exports = { createBaiyuSkeleton, BAIYU_PARTS, EXPRESSIONS };
