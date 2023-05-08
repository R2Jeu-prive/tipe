class Traj {
    constructor() {
        this.laterals = []; //array of lateral placement values [n]
        this.points = []; //array of Points [n]
        this.absCurves = []; //array of curvuture values [n]
        this.dists = []; //array of distances between each point [n-1]
        this.speeds = []; //array of speed between each point [n]
        this.evaluation = -1;
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
        this.absCurves = [0];//consider first point to be at curve = 0
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
            let midAX = (this.points[i-2].x + this.points[i-1].x)/2;
            let midAY = (this.points[i-2].y + this.points[i-1].y)/2;
            let midBX = (this.points[i-1].x + this.points[i].x)/2;
            let midBY = (this.points[i-1].y + this.points[i].y)/2;
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
            let absCurve = 1/Math.sqrt((this.points[i].x - x)**2 + (this.points[i].y - y)**2);
            this.absCurves.push(absCurve);//NOTOPTI
            isPossible = isPossible && absCurve < 3;//TODO 3 to be related to track width or car ?
        }
        this.absCurves.push(0);//consider last point to be at curve = 0
        return isPossible;
    }

    CalcSpeed(){
        this.speeds = [0];
        for (let i = 1; i < track.points.length; i++) {
            this.speeds.push(Math.min(car.MaxSpeed(this.absCurves[i]), Math.sqrt(2*car.maxAcceleration*this.dists[i-1] + this.speeds[i-1]**2)))
        }

        //back propageation to take into account breaking
        for (let i = track.points.length-1; i > 0; i--) {
            this.speeds[i-1] = Math.min(this.speeds[i-1], Math.sqrt(this.speeds[i]**2 - 2*car.maxDecceleration*this.dists[i-1]))
        }
    }

    Evaluate(mode = "minDistance"){
        this.CalcDists();
        if(mode == "minDistance"){
            this.evaluation = 0;
            for(let i = 1; i < this.points.length; i++){
                this.evaluation += this.dists[i-1];
            }
        }else if(mode == "minCurvature"){
            this.evaluation = 0;
            for(let i = 1; i < this.points.length; i++){
                this.evaluation += Math.pow(this.absCurves[i], 2)*this.dists[i-1];
            }
        }else{
            this.CalcSpeed();
            this.evaluation = 0;
            for(let i = 1; i < this.points.length; i++){
                this.evaluation += this.dists[i-1]/this.speeds[i];
            }
        }
        return this.evaluation;
    }

    Draw(){
        let canvasOffsetX = ui.GetFloatParam('offsetX');
        let canvasOffsetY = ui.GetFloatParam('offsetY');
        let canvasScale = 0.01*ui.GetFloatParam('scale');
        let mode = ui.GetSelectParam("trajColorIndicator")
        let visualScaler = ui.GetFloatParam("visualScaler")
        for (let i = 1; i < this.points.length; i++) {
            let x1 = this.points[i - 1].x * canvasScale + canvasOffsetX;
            let y1 = this.points[i - 1].y * canvasScale + canvasOffsetY;
            let x2 = this.points[i].x * canvasScale + canvasOffsetX;
            let y2 = this.points[i].y * canvasScale + canvasOffsetY;
            if(mode == "curvature"){
                let rgb = hslToRgb(120-visualScaler*this.absCurves[i],100,50)
                let r = toHex(Math.floor(rgb[0]));
                let g = toHex(Math.floor(rgb[1]));
                let b = toHex(Math.floor(rgb[2]));
                ui.ctx.strokeStyle = "#" + r + g + b;
            }else if(mode == "speed"){
                let rgb = hslToRgb(visualScaler*this.speeds[i],100,50)
                let r = toHex(Math.floor(rgb[0]));
                let g = toHex(Math.floor(rgb[1]));
                let b = toHex(Math.floor(rgb[2]));
                ui.ctx.strokeStyle = "#" + r + g + b;
            }else if(mode == "acceleration"){
                let acceleration = visualScaler*(this.speeds[i] - this.speeds[i-1])*(this.speeds[i] + this.speeds[i-1])/this.dists[i-1]
                let r = toHex(Math.ceil(Math.min(0,acceleration)));
                let g = toHex(Math.ceil(Math.max(0,acceleration)));
                let b = toHex(0);
                ui.ctx.strokeStyle = "#" + r + g + b;
            }
            
            ui.ctx.lineWidth = 5;
            ui.ctx.beginPath();
            ui.ctx.moveTo(x1, y1);
            ui.ctx.lineTo(x2, y2);
            ui.ctx.stroke();
        }
    }

    CopyLateralsFrom(parentTraj, copyStart, copyEnd){
        for (let i = copyStart; i <= copyEnd; i++) {
            this.laterals[i] = parentTraj.laterals[i];
        }
    }


    Mutate(force = 0.2, width = 20) {
        //force : force at which mutationPoint if pushed towards mutationValue (must be in [0,1])
        //width : number of points effected on each side of the mutationPoint (first and last aren't actually effected but start the cos interpolation)
        let mutationPoint = Math.floor(rand()*this.laterals.length);
        let mutateStart = Math.max(mutationPoint - width, 0)
        let mutateEnd = Math.min(mutationPoint + width, this.laterals.length-1);
        let minMutationValue = 0;
        let maxMutationValue = 1;
        if(this.laterals[mutationPoint] >= 0.5){
            minMutationValue = 1-(2*this.laterals[mutationPoint]);
        }else{
            maxMutationValue = 2*this.laterals[mutationPoint];
        }
        let mutationValue = minMutationValue + (maxMutationValue - minMutationValue)*rand();
        //let mutationValue = rand();

        for (let i = mutateStart; i <= mutateEnd; i++) {
            let blend = force*0.5*(Math.cos(pi*(mutationPoint - i)/width) + 1);
            this.laterals[i] = blend*mutationValue + (1-blend)*this.laterals[i];
        }
        return [mutateStart, mutateEnd];
    }
}