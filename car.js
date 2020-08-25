class Car {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.angle = 0;
    this.w = 10;
    this.h = 20;
  }

  serialize(o) {
    if (o === undefined) {
      return JSON.stringify({
        pos: this.serialize(this.pos),
        vel: this.serialize(this.vel),
        acc: this.serialize(this.acc),
        angle: this.angle
      });
    }
    if (typeof o === "object") {
      return [o.x, o.y];
    }
  }

  to_vec(a) {
    return createVector(a[0], a[1]);
  }

  deserialize(d) {
    const data = JSON.parse(d);
    this.pos = this.to_vec(data["pos"]);
    this.vel = this.to_vec(data["vel"]);
    this.acc = this.to_vec(data["acc"]);
    this.angle = data["angle"];
  }

  turn(dir){
    const TURN_ANGLE = 0.05;
    this.angle += dir * TURN_ANGLE
    if(this.angle > TWO_PI || this.angle < -TWO_PI){
      this.angle *= -1
    }
  }

  m_input(x, y) {
    const MAX_ACCEL = 0.05;
    const i = createVector(0, y).mult(MAX_ACCEL);
    if (x != 0) {
      this.turn(x)
    }
    i.rotate(this.angle);
    this.acc.add(i);
    this.acc.limit(1);
  }

  move(path, road_mult = 0.98, c = null) {
    let target = createVector(0, 0);
    if (c != null) {
      const p3 = path.draw_points[(c + 3) % path.draw_points.length];
      target = p5.Vector.sub(p3, this.pos);
      this.acc.add(vsub(target, this.vel));
    }
    this.vel.mult(road_mult);
    this.acc.mult(0.5);
    this.vel.add(this.acc);
    this.vel.limit(1);
    this.pos.add(this.vel);
  }

  draw_big() {
    rect(0, height - ground_height, 100, 30);
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
