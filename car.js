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

  move(road_mult = 0.98, c = null) {
    let target = createVector(0, 0);
    if (c != null) {
      const p3 = path.draw_points[(c + 3) % path.draw_points.length];
      target = p5.Vector.sub(p3, this.pos);
    }
    this.acc.add(vsub(target, this.vel));
    this.vel.mult(road_mult);
    this.acc.mult(0.5);

    this.vel.add(this.acc);
    this.vel.limit(1);
    this.pos.add(this.vel);
  }

  drawArrow(base, vec, myColor) {
    push();
    stroke(myColor);
    strokeWeight(3);
    fill(myColor);
    translate(base.x, base.y);
    line(0, 0, vec.x, vec.y);
    rotate(vec.heading());
    let arrowSize = 7;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }

  draw_big() {
    push();
    rect(0, height - ground_height, 100, 30);
    pop();
  }

  draw() {
    push();
    scale(sc);
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    rect(-this.w / 2, -this.h / 2, this.w, this.h);
    fill(200, 10, 200);
    rect(-this.w / 2, -this.h / 2, this.w, this.h / 10);
    pop();
  }
}
