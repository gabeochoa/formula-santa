let ground_height;

let MOUSE_DOWN = false;
let isGame = true;
let path;

function setup() {
  editor_setup();
}

function draw() {
  if (!isGame) {
    editor_draw();
  } else {
    game_draw();
  }
}

function editor_setup() {
  createCanvas(800, 600);
  ground_height = 600 * (3 / 5);
  path = new Path();
  DEFAULT_PATH =
    "W1sxMDAsMjAwXSxbMTUwLDE1MF0sWzI1MCwyNTBdLFszMDAsMjAwXSxbMzUwLDE1MF0sWzM2NS41LDE3OS41XSxbNDMxLDE1OV0sWzQ5Ni41LDEzOC41XSxbNDkwLjUsMjg2XSxbNTUwLDQxM10sWzYwOS41LDU0MF0sWzI5MSw0NTBdLFsyNjMsNTMzXSxbMTE5LjUsNTkzXSxbMzI3LDI2MV0sWzEyNywzNjddLFszOS41LDI4MF0sWzUwLDI1MF1d";

  inp = createElement("textarea", DEFAULT_PATH);
  inp.size(300);
  import_path(inp);

  button = createButton("export path");
  button.mousePressed(() => export_path(inp));

  button = createButton("import path");
  button.mousePressed(() => import_path(inp));
}

function inScreen() {
  return mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height;
}
function mousePressed(event) {
  if (inScreen()) {
    MOUSE_DOWN = true;
  }
}
function mouseReleased(event) {
  if (inScreen()) {
    MOUSE_DOWN = false;
  }
}
function keyTyped() {
  console.log("keytyped", key);
  if (key == "0") {
    isGame = !isGame;
    console.log("is game: ", isGame);
    return;
  }

  if (isGame) {
    return;
  }
  // EDITOR ONLY

  if (key == "t") {
    const mp = createVector(mouseX, mouseY);
    console.log(mp);
    path.add(mp);
  }
  if (key == "r") {
    if (path.length() < 3) {
      return;
    }
    let p = -1;
    let bestDist = 9999;
    const mp = createVector(mouseX, mouseY);
    for (var i = 0; i < path.points.length; i++) {
      const nd = abs(path.points[i].dist(mp));
      if (nd < bestDist) {
        bestDist = nd;
        p = i;
      }
    }
    if (p != -1) {
      path.delete(p);
    }
  }
  if (key == "c") {
    path.toggleClose();
  }
  if (key == "o") {
    path.toggleSetPoints();
  }
}

function game_draw() {
  draw_background();
  draw_minimap();
}

function draw_minimap() {
  path.draw_mini();
}
function draw_background() {
  push();
  noStroke();
  fill(20, 200, 20);
  rect(0, 0, width, height);
  fill(137, 206, 250);
  rect(0, 0, width, height - ground_height);
  pop();
}

function draw_road() {
  road_width = width * (1 / 3);
  push();
  fill(137, 150, 150);
  rect(
    (width * 1) / 3,
    height - ground_height,
    width * (1 / 3) + 5,
    ground_height
  );
  pop();
}

function editor_draw() {
  background(0);
  // draw_background();
  // draw_road();
  path.draw();

  if (MOUSE_DOWN) {
    let p = -1;
    let bestDist = 9999;
    const mp = createVector(mouseX, mouseY);
    for (var i = 0; i < path.points.length; i++) {
      const point = path.points[i];
      const nd = abs(point.dist(mp));
      if (nd < bestDist) {
        bestDist = nd;
        p = i;
      }
    }
    if (p != -1) {
      path.update_point(p, mp);
    }
  }

  fill(255);
  textSize(12);
  text("SetPoints: " + (path.setPoints ? "enabled" : "disabled"), 20, 10 + 1.5);
}
