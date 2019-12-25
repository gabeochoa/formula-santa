let ground_height;
let c;

let MOUSE_DOWN = false;
let isGame = true;
let path;
const sc = 0.25;

function setup() {
  editor_setup();
  game_setup();
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

function game_setup() {
  // something
  c = new Car(200, 500);
}

function game_keyinput() {
  let x = 0;
  let y = 0;
  if (keyIsDown(LEFT_ARROW)) {
    x = -1;
  } else if (keyIsDown(RIGHT_ARROW)) {
    x = 1;
  }
  if (keyIsDown(UP_ARROW)) {
    y = -1;
  } else if (keyIsDown(DOWN_ARROW)) {
    y = 1;
  }
  c.m_input(x, y);
}

function game_draw() {
  draw_background();
  draw_minimap();

  game_keyinput();
  game_move();
}

function gen_road_mult() {
  let closest = width;
  for (var i = 0; i < path.draw_points.length; i++) {
    const p = path.draw_points[i];
    const d = p5.Vector.dist(c.pos, p);
    if (d < closest) {
      closest = d;
    }
  }

  if (closest < 25) {
    return 0.98;
  }
  if (closest < 50) {
    return 0.8;
  }
  return 0.7;
}

function game_move() {
  // find if we are on the road
  let road_mult = gen_road_mult();
  c.move(road_mult);
}

function draw_minimap() {
  path.draw_mini(sc);
  c.draw(sc);
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
