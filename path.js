ROAD_WIDTH = 30;
LINE_SPACE = 10;
class Path {
  constructor() {
    this.points = [];
    this.isClosed = false;
    this.setPoints = false;
    this.redraw = true;
    this.draw_points = [];
  }
  idx(i) {
    return (i + this.points.length) % this.points.length;
  }
  ith(i){
    return this.draw_points[(i + this.draw_points.length) % this.draw_points.length];
  }
  add(v) {
    this.redraw = true;
    const secondlast = this.points[this.points.length - 2].copy();
    const last = this.points[this.points.length - 1].copy();
    const lc = vsub(vmult(last, 2), secondlast);
    const rc = vadd(last, v).mult(0.5);

    this.points.push(lc);
    this.points.push(rc);
    this.points.push(v);

    if (this.setPoints) {
      this.setAffected(this.points.length - 1);
      return;
    }
  }
  get(i) {
    const j = i * 3;
    const p = this.points;
    return [p[j], p[j + 1], p[j + 2], p[this.idx(j + 3)]];
  }
  delete(i) {
    this.redraw = true;
    if (i == 0) {
      if (this.isClosed) {
        this.points[this.idx(-1)] = this.points[2].copy();
      }
      this.points.splice(0, 3);
      return;
    } else if (i == this.points.length - 1 && !this.isClosed) {
      this.points.splice(this.idx(i - 2), 3);
    } else {
      this.points.splice(this.idx(i - 1), 3);
    }
  }
  length() {
    return this.points.length / 3;
  }
  update_point(i, mp) {
    this.redraw = true;
    const delta = mp.copy().sub(this.points[i]);

    if (i % 3 == 0 || !this.setPoints) {
      this.points[i].set(mp);

      if (this.setPoints) {
        this.setAffected(i);
        return;
      }
      if (i % 3 == 0) {
        if (i + 1 < this.points.length || this.isClosed) {
          this.points[this.idx(i + 1)].add(delta);
        }
        if (i - 1 >= 0 || this.isClosed) {
          this.points[this.idx(i - 1)].add(delta);
        }
      } else {
        const npAnchor = (i + 1) % 3 == 0;
        const sibling = this.points[this.idx(npAnchor ? i + 2 : i - 2)];
        const anchor = this.points[this.idx(npAnchor ? i + 1 : i - 1)];
        if (sibling) {
          const distance = anchor
            .copy()
            .sub(sibling)
            .mag();
          const direction = anchor
            .copy()
            .sub(mp)
            .normalize();
          this.sibling = anchor.copy().add(direction.mult(distance));
        }
      }
    }
  }
  toggleClose() {
    this.redraw = true;
    this.isClosed = !this.isClosed;
    if (this.isClosed) {
      const p = this.points;
      this.points.push(
        p[p.length - 1]
          .copy()
          .mult(2)
          .sub(p[p.length - 2])
      );
      this.points.push(
        p[0]
          .copy()
          .mult(2)
          .sub(p[1])
      );
      if (this.setPoints) {
        this.setControlPoints(0);
        this.setControlPoints(this.points.length - 3);
        return;
      }
    } else {
      this.points.pop();
      this.points.pop();
      if (this.setPoints) {
        this.setStartEndPoints();
        return;
      }
    }
  }
  toggleSetPoints() {
    this.redraw = true;
    this.setPoints = !this.setPoints;
    if (this.setPoints) {
      this.setAll();
    }
  }

  setControlPoints(i) {
    this.redraw = true;
    const anchor = this.points[i].copy();
    const dir = createVector(0, 0);
    const neighbor = [0, 0];
    if (i - 3 >= 0 || this.isClosed) {
      const offset = this.points[this.idx(i - 3)].copy().sub(anchor);
      dir.add(offset.normalize());
      neighbor[0] = offset.mag();
    }
    if (i + 3 >= 0 || this.isClosed) {
      const offset = this.points[this.idx(i + 3)].copy().sub(anchor);
      dir.sub(offset.normalize());
      neighbor[1] = -1 * offset.mag();
    }
    dir.normalize();
    for (let j = 0; j < 2; j++) {
      const cind = i + j * 2 - 1;
      if (this.isClosed || (cind >= 0 && cind < this.points.length)) {
        const nd = dir
          .copy()
          .mult(neighbor[j])
          .mult(0.5);
        this.points[this.idx(cind)] = anchor.copy().add(nd);
      }
    }
  }
  setStartEndPoints() {
    this.redraw = true;
    if (this.isClosed) {
      return;
    }
    const first = this.points[0].copy();
    const third = this.points[2].copy();
    this.points[1] = first.add(third).mult(0.5);
    const len = this.points.length;
    this.points[len - 2] = p5.Vector.add(
      this.points[len - 1],
      this.points[len - 3]
    ).mult(0.5);
  }
  setAffected(x) {
    this.redraw = true;
    for (var i = x - 3; i <= x + 3; i += 3) {
      if ((i >= 0 && i < this.points.length) || this.isClosed) {
        this.setControlPoints(i);
      }
    }
    this.setStartEndPoints();
  }
  setAll() {
    for (var i = 0; i < this.points.length; i += 3) {
      this.setControlPoints(i);
    }
    this.setStartEndPoints();
  }
  draw_mini(sc = 0.25) {
    push();
    scale(sc);
    this.draw(false);
    pop();
  }

  draw(editor = true) {
    push();
    if (this.redraw) {
      this.draw_points = this.evenlyspaced(LINE_SPACE, 1);
      const [vert, tri] = this.gen_mesh(ROAD_WIDTH);
      this.vert = vert;
      this.redraw = false;
    }
    if (!editor) {
      push();
      translate(15, 15);
      stroke(0);
      strokeWeight(5);
      for (let i = 0; i < this.vert.length - 1; i += 2) {
        const a = this.vert[i];
        const b = this.vert[i + 1];
        line(a.x, a.y, b.x, b.y);
      }
      pop();
    }

    stroke(90);
    strokeWeight(5);
    for (let i = 0; i < this.vert.length - 1; i += 2) {
      const a = this.vert[i];
      const b = this.vert[i + 1];
      line(a.x, a.y, b.x, b.y);
    }

    if (editor) {
      strokeWeight(2);
      stroke(255);
      fill(0);
      for (var i = 0; i < this.length(); i++) {
        const pts = this.get(i);
        if (!pts[1] || !pts[2] || !pts[3]) {
          continue;
        }
        line(pts[1].x, pts[1].y, pts[0].x, pts[0].y);
        line(pts[2].x, pts[2].y, pts[3].x, pts[3].y);
      }
      noFill();
      strokeWeight(10);
      stroke(255);
      for (var i = 0; i < this.points.length; i++) {
        if (i % 3 == 0) {
          stroke(255, 0, 0);
        } else {
          stroke(255, 255, 0);
        }
        const p = this.points[i];
        point(p.x, p.y);
      }
    }

    stroke(255);
    strokeWeight(5);
    for (const p of this.draw_points) {
      point(p.x, p.y);
    }

    pop();
  }
  export_points() {
    let output = [];
    for (const p of this.points) {
      output.push([p.x, p.y]);
    }
    return btoa(JSON.stringify(output));
  }
  import_input(text) {
    this.import_points(text.value());
  }
  import_points(text) {
    this.redraw = true;
    try {
      const b64 = atob(text);
      const pts = JSON.parse(b64);
      this.points = [];
      for (const p of pts) {
        this.points.push(createVector(p[0], p[1]));
      }
    } catch (e) {
      console.log("error importing", e);
    }
  }

  evenlyspaced(spacing, resolution = 1) {
    const output = [];
    output.push(this.points[0]);
    let prev = this.points[0];
    let dst = 0;

    for (let i = 0; i < this.length(); i++) {
      const p = this.get(i);
      if (!p[1] || !p[2] || !p[3]) {
        continue;
      }
      const netLength =
        p5.Vector.dist(p[0], p[1]) +
        p5.Vector.dist(p[1], p[2]) +
        p5.Vector.dist(p[2], p[3]);
      const estCurve = p5.Vector.dist(p[0], p[3]) + netLength;
      const divisions = estCurve * resolution * 0.2;
      let t = 0;
      while (t <= 1) {
        t += 1.0 / divisions;
        const pointOnCurve = mybezier.bcube(p[0], p[1], p[2], p[3], t);
        dst += p5.Vector.dist(prev, pointOnCurve);
        while (dst >= spacing) {
          const overshoot = dst - spacing;
          const _pspn = vsub(prev, pointOnCurve)
            .normalize()
            .mult(overshoot);
          const newPoint = vadd(pointOnCurve, _pspn);
          output.push(newPoint);
          dst = overshoot;
          prev = newPoint;
        }
        prev = pointOnCurve;
      }
    }
    return output;
  }
  gen_mesh(roadWidth) {
    const p = this.evenlyspaced(2, 1);
    const verts = Array(p.length * 2).fill(undefined);
    const tri = Array(2 * 3 * (p.length - 1) + (this.isClosed ? 2 : 0)).fill(
      undefined
    );
    let vind = 0;
    let tind = 0;
    for (let i = 0; i < p.length; i++) {
      let forward = createVector(0, 0);
      if (i < p.length - 1) {
        forward.add(vsub(p[i + 1], p[i]));
      }
      if (i > 0) {
        forward.add(vsub(p[i], p[i - 1]));
      }
      forward.normalize();
      const left = createVector(-forward.y, forward.x).mult(roadWidth * 0.5);
      verts[vind] = vadd(p[i], left);
      verts[vind + 1] = vsub(p[i], left);

      if (i < p.length - 1) {
        tri[tind] = vind;
        tri[tind + 1] = vind + 2;
        tri[tind + 2] = vind + 1;

        tri[tind + 3] = vind + 1;
        tri[tind + 4] = vind + 2;
        tri[tind + 5] = vind + 3;
      }
      tind += 6;
      vind += 2;
    }
    return [verts, tri];
  }
}
