class Traj {
    constructor() {
        this.n = Track.extPoints.length;
        this.laterals = []; //array of lateral placement values [n]
        this.points = []; //array of Points [n]
        this.absCurves = []; //array of curvuture values [n]
        this.dists = []; //array of distances to next point [n]
        this.speeds = []; //array of speed between each point [n]
        this.isBuilt = false;
        this.evaluation = -1;
    }

    static DeepCopy(originTraj){
        let copy = new Traj();
        for(let i = 0; i < originTraj.n; i++){
            copy.laterals[i] = originTraj.laterals[i];
        }
        return copy;
    }

    BuildPoints(){
        this.points = [];
        for (let i = 0; i < Track.extPoints.length; i++) {
            let x = (1-this.laterals[i])*Track.extPoints[i].x + this.laterals[i]*Track.intPoints[i].x;
            let y = (1-this.laterals[i])*Track.extPoints[i].y + this.laterals[i]*Track.intPoints[i].y;
            this.points.push(new Point(x, y));
        }
    }

    CalcDists(){
        this.dists = [];
        for (let i = 0; i < this.n-1; i++) {
            this.dists.push(Track.pxToMetersRatio*this.points[i].DistTo(this.points[i+1]));
        }
        this.dists.push(Track.pxToMetersRatio*this.points[this.n-1].DistTo(this.points[0]));
    }

    CalcCurvature(){
        let physicallyPossible = true;
        this.absCurves = [Math.abs(SignedCurvatureBetween(this.points[this.n-1], this.points[0], this.points[1]))];
        for(let i = 1; i < this.n-1; i++){
            this.absCurves.push(Math.abs(SignedCurvatureBetween(this.points[i-1], this.points[i], this.points[i+1])))
            physicallyPossible = physicallyPossible && Math.abs(this.absCurves[i]) < 0.5;//not tighter than 2m radius turn
        }
        this.absCurves.push(Math.abs(SignedCurvatureBetween(this.points[this.n-2], this.points[this.n-1], this.points[0])))
        return physicallyPossible;//TODO not checking first and last
    }

    Evaluate(mode){
        if(this.evaluation > 0){
            return;
        }
        this.BuildPoints();
        this.CalcDists();
        this.CalcCurvature();
        if(mode == "minDistance"){
            this.evaluation = 0;
            for(let i = 0; i < this.n; i++){
                this.evaluation += this.dists[i];
            }
        }else if(mode == "minCurvature"){
            this.evaluation = 0;
            for(let i = 0; i < this.points.length; i++){
                this.evaluation += Math.pow(this.absCurves[i]*100, 2)*this.dists[i];
            }
        }
    }


    Mutate(force = 0.2, semiWidth = 20) {
        if(semiWidth == 0){
            let randomSemiWidth = Math.round(Math.exp(rand()*LN_250));//more small semi width than long
            return this.MutateBump(force, randomSemiWidth);
        }
        return this.MutateBump(force, semiWidth);
    }

    MutateBump(force, semiWidth) {
        this.evaluation = -1;//invalidate evaluation
        //force : force at which mutationPoint if pushed towards mutationValue (must be in [0,1])
        //semiWidth : number of points effected on each side of the mutationPoint (first and last aren't actually effected but start the cos interpolation)
        let mutationPoint = Math.floor(rand()*this.n);
        //if(Track.lateralZoneWeights[mutationPoint] > 0.5 && Track.lateralZoneWeights[mutationPoint] < 9.5){return this.MutateBump(force,semiWidth);}//hairpin
        //if(Track.lateralZoneWeights[mutationPoint] > 1.5 || Track.lateralZoneWeights[mutationPoint] < 0.5){return this.MutateBump(force,semiWidth);}//chicane
        //if(Track.lateralZoneWeights[mutationPoint] > 4 || Track.lateralZoneWeights[mutationPoint] < 2){return this.MutateBump(force,semiWidth);}//first turns
        let mutateStart = mod((mutationPoint - semiWidth), this.n);
        let mutateEnd = mod((mutationPoint + semiWidth), this.n);
        let minMutationValue = 0;
        let maxMutationValue = 1;
        if(this.laterals[mutationPoint] >= 0.5){
            minMutationValue = 1-(2*this.laterals[mutationPoint]);
        }else{
            maxMutationValue = 2*this.laterals[mutationPoint];
        }
        let mutationValue = minMutationValue + (maxMutationValue - minMutationValue)*rand();
        let i = -semiWidth + 1;
        for (let i = -semiWidth + 1; i < semiWidth; i++) {
            let blend = force*SmoothSquare.soft.GetValue(i,semiWidth);
            let current = mod((mutationPoint + i), this.n);
            this.laterals[current] = blend*mutationValue + (1-blend)*this.laterals[current];
            if(this.laterals[current] < 0){this.laterals[current] = 0;}
            if(this.laterals[current] > 1){this.laterals[current] = 1;}
        }
        return [mutateStart, mutateEnd];
    }
}