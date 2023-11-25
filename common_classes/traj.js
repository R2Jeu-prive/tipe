let {Point} = require("./point");
let {Track} = require("./track");
let {signedCurvatureBetween, mod} = require("./utils");
const LN_250 = Math.log(250);

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

    ToString(){
        
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
        this.absCurves = [Math.abs(signedCurvatureBetween(this.points[this.n-1], this.points[0], this.points[1], Track.pxToMetersRatio))];
        for(let i = 1; i < this.n-1; i++){
            this.absCurves.push(Math.abs(signedCurvatureBetween(this.points[i-1], this.points[i], this.points[i+1], Track.pxToMetersRatio)))
            physicallyPossible = physicallyPossible && Math.abs(this.absCurves[i]) < 0.5;//not tighter than 2m radius turn
        }
        this.absCurves.push(Math.abs(signedCurvatureBetween(this.points[this.n-2], this.points[this.n-1], this.points[0], Track.pxToMetersRatio)))
        return physicallyPossible;//TODO not checking first and last
    }

    Evaluate(mode){
        if(this.evaluation > 0){
            return;
        }
        this.BuildPoints();
        this.CalcDists();
        this.CalcCurvature();
        if(mode == "distance"){
            this.evaluation = 0;
            for(let i = 0; i < this.n; i++){
                this.evaluation += this.dists[i];
            }
        }else if(mode == "curvature"){
            this.evaluation = 0;
            for(let i = 0; i < this.points.length; i++){
                this.evaluation += Math.pow(this.absCurves[i]*100, 2)*this.dists[i];
            }
        }
    }


    Mutate(force = 0.2, semiWidth = 20, evolutionMode = "bump") {
        let chosenSemiWidth = semiWidth;
        if(semiWidth == 0){
            chosenSemiWidth = Math.round(Math.exp(rand()*LN_250));//more small semi width than long
        }
        if(mutationMode == "bump"){
            this.MutateBump(force, chosenSemiWidth);
        }else if(mutationMode == "wind"){
            this.MutateWind(force, chosenSemiWidth, chosenSemiWidth + 15);
        }else if(mutationMode == "both"){
            if(rand() >= 0.5){//coin flip
                this.MutateBump(force, chosenSemiWidth);
            }else{
                this.MutateWind(force, chosenSemiWidth, chosenSemiWidth + 15)
            }
        }
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

    /**
     * @param {Number} force 0 is no mutation 1 is potentially strong mutation
     * @param {Number} hardWindSemiWidth zone in which points will be moved the same amount as mutationPoint
     * @param {Number} softWindSemiWidth total zone of effect (hardWind + blending)
     */
    MutateWind(force, hardWindSemiWidth, softWindSemiWidth){
        this.evaluation = -1;//invalidate evaluation
        let mutationPoint = Math.floor(rand()*this.n);
        let mutationValue = rand();
        mutationValue = this.laterals[mutationPoint] + force*(mutationValue - this.laterals[mutationPoint]);
        let initialMutationPoint = Segment.CalcPointAtLateral(Track.extPoints[mutationPoint], Track.intPoints[mutationPoint], this.laterals[mutationPoint]);
        let wantedMutationPoint = Segment.CalcPointAtLateral(Track.extPoints[mutationPoint], Track.intPoints[mutationPoint], mutationValue);
        let windVector = wantedMutationPoint.Minus(initialMutationPoint);

        //create movedPoints
        let movedPoints = [];
        for(let i = -softWindSemiWidth; i <= softWindSemiWidth; i++){
            let currentIndex = mod(mutationPoint + i, this.n);
            let blend;
            if(Math.abs(i) <= hardWindSemiWidth){
                blend = 1;
            }else if(i < 0){
                blend = i/(softWindSemiWidth-hardWindSemiWidth) + softWindSemiWidth/(softWindSemiWidth-hardWindSemiWidth);
            }else if(i > 0){
                blend = i/(hardWindSemiWidth-softWindSemiWidth) - softWindSemiWidth/(hardWindSemiWidth-softWindSemiWidth);
            }
            let originalPoint = Segment.CalcPointAtLateral(Track.extPoints[currentIndex], Track.intPoints[currentIndex], this.laterals[currentIndex]);
            movedPoints.push(originalPoint.Plus(windVector.Scale(blend)));
        }

        //recalculate laterals for these moved points
        let newLaterals = [];
        for(let i = -softWindSemiWidth; i <= softWindSemiWidth; i++){
            let currentIndex = mod(mutationPoint + i, this.n);
            if(Math.abs(i) == softWindSemiWidth){
                newLaterals.push(this.laterals[currentIndex]);//first and last point haven't moved (avoids near miss intersection)
                continue;
            }
            let newLateralsHere = [];
            for(let j = 0; j < movedPoints.length-1; j++){
                let newLateralValue = Segment.Intersection(Track.extPoints[currentIndex], Track.intPoints[currentIndex], movedPoints[j], movedPoints[j+1]);
                if(newLateralValue != null){
                    newLateralsHere.push(newLateralValue);
                }
            }
            if(newLateralsHere.length != 1){
                //new traj is off track or zigzags on a lateral
                return false;
            }else{
                newLaterals.push(newLateralsHere[0]);
            }
        }

        //modify traj (all laterals exist)
        for(let i = -softWindSemiWidth; i <= softWindSemiWidth; i++){
            let currentIndex = mod(mutationPoint + i, this.n);
            this.laterals[currentIndex] = newLaterals[i + softWindSemiWidth];
        }

        return true;
    }
}

module.exports = {Traj};