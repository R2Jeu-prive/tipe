class SmoothBorderLoop{
    constructor(ctrlPoints){
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

    GetPointAtParam(t){
        if(t < 0 || t > this.cubics.length){console.error("evaluating bezier outside [0, 1]");}
        let n = 0;
        while(t > 1){
            n += 1;
            t -= 1;
        }
        return this.cubics[n].GetPointAtParam(t);
    }

    GetIntersectWithLine(line){
        let intersects = [];
        for(let cubic of this.cubics){
            let newIntersects = cubic.GetIntersectWithLine(line);
            intersects = intersects.concat(newIntersects);
        }
        return intersects;
    }
}

class CubicBezier{
    constructor(_p0, _p1, _p2, _p3){
        this.ctrlPoints = [_p0,_p1,_p2,_p3];
        this.p0 = _p0;
        this.p1 = _p1;
        this.p2 = _p2;
        this.p3 = _p3;
    }

    GetPointAtParam(t){
        if(t < 0 || t > 1){console.error("evaluating bezier outside [0, 1]");}
        let x = (1-t)*(1-t)*(1-t)*this.p0.x + 3*t*(1-t)*(1-t)*this.p1.x + 3*t*t*(1-t)*this.p2.x + t*t*t*this.p3.x;
        let y = (1-t)*(1-t)*(1-t)*this.p0.y + 3*t*(1-t)*(1-t)*this.p1.y + 3*t*t*(1-t)*this.p2.y + t*t*t*this.p3.y;
        return new Point(x,y);
    }

    GetNormalLineAtParam(t){
        if(t < 0 || t > 1){console.error("evaluating bezier outside [0, 1]");}
        //calc tangent first
        let dxdt = 3*(1-t)*(1-t)*(this.p1.x - this.p0.x) + 6*(1-t)*t*(this.p2.x - this.p1.x) + 3*t*t*(this.p3.x - this.p2.x);
        let dydt = 3*(1-t)*(1-t)*(this.p1.y - this.p0.y) + 6*(1-t)*t*(this.p2.y - this.p1.y) + 3*t*t*(this.p3.y - this.p2.y);
        let x = (1-t)*(1-t)*(1-t)*this.p0.x + 3*t*(1-t)*(1-t)*this.p1.x + 3*t*t*(1-t)*this.p2.x + t*t*t*this.p3.x;
        let y = (1-t)*(1-t)*(1-t)*this.p0.y + 3*t*(1-t)*(1-t)*this.p1.y + 3*t*t*(1-t)*this.p2.y + t*t*t*this.p3.y;

        //rotate to get normal
        let temp = dxdt;
        dxdt = -dydt;
        dydt = temp;

        //calc w so line intersects cubic at t
        w = dxdt*x + dydt*y;

        return new Line(dxdt, dydt, w)
    }

    GetIntersectWithLine(line){
        //cubic equation to solve
        let a = line.u*(-x0 +3*x1 -3*x2 +x3) + line.v*(-y0 +3*y1 -3*y2 +y3);
        let b = line.u*(3*x0 -6*x1 +3*x2) + line.v*(3*y0 -6*y1 +3*y2);
        let c = line.u*(-3*x0 +3*x1) + line.v*(-3*y0 +3*y1);
        let d = line.u*x0 + line.v*y0 - line.w;

        //solve and remove solutions outside [0,1[
        let solutions = solveCubic(a,b,c,d);
        let intersects = [];
        for(let j = solutions.length-1; j >= 0; j--){
            if(solutions[j] < 0 || solutions[j] >= 1){continue;}
            intersects.push(this.GetPointAtParam(solutions[j]));
        }
        return intersects;
    }
}