let {CubicBezier} = require("./cubicBezier");
let {Point} = require("./point");

class SmoothBorderLoop{
    constructor(ctrlPoints = []){
        if(ctrlPoints.length % 3 != 0){console.error("can't create loop with invalid number of control points (not divisible by 3)")}
        this.ctrlPoints = [];
        this.cubics = [];
        for(let i = 0; i < ctrlPoints.length; i++){
            this.ctrlPoints.push(new Point(ctrlPoints[i][0], ctrlPoints[i][1]));
        }
        for(let n = 0; n < ctrlPoints.length/3; n++){
            let p0 = this.ctrlPoints[n*3];
            let p1 = this.ctrlPoints[n*3 + 1];
            let p2 = this.ctrlPoints[n*3 + 2];
            let p3;
            if((n+1) == ctrlPoints.length/3){
                p3 = this.ctrlPoints[0];//last cubic needs to loop back
            }else{
                p3 = this.ctrlPoints[n*3 + 3];
            }
            this.cubics.push(new CubicBezier(p0,p1,p2,p3));
        }
    }

    GetOtherBorderT(otherBorder = SmoothBorderLoop, myT){
        let myPoint = this.GetPointAtParam(myT);
        let normalLine = this.GetNormalLineAtParam(myT);
        let tIntersects = otherBorder.GetTIntersectsWithLine(normalLine);
        let intersects = otherBorder.GetPointsAtParams(tIntersects)
        let oppositeT = tIntersects[myPoint.GetClosestIndex(intersects)]
        return oppositeT;
    }

    ModParam(t){
        //returns valid t inside loop
        while(t < 0){t += this.cubics.length;}
        while(t > this.cubics.length){t -= this.cubics.length;}
        return t;
    }

    GetPointAtParam(_t){
        let t = this.ModParam(_t);
        let n = 0;
        while(t > 1){
            n += 1;
            t -= 1;
        }
        return this.cubics[n].GetPointAtParam(t);
    }

    GetPointsAtParams(tList = []){
        return tList.map(this.GetPointAtParam, this);
    }

    GetNormalLineAtParam(_t){
        let t = this.ModParam(_t);
        let n = 0;
        while(t > 1){
            n += 1;
            t -= 1;
        }
        return this.cubics[n].GetNormalLineAtParam(t);
    }

    GetTIntersectsWithLine(line){
        let tIntersects = [];
        for(let i = 0; i < this.cubics.length; i++){
            let cubic = this.cubics[i];
            let newTIntersects = cubic.GetTIntersectsWithLine(line);
            for(let j = 0; j < newTIntersects.length; j++){
                tIntersects.push(newTIntersects[j] + i);;// adding i to get global t value on border
            }
        }
        return tIntersects;
    }

    GetParamAtDist(dist, tOrigin){
        let precision = 0.01;
        let quadDist = dist*dist;
        let minT = tOrigin;
        let maxT = tOrigin + 0.3*this.cubics.length; //add one third of the loop
        let originPoint = this.GetPointAtParam(tOrigin);
        let avgT;
        let avgPoint;
        let avgQuadDist;
        while(true){
            //calc point between min and max
            avgT = 0.5*(minT + maxT);
            avgPoint = this.GetPointAtParam(avgT);
            avgQuadDist = originPoint.QuadDistTo(avgPoint);
            if(avgQuadDist > quadDist + precision){//avgT is too far
                maxT = avgT;
                continue;
            }
            if(avgQuadDist < quadDist - precision){//avgT is too close
                minT = avgT;
                continue;
            }
            //avgT is valid
            return avgT;
        }
    }
}

module.exports = {SmoothBorderLoop};