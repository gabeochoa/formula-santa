let c = null;
const DEBUG = false
let t_start;
let t_elapsed = 0;
let ground_height;

let MOUSE_DOWN = false;
const GAME_STATE = {
    NONE: 0,
    DRIVING: 1,
    EDIT: 2,
}
const STATE = GAME_STATE.EDIT;
let track = null;
let path = null;

let VEC_UP;
let VEC_DN;
let VEC_LF;
let VEC_RT;
function vadd(a, b){ return p5.Vector.add(a, b); }
function vsub(a, b){ return p5.Vector.sub(a, b); }
function vmult(a, b){ return p5.Vector.mult(a, b); }

 function clipboard(txt){
  console.log(txt)
  var cb = document.getElementById("cb");
  cb.value = txt;
  cb.style.display='block';
  cb.select();
  document.execCommand('copy');
  cb.style.display='none';
 }

function export_path(){
    clipboard(path.export_points())
}

function import_path(text){
    path.import_points(text)
}

function setup() {
    t_start = millis()
    createCanvas(800, 600);
    ground_height = 600 * (3/5);

    SCALE = 100;
    VEC_UP = createVector(0, -1).mult(SCALE);
    VEC_DN = createVector(0, 1).mult(SCALE);
    VEC_LF = createVector(-1, 0).mult(SCALE);
    VEC_RT = createVector(1, 0).mult(SCALE);
    path = new Path(200, 200);

    button = createButton('export path');
    button.mousePressed(export_path);

    inp = createElement( 'textarea', path.export_points() );
    inp.size(300)

    button = createButton('import path');
    button.mousePressed(() => import_path(inp));
}

function inScreen(){ return mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height; }
function mousePressed(event){ if(inScreen()){MOUSE_DOWN = true; }}
function mouseReleased(event){ if(inScreen()){MOUSE_DOWN = false; }}
function keyTyped(){
    console.log("keytyped", key)
    if(key == "t"){
        const mp = createVector(mouseX, mouseY) 
        console.log(mp)
        path.add(mp);
    }
    if(key == "r"){
        if(path.length() < 3){ return }
        let p = -1;
        let bestDist = 9999;
        const mp = createVector(mouseX, mouseY);
        for(var i=0; i<path.points.length; i++){
            const nd = abs(path.points[i].dist(mp))
            if(nd < bestDist){ bestDist = nd; p = i; }
        }
        if(p != -1){
            path.delete(p);
        }
    }
    if(key == "c"){
        path.toggleClose();
    }
    if(key == "o"){
        path.toggleSetPoints();
    }
}

function draw_background(){
    push()
    noStroke()
    fill(20, 200, 20)
    rect(0, 0, width, height); 
    fill(137, 206, 250)
    rect(0, 0, width, height - ground_height); 
    pop()
}

function draw_road(){
    road_width = width*(1/3)
    push()
    fill(137, 150, 150)
    rect(width*1/3, height-ground_height, width*(1/3)+5, ground_height); 
    pop()
}


function draw() {
  t_elapsed = millis() - t_start;
  background(0);
  // draw_background();
  // draw_road();
  path.draw();

  if(MOUSE_DOWN){
    let p = -1;
    let bestDist = 9999;
    const mp = createVector(mouseX, mouseY);
    for(var i=0; i<path.points.length; i++){
        const point = path.points[i]
        const nd = abs(point.dist(mp))
        if(nd < bestDist){
            bestDist = nd
            p = i;
        }
    }
    if(p != -1){
        path.update_point(p, mp);
    }
  }

  fill(255)
  textSize(12);
  text("SetPoints: " + (path.setPoints? 'enabled' : "disabled"), 20, 10 + 1.5);
}
