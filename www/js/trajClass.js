class Traj {
    constructor() {
        this.laterals = []; //array of lateral placement values
        this.points = []; //array of Points
        this.dists = []; //array of Points all same dist from on another
        this.absCurves = []; //array of curvuture values
        this.time = 0;
        for (let i = 0; i < track.points.length; i++) {
            this.laterals.push(0.5);
            this.points.push(new Point(0,0));
        }
    }

    BuildPoints(){
        for (let i = 0; i < track.points.length; i++) {
            this.points[i].x = (1-this.laterals[i])*track.leftPoints[i].x + this.laterals[i]*track.rightPoints[i].x;
            this.points[i].y = (1-this.laterals[i])*track.leftPoints[i].y + this.laterals[i]*track.rightPoints[i].y;
        }
    }

    CalcDists(){
        this.dists = [];
        for (let i = 1; i < track.points.length; i++) {
            this.dists.push(Math.sqrt((this.points[i - 1].x - this.points[i].x)**2 + (this.points[i - 1].y - this.points[i].y)**2))//NOTOPTI
        }
    }

    CalcAbsCurve(){
        this.absCurves = [];
        let isPossible = true;//flase if traj has great absCurve (too abrupt turn)
        for (let i = 2; i < track.points.length; i++) {
            //A : compare i-2 and i-1
            //B : compare i-1 and i
            let vectAX = this.points[i-2].y - this.points[i-1].y;
            let vectAY = this.points[i-1].x - this.points[i-2].x;
            let vectBX = this.points[i-1].y - this.points[i].y;
            let vectBY = this.points[i].x - this.points[i-1].x;
            if(vectAX*vectBY - vectAY*vectBX == 0){
                this.absCurves.push(0);
                continue
            }
            let midAX = (this.points[i-2].x + this.points[i-1].x)/2
            let midAY = (this.points[i-2].y + this.points[i-1].y)/2
            let midBX = (this.points[i-1].x + this.points[i].x)/2
            let midBY = (this.points[i-1].y + this.points[i].y)/2
            //parametric representations

            //x = midAX + vectAX*t = midBX + vectBX*s
            //y = midAY + vectAY*t = midBY + vectBY*s
            //solve for s then for x y

            //vectAX*t = midBX - midAX + vectBX*s 
            //vectAY*t = midBY - midAY + vectBY*s
            let s;
            if (vectAX != 0){
                //t = (midBX - midAX)/vectAX + vectBX*s/vectAX
                //vectAY*t - vectBY*s = midBY - midAY

                //t = (midBX - midAX)/vectAX + vectBX*s/vectAX
                //vectAY*((midBX - midAX)/vectAX + vectBX*s/vectAX) - vectBY*s = midBY - midAY
                
                //t = (midBX - midAX)/vectAX + vectBX*s/vectAX
                //s*(vectAY*vectBX/vectAX - vectBY) = midBY - midAY - vectAY(midBX - midAX)/vectAX

                s = (midBY - midAY - vectAY*(midBX - midAX)/vectAX)/(vectAY*vectBX/vectAX - vectBY);
            }else{
                //0 = midBX - midAX + vectBX*s 

                s = (midAX - midBX)/vectBX
            }
            let x = midBX + vectBX*s;
            let y = midBY + vectBY*s;
            let absCurve = 1/Math.sqrt((this.points[i].x - x)**2 + (this.points[i].y - y)**2)
            this.absCurves.push(absCurve)//NOTOPTI
            isPossible = isPossible && absCurve < 3;
        }

        this.absCurves.push(this.absCurves[this.absCurves.length-1]);//dup last absCurve value to have n-1 values
        return isPossible;
    }

    Time(){
        this.time = 0;
        for(let i = 1; i < this.points.length; i++){
            this.time += this.dists[i-1]/car.MaxSpeed(this.absCurves[i-1]);
        }
        return this.time;
    }

    Draw(color = "blue"){
        ui.ctx.strokeStyle = color;
        ui.ctx.fillStyle = color;
        let canvasOffsetX = ui.GetIntParam('offsetX');
        let canvasOffsetY = ui.GetIntParam('offsetY');
        let canvasScale = 0.01*ui.GetIntParam('scale');
        ui.ctx.beginPath();
        for (let i = 1; i < this.points.length; i++) {
            let x1 = this.points[i - 1].x * canvasScale + canvasOffsetX;
            let y1 = this.points[i - 1].y * canvasScale + canvasOffsetY;
            let x2 = this.points[i].x * canvasScale + canvasOffsetX;
            let y2 = this.points[i].y * canvasScale + canvasOffsetY;
            ui.ctx.moveTo(x1, y1);
            ui.ctx.lineTo(x2, y2);
        }
        ui.ctx.stroke();
    }


    CreateMutation(force = 0.2, width = 20) {
        //force : force at which mutationPoint if pushed towards mutationValue (must be in [0,1])
        //width : number of points effected on each side of the mutationPoint (first and last aren't actually effected but start the cos interpolation)
        let newTraj = new Traj();
        let mutationPoint = Math.floor(rand()*this.points.length);
        let mutationValue = rand();

        for (let i = 0; i < this.points.length; i++) {
            if(Math.abs(mutationPoint - i) <= width){
                let blend = force*0.5*(Math.cos(pi*(mutationPoint - i)/width) + 1);
                newTraj.laterals[i] = blend*mutationValue + (1-blend)*this.laterals[i];
            }else{
                newTraj.laterals[i] = this.laterals[i]
            }
        }
        newTraj.BuildPoints();
        return newTraj;
    }
}