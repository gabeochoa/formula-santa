
/*
  Editor 
*/
class Editor{
  setup(){
    createCanvas(800, 600);
    ground_height = 600 * (3 / 5);
    this.path = new Path();
    this.DEFAULT_PATH =
      "W1sxMDAsMjAwXSxbMTUwLDE1MF0sWzI1MCwyNTBdLFszMDAsMjAwXSxbMzUwLDE1MF0sWzM2NS41LDE3OS41XSxbNDMxLDE1OV0sWzQ5Ni41LDEzOC41XSxbNDkwLjUsMjg2XSxbNTUwLDQxM10sWzYwOS41LDU0MF0sWzI5MSw0NTBdLFsyNjMsNTMzXSxbMTE5LjUsNTkzXSxbMzI3LDI2MV0sWzEyNywzNjddLFszOS41LDI4MF0sWzUwLDI1MF1d";
    this.inp = createElement("textarea", this.DEFAULT_PATH);
    this.inp.size(300);
    import_path(this.path, this.inp);

    let button = createButton("export path");
    button.mousePressed(() => export_path(this.inp));

    button = createButton("import path");
    button.mousePressed(() => import_path(this.inp));
  }

  key_typed(){
    if (key == "t") {
      const mp = createVector(mouseX, mouseY);
      console.log(mp);
      this.path.add(mp);
    }
    if (key == "r") {
      if (this.path.length() < 3) {
        return;
      }
      let p = -1;
      let bestDist = 9999;
      const mp = createVector(mouseX, mouseY);
      for (var i = 0; i < this.path.points.length; i++) {
        const nd = abs(this.path.points[i].dist(mp));
        if (nd < bestDist) {
          bestDist = nd;
          p = i;
        }
      }
      if (p != -1) {
        this.path.delete(p);
      }
    }
    if (key == "c") {
      this.path.toggleClose();
    }
    if (key == "o") {
      this.path.toggleSetPoints();
    }
  }

  draw(){
    background(0);
    this.path.draw();

    if (MOUSE_DOWN) {
      let p = -1;
      let bestDist = 9999;
      const mp = createVector(mouseX, mouseY);
      for (var i = 0; i < this.path.points.length; i++) {
        const point = this.path.points[i];
        const nd = abs(point.dist(mp));
        if (nd < bestDist) {
          bestDist = nd;
          p = i;
        }
      }
      if (p != -1) {
        this.path.update_point(p, mp);
      }
    }

    fill(255);
    textSize(12);
    text("SetPoints: " + (this.path.setPoints ? "enabled" : "disabled"), 20, 10 + 1.5);
  }
}