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
    frameRate(30)
    draw_background();
    draw_road();
    draw_minimap();
    game.draw()
  }
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
  const [distToMiddle, dot ] = closest_dp();
  if (dot == -1) {
    return;
  }
  const A = editor.path.ith(dot);
  const B = editor.path.ith(dot + 3)
  const AtoB = Math.atan2( (B.y - A.y) , (B.x - A.x))
  const rOffset = map(degrees(AtoB), 0, 360, 0, .8)

  push()
  stroke(90)
  fill(90)
  strokeWeight(1)

  const roadlen = 360

  const a = createVector( width * .01, height + 100)
  const b = createVector( width * .01, height - (2/3 * roadlen))
  const c = createVector( width * (.01 + rOffset), height - roadlen)

  const x = createVector( width * .99, height + 100)
  const y = createVector( width * .99, height - (2/3 * roadlen))
  const z = createVector( width  * (.99 + rOffset), height - roadlen)

  const divisions = 20;
  const lcurve = []
  const rcurve = []
  let t = 0;
  while (t <= 1) {
    t += 1.0 / divisions;
    const pointOnLCurve = mybezier.bquad(a, b, c, t);
    lcurve.push(pointOnLCurve)
    const pointOnRCurve = mybezier.bquad(x, y, z, t);
    rcurve.push(pointOnRCurve)
  }

  for(var i  = 0; i<lcurve.length-1; i+=1){
    p0 = lcurve[i]; p1 = rcurve[i];
    p2 = lcurve[i+1]; p3 = rcurve[i+1];
    quad(
      p0.x, p0.y, 
      p1.x, p1.y,
      p3.x, p3.y,
      p2.x, p2.y,
      )
    if(i % 2 == dot % 2){
      push()
      fill(255)
      const left = width * .5
      const right = width * .5
      quad(
        p0.x + left, p0.y, 
        p2.x + left, p2.y,
        p3.x - right, p3.y,
        p1.x - right, p1.y,
        // p0.x/20, p0.y, 
        // p2.x/20, p2.y,
        // p3.x/20, p3.y,
        // p1.x/20, p1.y,
        )
      pop()
    }
  }

  // push()
  // const cLen = 100
  // const cWid = 50
  // translate(width * .4, height - (cLen/2));
  // // rotate(game.c.angle)
  // stroke('purple')
  // fill('purple')
  // const cA = createVector(-cWid, 0)
  // const cB = createVector(- cWid, -cLen)
  // const cC = createVector(cWid, -cLen)
  // const cD = createVector(cWid, 0)
  // quad(
  //   cA.x, cA.y,
  //   cB.x, cB.y,
  //   cC.x, cC.y,
  //   cD.x, cD.y,
  // )
  // pop()

  pop()


  const xx = 1
  if(xx == 1){
    return 
  }

  const section_height = LINE_SPACE;
  const section_width = ROAD_WIDTH * 25;
  const perstep = 2;
  const w2 = width / 2;
  stroke(0);

  for (var i = 30; i >= 0; i--) {
    fill(255, 25, 100);
    rect(
      width / 2,
      height/2 + i*10,
      -350,
      section_height)
    rect(
      width / 2,
      height/2 + i*10,
      350,
      section_height,
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

