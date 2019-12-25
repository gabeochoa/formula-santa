
class Path {
    constructor(x, y){
        let start = createVector(x, y);
        this.points = [
            vadd(start, VEC_LF ),
            vadd(start, vadd(VEC_LF,VEC_UP).mult(0.5) ),
            vadd(start, vadd(VEC_RT,VEC_DN).mult(0.5) ),
            vadd(start, VEC_RT),
        ]
        this.isClosed = false;
        this.setPoints = false;
    }
    idx(i){
        return (i + this.points.length) % this.points.length;
    }
    add(v){
        const secondlast = this.points[this.points.length-2].copy()
        const last = this.points[this.points.length-1].copy()
        const lc = vsub(vmult(last, 2),secondlast)
        const rc = vadd(last, v).mult(0.5)

        this.points.push(lc);
        this.points.push(rc);
        this.points.push(v)

        if(this.setPoints){
            this.setAffected(this.points.length -1)
            return;
        }
    }
    get(i){
        const j = i*3; const p = this.points;
        return [ p[j], p[j+1], p[j+2], p[this.idx(j+3)] ]
    }
    delete(i){
        if(i == 0){
            if(this.isClosed){
                this.points[this.idx(-1)] = this.points[2].copy()
            }
            this.points.splice(0,3); 
            return
        } 
        else if(i == this.points.length-1 && !this.isClosed){
            this.points.splice(this.idx(i-2),3); 
        }
        else{
            this.points.splice(this.idx(i-1),3); 
        }
    }
    length(){ return (this.points.length)/3;}
    update_point(i, mp){
        const delta = mp.copy().sub(this.points[i])

        if(i%3 == 0 || !this.setPoints){
            this.points[i].set(mp)

            if(this.setPoints){
                this.setAffected(i)
                return;
            }
            if(i % 3 == 0){
                if(i+1 < this.points.length || this.isClosed){ 
                    this.points[this.idx(i + 1)].add(delta); 
                }
                if(i-1 >=0 || this.isClosed){ 
                    this.points[this.idx(i - 1)].add(delta);
                }
            }
            else{
                const npAnchor = (i+1)%3 == 0;
                const sibling = this.points[ this.idx(npAnchor? i+2 : i-2) ];
                const anchor = this.points[ this.idx(npAnchor? i+1 : i-1)];
                if(sibling){
                    const distance = anchor.copy().sub(sibling).mag();
                    const direction = anchor.copy().sub(mp).normalize();
                    this.sibling = anchor.copy().add(direction.mult(distance));
                }
            }
       }
    }
    toggleClose(){
        this.isClosed = !this.isClosed;
        if(this.isClosed){
            const p = this.points;
            this.points.push(p[p.length-1].copy().mult(2).sub(p[p.length-2]));
            this.points.push(p[0].copy().mult(2).sub(p[1]));
            if(this.setPoints){
                this.setControlPoints(0)
                this.setControlPoints(this.points.length-3)
                return;
            }
        }else{
            this.points.pop()
            this.points.pop();
            if(this.setPoints){
                this.setStartEndPoints()
                return;
            }
        }
    }
    toggleSetPoints(){
       this.setPoints = !this.setPoints; 
       if(this.setPoints){
            this.setAll();
       }
    }

    setControlPoints(i){
        const anchor = this.points[i].copy()
        const dir = createVector(0, 0);
        const neighbor = [0, 0];
        if(i -3 >= 0 || this.isClosed){
            const offset = this.points[this.idx(i-3)].copy().sub(anchor);
            dir.add(offset.normalize());
            neighbor[0] = offset.mag();
        }
        if(i +3 >= 0 || this.isClosed){
            const offset = this.points[this.idx(i+3)].copy().sub(anchor);
            dir.sub(offset.normalize());
            neighbor[1] = -1 * offset.mag();
        }
        dir.normalize();
        for(let j=0; j<2; j++){
            const cind = i + (j*2) -1;
            if(this.isClosed || cind >=0 && cind < this.points.length){
                const nd = dir.copy().mult(neighbor[j]).mult(0.5);
                this.points[this.idx(cind)] = anchor.copy().add(nd);
            }
        }
    }
    setStartEndPoints(){
        if(this.isClosed){ return }
        const first = this.points[0].copy()
        const third = this.points[2].copy();
        this.points[1] = first.add(third).mult(0.5);
        const len = this.points.length
        this.points[len-2] = p5.Vector.add(this.points[len-1], this.points[len-3]).mult(0.5)
    }
    setAffected(x){
        for(var i=x-3;i<=x+3;i+=3){
            if(i>=0 && i < this.points.length || this.isClosed){
                this.setControlPoints(i);
            }
        }
        this.setStartEndPoints();
    }
    setAll(){
        for(var i=0;i<this.points.length;i+=3){
            this.setControlPoints(i);
        }
        this.setStartEndPoints();
    }
    draw(){
        push();
        stroke(255)
        fill(0)
        for(var i = 0; i< this.length(); i++){
            const pts = this.get(i);
            if(!pts[1]){ continue }
            line(pts[1].x, pts[1].y, pts[0].x, pts[0].y)
            line(pts[2].x, pts[2].y, pts[3].x, pts[3].y)
        }
        strokeWeight(5)
        stroke(145, 255, 190)
        noFill()
        for(var i = 0; i< this.length(); i++){
            const pts = this.get(i);
            if(!pts[1]){ continue }
            bezier(
            pts[0].x, pts[0].y, pts[1].x, pts[1].y,
            pts[2].x, pts[2].y, pts[3].x, pts[3].y);
        }
        stroke(20, 255, 55)
        strokeWeight(10)
        stroke(255)
        for(var i=0; i<this.points.length; i++){
            if(i %3 == 0){
                stroke(255, 0, 0)
            }
            else{
                stroke(255, 255, 0)
            }
            const p = this.points[i];
            point(p.x, p.y)
        }
        pop();
    }
    export_points(){
        let output = []
        for(const p of path.points){
            output.push( [p.x, p.y]);
        }
        return btoa(JSON.stringify(output))
    }
    import_points(text){
        try{
            const b64 = atob(text.value())
            const pts = JSON.parse(text.value())
            this.points = []
            for(const p of pts){
                this.points.push(createVector(p[0], p[1]))
            }
        }catch{}
    }
}
