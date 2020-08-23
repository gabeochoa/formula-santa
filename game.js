class Game {
    setup(){
      this.c = new Car(210, 400);
    }
  
    controls() {
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
      this.c.m_input(x, y);
    }
  
    key_typed(){
      if (key == "o") {
        AUTO_MOVE = !AUTO_MOVE;
      }
      if (key == "g") {
        ENABLE_OFFROAD = !ENABLE_OFFROAD;
      }
    }
  
    draw(){
      // find if we are on the road
      let road_mult = gen_road_mult();
      if (!AUTO_MOVE) {
        this.c.move(editor.path, road_mult, null);
        return;
      }
      const [_, dot] = closest_dp();
      this.c.move(editor.path, road_mult, dot);
    }
  }