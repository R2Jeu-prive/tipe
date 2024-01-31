import { Point } from "./point.js";
import { Track } from "./track.js";
import { signedCurvatureBetween, mod } from "./utils.js";
import { SmoothSquare } from "./bumps.js";
import { Segment } from "./segment.js";
const LN_250 = Math.log(250);

export class Traj {
    constructor(setCreationTimestamp = false) {
        this.n = Track.extPoints.length;
        this.laterals = []; //array of lateral placement values [n]
        this.points = []; //array of Points in pixel cooridnates [n]
        this.absCurves = []; //array of curvuture values [n]
        this.dists = []; //array of distances in meters to next point [n]
        this.speeds = []; //array of speed between each point [n]
        this.evaluation = -1; //-1 if not yet calculated
        this.creationTimestamp = setCreationTimestamp ? Date.now() : -1;
    }

    static DeepCopy(originTraj, resetCreationTimestamp = false){
        let copy = new Traj(resetCreationTimestamp);
        if(!resetCreationTimestamp){copy.creationTimestamp = originTraj.creationTimestamp;}
        for(let i = 0; i < originTraj.n; i++){
            copy.laterals[i] = originTraj.laterals[i];
        }
        return copy;
    }

    ShiftToStartOffset(){
        let newLats = []
        for(let i = 0; i < Track.extPoints.length; i++){
            newLats.push(this.laterals[mod(i + Track.startOffset, Track.extPoints.length)])
        }
        this.laterals = newLats;
        this.evaluation = -1;//invalidate previous evaluations
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

    ResetAsParent(parentTraj, mutateStart, mutateEnd){
        this.evaluation = -1;//invalidate previous evaluations
        for(let i = mutateStart; i < mutateEnd; i = i+1){
            this.laterals[i] = parentTraj.laterals[mod(i, this.n)];
        }
    }

    Mutate(force = 0.2, semiWidth = 20, mutationMode = "bump") {
        this.evaluation = -1;//invalidate previous evaluations
        let chosenSemiWidth = semiWidth;
        if(semiWidth == 0){
            chosenSemiWidth = Math.round(Math.exp(Math.random()*LN_250));//more small semi width than long
        }
        if(mutationMode == "bump"){
            return this.MutateBump(force, chosenSemiWidth);
        }else if(mutationMode == "wind"){
            return this.MutateWind(force, 0, chosenSemiWidth);
        }else{
            console.log("Mutation Mode Not Yet Implemented");   
        }/*else if(mutationMode == "both"){
            if(rand() >= 0.5){//coin flip
                this.MutateBump(force, chosenSemiWidth);
            }else{
                this.MutateWind(force, chosenSemiWidth, chosenSemiWidth + 15)
            }
        }*/
    }

    MutateBump(force, semiWidth) {
        //force : force at which mutationPoint if pushed towards mutationValue (must be in [0,1])
        //semiWidth : number of points effected on each side of the mutationPoint (first and last aren't actually effected but start the cos interpolation)
        let mutationPoint = Math.floor(Math.random()*this.n);
        let mutateStart = mod((mutationPoint - semiWidth), this.n);
        let mutateEnd = mod((mutationPoint + semiWidth), this.n);

        //set variable mutation value min and max to not unfavor close to track limit trajs 
        let minMutationValue = 0;
        let maxMutationValue = 1;
        if(this.laterals[mutationPoint] >= 0.5){
            minMutationValue = 1-(2*this.laterals[mutationPoint]);
        }else{
            maxMutationValue = 2*this.laterals[mutationPoint];
        }

        let mutationValue = minMutationValue + (maxMutationValue - minMutationValue)*Math.random();
        let i = -semiWidth + 1;
        for (let i = -semiWidth + 1; i < semiWidth; i++) {
            let blend = force*SmoothSquare.soft.GetValue(i,semiWidth);
            let current = mod((mutationPoint + i), this.n);
            this.laterals[current] = blend*mutationValue + (1-blend)*this.laterals[current];
            if(this.laterals[current] < 0){this.laterals[current] = 0;}
            if(this.laterals[current] > 1){this.laterals[current] = 1;}
        }
        return [(mutationPoint - semiWidth), (mutationPoint + semiWidth)];//can be outside [0, n-1] but first el must be smaller than second;
    }

    /**
     * @param {Number} force 0 is no mutation 1 is potentially strong mutation
     * @param {Number} hardWindSemiWidth zone in which points will be moved the same amount as mutationPoint
     * @param {Number} softWindSemiWidth total zone of effect (hardWind + blending)
     */
    MutateWind(force, hardWindSemiWidth, softWindSemiWidth){
        this.evaluation = -1;//invalidate evaluation
        let mutationPoint = Math.floor(Math.random()*this.n);
        
        let minMutationValue = 0;
        let maxMutationValue = 1;
        if(this.laterals[mutationPoint] >= 0.5){
            minMutationValue = 1-(2*this.laterals[mutationPoint]);
        }else{
            maxMutationValue = 2*this.laterals[mutationPoint];
        }
        let mutationValue = minMutationValue + (maxMutationValue - minMutationValue)*Math.random();
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
        let newLateralsValid = true;
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
                newLateralsValid = false;
                break;
            }else{
                newLaterals.push(newLateralsHere[0]);
            }
        }
        
        if(!newLateralsValid){
            throw new Error('Mutation could not be placed back on track');
        }

        //modify traj (all laterals exist)
        for(let i = -softWindSemiWidth; i <= softWindSemiWidth; i++){
            let currentIndex = mod(mutationPoint + i, this.n);
            this.laterals[currentIndex] = newLaterals[i + softWindSemiWidth];
        }

        return [(mutationPoint - softWindSemiWidth), (mutationPoint + softWindSemiWidth)];//can be outside [0, n-1] but first el must be smaller than second;
    }
}
