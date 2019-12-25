class P {
  constructor() {
    this.peer = new Peer();
    this.myid = null;
    this.peer_id = null;
    this.conn = null;
    this.peer.on("open", this.open);
    this.peer.on("connection", this.connection);
  }

  open(id) {
    console.log("recieved our id", id);
    p.myid = id;
    myid.innerHTML = id;
  }

  connect_to(peer) {
    console.log("Connecting to: ", peer);
    const c = this.peer.connect(peer);
    c.on("open", () => {
      console.log("c open");
      c.on("data", data => {
        console.log("re data", data);
      });
      const text = path.export_points();
      c.send({ map: text });
      query_local_car(c);
    });
  }

  connection(conn) {
    console.log("got connection from", conn.peer);
    if (p.peer_id != null) {
      return;
    }
    peername.innerHTML = conn.peer;
    p.peer_id = conn.peer;
    p.connect_to(conn.peer);
    conn.on("open", () => {
      conn.on("data", data => {
        // console.log("recieved", data);
        const evt = Object.keys(data)[0];
        proccess_conn_event(evt, data[evt]);
      });
      conn.on("error", err => {
        console.log("error", err);
      });
      conn.send("hi from" + p.myid);
    });
  }
}

function proccess_conn_event(evt, data) {
  switch (evt) {
    case "map":
      path.import_points(data);
      break;
    case "move":
      if (fake_car == null) {
        fake_car = new Car();
      }
      fake_car.deserialize(data);
      break;
  }
}

function query_local_car(conn) {
  // console.log("query local car");
  conn.send({ move: c.serialize() });
  window.setTimeout(() => query_local_car(conn), CAR_UPDATE);
}
