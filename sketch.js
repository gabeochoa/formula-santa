let ground_height;
let c;
let fake_car = null;

let AUTO_MOVE = true;
let MOUSE_DOWN = false;
let ENABLE_OFFROAD = false;
let CAR_UPDATE = 25;
let isGame = true;
let path;
const sc = 1; //0.5;

let p = null;
const cs = {
  NOTC: 0,
  QUERY: 1,
  READY: 2,
  GAME: 3
};
let peername;
let myid;
function setup() {
  editor_setup();
  game_setup();
  p = new P();

  const ptag = document.getElementById("peerp");
  const pinput = document.getElementById("peerinput");
  myid = document.getElementById("myid");
  peername = document.getElementById("peerid");
  const but = document.getElementById("joinbtn");
  but.onclick = () => {
    join_peer(pinput);
  };
}

function join_peer(pinput) {
  const pee = pinput.value;
  p.connect_to(pee);
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
  // console.log("keytyped", key);
  if (key == "0") {
    isGame = !isGame;
    console.log("is game: ", isGame);
    return;
  }
  if (key == "o") {
    AUTO_MOVE = !AUTO_MOVE;
  }
  if (key == "g") {
    ENABLE_OFFROAD = !ENABLE_OFFROAD;
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
  c = new Car(210, 400);
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

function draw_road() {
  push();
  stroke(255);
  strokeWeight(1);
  noStroke();
  const [_, closest] = closest_dp();
  if (closest == -1) {
    return;
  }
  fill(255);
  const section_height = LINE_SPACE;
  const section_width = ROAD_WIDTH * 25;
  const perstep = 2;
  const h = 120 + 50;
  const w2 = width / 2;

  const clos = path.points[path.idx(closest)];
  stroke(0);

  for (var i = 30; i >= 0; i--) {
    fill(255, 25, 100);
    const xx = w2 - section_width / 2 - i * perstep;
    const cur = path.points[path.idx(i)];
    const diff = vsub(clos, cur);
    rect(
      xx - abs(diff.x / 20),
      section_height * i + h,
      section_width + i * perstep * 2,
      section_height
    );
  }

  // c.draw_big();
  pop();
}

function game_draw() {
  draw_background();
  // draw_road();
  draw_minimap();

  game_keyinput();
  game_move();
}

function closest_dp() {
  let closestd = width;
  let closest = -1;
  for (var i = 0; i < path.draw_points.length; i++) {
    const p = path.draw_points[i];
    const d = p5.Vector.dist(c.pos, p);
    if (d < closestd) {
      closestd = d;
      closest = i;
    }
  }
  return [closestd, closest];
}

function gen_road_mult() {
  const [closest, _] = closest_dp();
  if (ENABLE_OFFROAD) {
    return 1;
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
  if (!AUTO_MOVE) {
    c.move(road_mult, null);
    return;
  }

  const [_, dot] = closest_dp();
  c.move(road_mult, dot);
}

function draw_minimap() {
  push();
  translate(0, 0); //-150);
  path.draw_mini(sc);
  c.draw(sc);
  if (fake_car) fake_car.draw(sc);
  pop();
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
