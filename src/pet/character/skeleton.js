class Bone {
  constructor(name, x, y, parent = null) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.parent = parent;
    this.children = [];
    this.worldX = 0;
    this.worldY = 0;
    this.worldRotation = 0;
  }

  addChild(child) {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  updateWorldTransform() {
    if (this.parent) {
      const rad = this.parent.worldRotation * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      this.worldX = this.parent.worldX + (this.x * cos - this.y * sin);
      this.worldY = this.parent.worldY + (this.x * sin + this.y * cos);
      this.worldRotation = this.parent.worldRotation + this.rotation;
    } else {
      this.worldX = this.x;
      this.worldY = this.y;
      this.worldRotation = this.rotation;
    }
    for (const child of this.children) {
      child.updateWorldTransform();
    }
  }
}

class Skeleton {
  constructor() {
    this.root = new Bone('root', 0, 0);
    this.bones = new Map();
    this.bones.set('root', this.root);
  }

  addBone(name, x, y, parentName = 'root') {
    const parent = this.bones.get(parentName);
    const bone = new Bone(name, x, y, parent);
    parent.addChild(bone);
    this.bones.set(name, bone);
    return bone;
  }

  getBone(name) {
    return this.bones.get(name);
  }

  update() {
    this.root.updateWorldTransform();
  }
}

module.exports = { Skeleton, Bone };
