class Vector {
    constructor(tip, base = Point.zero) {
        this.x = tip.x - base.x;
        this.y = tip.y - base.y;
    }

    Rotate(){
        //rotates vector 90deg anti-clockwise
        let tempX = this.x;
        this.x = this.y;
        this.y = -tempX;
    }

    static Dot(a,b){
        return a.x*b.x + a.y*b.y;
    }


}