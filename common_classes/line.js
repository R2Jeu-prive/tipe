export class Line{
    constructor(_u,_v,_w){
        //ux + vy = w
        if(_u == 0 && _v == 0){console.error("u=v=0 doesn't represent a line");}
        this.u = _u;
        this.v = _v;
        this.w = _w;
    }

    Rotate90Around(x, y){
        let oldU = this.u;
        let oldV = this.v;
        let oldW = this.w;

        //turn directing vector
        this.u = -oldV;
        this.v = oldU;

        //move w argument so (x,y) is still on line
        this.w = this.u*x + this.v*y;
        return this;
    }
}
