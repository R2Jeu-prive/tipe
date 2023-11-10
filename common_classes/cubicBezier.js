let {Point} = require("./point");
let {Line} = require("./line");
let {solveCubic} = require("./utils")

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

        //calc w so line intersects cubic at t
        //tangent equation
        //dydt*(eqx - x) = dxdt*(eqy - y)
        //dydt*(-x) - dxdt*(-y) = -dydt*eqx + dxdt*eqy
        let w = -dydt*x + dxdt*y;
        let tangent = new Line(-dydt, dxdt, w);

        return tangent.Rotate90Around(x,y);
    }

    GetTIntersectsWithLine(line){
        //cubic equation to solve
        let a = line.u*(-this.p0.x +3*this.p1.x -3*this.p2.x +this.p3.x) + line.v*(-this.p0.y +3*this.p1.y -3*this.p2.y +this.p3.y);
        let b = line.u*(3*this.p0.x -6*this.p1.x +3*this.p2.x) + line.v*(3*this.p0.y -6*this.p1.y +3*this.p2.y);
        let c = line.u*(-3*this.p0.x +3*this.p1.x) + line.v*(-3*this.p0.y +3*this.p1.y);
        let d = line.u*this.p0.x + line.v*this.p0.y - line.w;

        //solve and remove solutions outside [0,1[
        let solutions = solveCubic(a,b,c,d);
        let tIntersects = [];
        for(let j = solutions.length-1; j >= 0; j--){
            if(solutions[j] < 0 || solutions[j] >= 1){continue;}
            tIntersects.push(solutions[j]);
        }
        return tIntersects;
    }
}

module.exports = {CubicBezier};