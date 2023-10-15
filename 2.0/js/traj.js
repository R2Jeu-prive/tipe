class Traj {
    constructor() {
        this.n = Track.extPoints.length;
        this.laterals = []; //array of lateral placement values [n]
        this.points = []; //array of Points [n]
        this.absCurves = []; //array of curvuture values [n]
        this.dists = []; //array of distances to next point [n]
        this.speeds = []; //array of speed between each point [n]
        this.evaluation = -1;
        for (let i = 0; i < Track.extPoints.length; i++) {
            this.laterals.push(0.5);
            this.points.push(new Point(0,0));
        }
    }

    BuildPoints(){
        for (let i = 0; i < Track.extPoints.length; i++) {
            this.points[i].x = (1-this.laterals[i])*Track.extPoints[i].x + this.laterals[i]*Track.intPoints[i].x;
            this.points[i].y = (1-this.laterals[i])*Track.extPoints[i].y + this.laterals[i]*Track.intPoints[i].y;
        }
    }

    CalcDists(){
        this.dists = [];
        for (let i = 0; i < this.n-1; i++) {
            this.dists.push(Track.pxToMetersRatio*this.points[i].DistTo(this.points[i+1]));
        }
        this.dists.push(Track.pxToMetersRatio*this.points[this.n-1].DistTo(this.points[0]));
    }

    CalcAbsCurve(){
        let physicallyPossible = true;
        this.absCurves = [Math.abs(SignedCurvatureBetween(this.points[this.n-1], this.points[0], this.points[1]))];
        for(let i = 1; i < this.n-1; i++){
            this.absCurves.push(Math.abs(SignedCurvatureBetween(this.points[i-1], this.points[i], this.points[i+1])))
            physicallyPossible = physicallyPossible && Math.abs(this.absCurves[i]) < 0.5;//not tighter than 2m radius turn
        }
        this.absCurves.push(Math.abs(SignedCurvatureBetween(this.points[this.n-2], this.points[this.n-1], this.points[0])))
        return physicallyPossible;//TODO not checking first and last
    }

    CalcSpeed(){
        this.speeds = [5];//initial speed in m/s
        for (let i = 1; i < Track.extPoints.length; i++) {
            this.speeds.push(Math.min(Car.MaxSpeed(this.absCurves[i]), Math.sqrt(2*Car.GetEffectiveMaxAcceleration(this.speeds[i-1])*this.dists[i-1] + this.speeds[i-1]**2)))
        }

        //back propageation to take into account breaking
        for (let i = Track.extPoints.length-1; i > 0; i--) {
            this.speeds[i-1] = Math.min(this.speeds[i-1], Math.sqrt(this.speeds[i]**2 - 2*Car.GetEffectiveMaxDecceleration(this.speeds[i])*this.dists[i-1]))
        }
    }

    Evaluate(){
        let mode = Family.evaluationMode;
        this.CalcDists();
        if(mode == "minDistance"){
            this.evaluation = 0;
            for(let i = 0; i < this.n; i++){
                this.evaluation += this.dists[i];
            }
        }else if(mode == "minCurvature"){
            this.evaluation = 0;
            for(let i = 0; i < this.points.length; i++){
                this.evaluation += Math.pow(this.absCurves[i], 2)*this.dists[i];
                //this.evaluation += Math.pow(0.05 + this.absCurves[i],2)*this.dists[i];
                //this.evaluation += Math.pow(this.absCurves[i]*this.dists[i-1], 4);
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

    CopyLateralsFrom(parentTraj, copyStart, copyEnd){
        let i = copyStart;
        while (i != copyEnd){
            this.laterals[i] = parentTraj.laterals[i];
            i = mod((i+1), this.n);
        }
        this.laterals[copyEnd] = parentTraj.laterals[copyEnd];
    }


    Mutate(force = 0.2, semiWidth = 20) {
        if(semiWidth == 0){
            semiWidth = Math.pow(2, Math.floor(rand()*8));
        }
        return this.MutateBump(force,semiWidth);
        /*if(Family.mutationMode == "bump"){return this.MutateBump(force, width);}
        if(Family.mutationMode == "shift"){return this.MutateShift(force, width);}
        let rand = Math.round(Math.random());
        if(rand == 0){return this.MutateShift(force, width);}
        else{return this.MutateBump(force, width);}*/
    }

    MutateBump(force, semiWidth) {
        //force : force at which mutationPoint if pushed towards mutationValue (must be in [0,1])
        //semiWidth : number of points effected on each side of the mutationPoint (first and last aren't actually effected but start the cos interpolation)
        let mutationPoint = Math.floor(rand()*this.n);
        //if(Track.lateralZoneWeights[mutationPoint] > 0.5 && Track.lateralZoneWeights[mutationPoint] < 9.5){return this.MutateBump(force,semiWidth);}//hairpin
        //if(Track.lateralZoneWeights[mutationPoint] > 1.5 || Track.lateralZoneWeights[mutationPoint] < 0.5){return this.MutateBump(force,semiWidth);}//chicane
        //if(Track.lateralZoneWeights[mutationPoint] > 4 || Track.lateralZoneWeights[mutationPoint] < 2){return this.MutateBump(force,semiWidth);}//first turns
        let mutateStart = mod((mutationPoint - semiWidth), this.n);
        let mutateEnd = mod((mutationPoint + semiWidth), this.n);
        //let mutationValue = rand();
        let minMutationValue = 0;
        let maxMutationValue = 1;
        if(this.laterals[mutationPoint] >= 0.5){
            minMutationValue = 1-(2*this.laterals[mutationPoint]);
        }else{
            maxMutationValue = 2*this.laterals[mutationPoint];
        }
        let mutationValue = minMutationValue + (maxMutationValue - minMutationValue)*rand();
        //let mutationValue = rand()
        let i = -semiWidth + 1;
        for (let i = -semiWidth + 1; i < semiWidth; i++) {
            let cosInterpol = 0.5 + 0.5*Math.cos(pi*i/semiWidth);//0 at -semiWidth; 1 at 0; 0 at semiWidth
            let blend = cosInterpol*force;
            let current = mod((mutationPoint + i), this.n);
            this.laterals[current] = blend*mutationValue + (1-blend)*this.laterals[current];
            if(this.laterals[current] < 0){this.laterals[current] = 0;}
            if(this.laterals[current] > 1){this.laterals[current] = 1;}
        }
        return [mutateStart, mutateEnd];
    }

    /*MutateShift(force, width) {
        //force : weight of the new shifted values when reapplied to original array of laterals (must be in [0,1])
        //width : number of shifted points
        let mutateStart = Math.max(Math.floor(Math.random()*this.laterals.length), 0);
        let mutateEnd = Math.min(mutateStart + width, this.laterals.length-1);
        let rand = Math.round(Math.random());
        if(rand == 0){
            //shift foraward (delay actions)
            let mem = this.laterals[mutateStart];
            for(let i = mutateStart; i < mutateEnd; i++){
                let prevmem = mem;
                mem = this.laterals[i+1];
                this.laterals[i+1] = prevmem*force + mem*(1-force);
            }
        }else{
            //shift backword (anticipate actions)
            for(let i = mutateStart; i <= mutateEnd; i++){
                this.laterals[i] = this.laterals[i+1]*force + this.laterals[i]*(1-force);
            }
        }
        //console.log(JSON.parse(JSON.stringify(this.laterals)));
        return [mutateStart, mutateEnd];
    }*/
}