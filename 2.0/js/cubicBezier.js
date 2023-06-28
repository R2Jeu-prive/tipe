class CubicsBezier{
    constructor(controlPoints){
        this.controlPoints = [];
        for(let i = 0; i < controlPoints.length; i++){
            let couple = controlPoints[i];
            this.controlPoints.push(new Point(couple[0], couple[1]));
        }
    }

    GetPointAtParam(globalT){
        let cubicNum = globalT == 0 ? 0 : (Math.ceil(globalT) - 1);
        let t = globalT - cubicNum;
        let P0 = this.controlPoints[cubicNum*3];
        let P1 = this.controlPoints[cubicNum*3 + 1];
        let P2 = this.controlPoints[cubicNum*3 + 2];
        let P3 = (cubicNum + 1)*3 == this.controlPoints.length ? this.controlPoints[0] : this.controlPoints[cubicNum*3 + 3];
        let x = (1-t)*(1-t)*(1-t)*P0.x+3*t*(1-t)*(1-t)*P1.x+3*t*t*(1-t)*P2.x+t*t*t*P3.x;
        let y = (1-t)*(1-t)*(1-t)*P0.y+3*t*(1-t)*(1-t)*P1.y+3*t*t*(1-t)*P2.y+t*t*t*P3.y;
        return new Point(x,y);
    }

    GetIntersectWithLine(u, v, w){
        let intersects = [];
        //line : ux + vy = w
        for(let i = 0; i < this.controlPoints.length/3; i++){
            //bezier control points
            let x0 = this.controlPoints[3*i].x;
            let y0 = this.controlPoints[3*i].y;
            let x1 = this.controlPoints[3*i + 1].x;
            let y1 = this.controlPoints[3*i + 1].y;
            let x2 = this.controlPoints[3*i + 2].x;
            let y2 = this.controlPoints[3*i + 2].y;
            let x3 = (i + 1)*3 == this.controlPoints.length ? this.controlPoints[0].x : this.controlPoints[3*i + 3].x;
            let y3 = (i + 1)*3 == this.controlPoints.length ? this.controlPoints[0].y : this.controlPoints[3*i + 3].y;
            //cubic equation to solve
            let a = u*(-x0 +3*x1 -3*x2 +x3) + v*(-y0 +3*y1 -3*y2 +y3);
            let b = u*(3*x0 -6*x1 +3*x2) + v*(3*y0 -6*y1 +3*y2);
            let c = u*(-3*x0 +3*x1) + v*(-3*y0 +3*y1);
            let d = u*x0 + v*y0 - w;
            let newintersects = solveCubic(a,b,c,d);
            for(let j = newintersects.length-1; j >= 0; j--){
                if(newintersects[j] < 0 || newintersects[j] > 1){continue;}
                intersects.push(this.GetPointAtParam(newintersects[j] + i));
            }
        }
        return intersects;
    }
}