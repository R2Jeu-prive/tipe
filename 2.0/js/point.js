class Point{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    quadDistTo(otherPoint){
        return (otherPoint.x-this.x)**2 + (otherPoint.y-this.y)**2;
    }

    distTo(otherPoint){
        return Math.sqrt(this.quadDistTo(otherPoint));
    }
}