export class Point{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    QuadDistTo(otherPoint){
        return (otherPoint.x-this.x)**2 + (otherPoint.y-this.y)**2;
    }

    DistTo(otherPoint){
        return Math.sqrt(this.QuadDistTo(otherPoint));
    }

    GetClosestIndex(otherPoints){
        if(otherPoints.length == 0){console.error("no points given, can't find closest");}
        let closestIndex = 0;
        let minQuadDist = this.QuadDistTo(otherPoints[0]);
        for(let i = 1; i < otherPoints.length; i++){
            let currentQuadDist = this.QuadDistTo(otherPoints[i]);
            if(currentQuadDist < minQuadDist){
                closestIndex = i;
                minQuadDist = currentQuadDist;
            }
        }
        return closestIndex;
    }

    Plus(other = new Point){
        return new Point(this.x + other.x, this.y + other.y)
    }

    Minus(other = new Point){
        return new Point(this.x - other.x, this.y - other.y);
    }

    //special definition of a cross product between two 2d vectors
    Cross(other = new Point){
        return this.x*other.y - this.y*other.x;
    }

    Scale(scalar){
        return new Point(this.x * scalar, this.y * scalar);
    }
}
