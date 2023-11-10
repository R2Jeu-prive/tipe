class Point {
    constructor(x, y, dir = 0) {
        this.x = x;
        this.y = y;
        this.dir = dir;
    }
    
    static zero = new Point(0,0);
}