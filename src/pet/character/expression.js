class ExpressionSystem {
  constructor() {
    this.current = 'default';
    this.target = 'default';
    this.progress = 1;
    this.speed = 0.1;
    this.blendValues = {};
  }

  setExpression(name, speed = 0.1) {
    if (this.current === name && this.target === name) return;
    this.target = name;
    this.progress = 0;
    this.speed = speed;
  }

  update(expressions) {
    if (this.progress < 1) {
      this.progress = Math.min(1, this.progress + this.speed);
    }
    if (this.progress >= 1 && this.current !== this.target) {
      this.current = this.target;
    }

    const currentExpr = expressions[this.current] || expressions.default;
    const targetExpr = expressions[this.target] || expressions.default;

    this.blendValues = {
      eyeLeft: {
        scaleY: this.lerp(currentExpr.eyeLeft.scaleY, targetExpr.eyeLeft.scaleY, this.progress),
        pupilY: this.lerp(currentExpr.eyeLeft.pupilY, targetExpr.eyeLeft.pupilY, this.progress)
      },
      eyeRight: {
        scaleY: this.lerp(currentExpr.eyeRight.scaleY, targetExpr.eyeRight.scaleY, this.progress),
        pupilY: this.lerp(currentExpr.eyeRight.pupilY, targetExpr.eyeRight.pupilY, this.progress)
      },
      mouth: {
        open: this.lerp(currentExpr.mouth.open, targetExpr.mouth.open, this.progress)
      }
    };
    return this.blendValues;
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }
}

module.exports = { ExpressionSystem };
