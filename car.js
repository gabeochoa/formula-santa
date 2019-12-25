class Car {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.angle = 0;
    this.w = 10;
    this.h = 20;
  }

  m_input(x, y) {
    const MAX_ACCEL = 0.05;
    const TURN_ANGLE = 0.05;
    const i = createVector(0, y).mult(MAX_ACCEL);

    if (x != 0) {
      this.angle += x * TURN_ANGLE;
    }
    i.rotate(this.angle);
    this.acc.add(i);
    this.acc.limit(1);
  }

  move(road_mult = 0.98) {
    this.vel.mult(road_mult);
    this.acc.mult(0.5);

    this.vel.add(this.acc);
    this.vel.limit(1);
    this.pos.add(this.vel);
  }

  draw() {
    push();
    scale(sc);
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    rect(-this.w / 2, -this.h / 2, this.w, this.h);
    pop();
  }
}
