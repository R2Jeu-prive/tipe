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

    GetClosestIndex(otherPoints){
        if(otherPoints.length == 0){console.error("no points given, can't find closest");}
        let closestIndex = 0;
        let minQuadDist = this.quadDistTo(otherPoints[0]);
        for(let i = 1; i < otherPoints.length; i++){
            let currentQuadDist = this.quadDistTo(otherPoints[i]);
            if(currentQuadDist < minQuadDist){
                closestIndex = i;
                minQuadDist = currentQuadDist;
            }
        }
        return closestIndex;
    }
}