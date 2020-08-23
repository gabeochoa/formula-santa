let ground_height;
let c;
let fake_car = null;

let AUTO_MOVE = true;
let MOUSE_DOWN = false;
let ENABLE_OFFROAD = false;
let CAR_UPDATE = 25;
let isGame = true;
let path;
const sc = 0.5;

let p = null;
let editor = null;
let game = null;
const cs = {
  NOTC: 0,
  QUERY: 1,
  READY: 2,
  GAME: 3
};
let peername;
let myid;

function setup() {
  editor = new Editor();
  editor.setup();
  game = new Game();
  game.setup()
  p = new P();
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
    editor.draw();
  } else {
  frameRate(15)
    game.draw()
  }
}

function draw(){
  draw_background();
  draw_road();
  draw_minimap();
  game.controls();
  game.draw();
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
  if (key == "0") {
    isGame = !isGame;
    console.log("is game: ", isGame);
    return;
  }
  if (isGame) {
    game.key_typed()
    return;
  }
  // EDITOR ONLY
  editor.key_typed();
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

  const section_height = LINE_SPACE;
  const section_width = ROAD_WIDTH * 25;
  const perstep = 2;
  const h = 120 + 50;
  const w2 = width / 2;
  const clos = editor.path.points[editor.path.idx(closest)];
  stroke(0);

  for (var i = 30; i >= 0; i--) {
    fill(255, 25, 100);
    rect(
      10, 
      height/2 + i*10, 
      width/2 - (10 - i), 
      10
    )
  }

  pop();
  return 
}

/**
 * closest_dp
 *  finds the closest point to the player's car 
 * params
 *  n/a
 * returns
 *  tuple(distance, point)
 */
last_time = 0;
prev_closest = [null, null]
function closest_dp() {
  now = millis();
  if(now > (last_time+100)){
    last_time = now;
    prev_closest = _closest_dp();
  }
  return prev_closest
}

function _closest_dp() {
  let closestd = width;
  let closest = -1;
  for (var i = 0; i < editor.path.draw_points.length; i++) {
    const p = editor.path.draw_points[i];
    const d = p5.Vector.dist(game.c.pos, p);
    if (d < closestd) {
      closestd = d;
      closest = i;
    }
  }
  return [closestd, closest];
}

/**
 * gen_road_multi
 *   finds the closest point's distance and returns a 
 *   road speed multiplier 
 * params
 *  n/a
 * returns
 *  float multiplier
 */
function gen_road_mult() {
  const [closest, _] = closest_dp();
  if (ENABLE_OFFROAD) {
    return 1;
  }
  if (closest < 25) {
    return 0.98;
  }
  if (closest < 50) {
    return 0.95;
  }
  return 0.90;
}

function draw_minimap() {
  push();
  translate(0, 0); //-150);
  editor.path.draw_mini(sc);
  game.c.draw(sc);
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

