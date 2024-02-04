import { Point } from "./point.js";
import { signedCurvatureBetween, mod } from "./utils.js";
import { SmoothSquare } from "./bumps.js";
import { Segment } from "./segment.js";
import { Track } from "./track.js";
import { Car } from "./car.js";
const LN_250 = Math.log(250);

export class Traj {
    /**
     * @param {Number} n int number of laterals
     * @param {Boolean} setCreationTimestamp 
     */
    constructor(n, setCreationTimestamp = false) {
        this.n = n;
        this.laterals = []; //array of lateral placement values [n]
        /** @type {Point[]} */
        this.points = []; //array of Points in pixel cooridnates [n]
        this.absCurv = []; //array of curvature values [n]
        this.dists = []; //array of distances in meters to next point [n]
        this.speed1 = []; //array of speed  m/s at each point [n] after first pass
        this.speed2 = []; //array of speed in m/s at each point [n] after second pass
        this.speed3 = []; //array of speed in m/s at each point [n] after third pass
        this.evaluation = -1; //-1 if not yet calculated
        this.creationTimestamp = setCreationTimestamp ? Date.now() : -1;
    }

    static DeepCopy(originTraj, resetCreationTimestamp = false){
        let copy = new Traj(originTraj.n, resetCreationTimestamp);
        if(!resetCreationTimestamp){copy.creationTimestamp = originTraj.creationTimestamp;}
        for(let i = 0; i < originTraj.n; i++){
            copy.laterals[i] = originTraj.laterals[i];
        }
        return copy;
    }

    /**
     * @param {Number} offset int that represents the number of laterals to shift 
     */
    Shift(offset){
        let newLats = []
        for(let i = 0; i < this.n; i++){
            newLats.push(this.laterals[mod(i + offset, this.n)])
        }
        this.laterals = newLats;
        this.evaluation = -1;//invalidate previous evaluations
    }

    /**
     * @param {Track} track 
     */
    BuildPoints(track){
        this.points = [];
        for (let i = 0; i < track.n; i++) {
            let x = (1-this.laterals[i])*track.extPoints[i].x + this.laterals[i]*track.intPoints[i].x;
            let y = (1-this.laterals[i])*track.extPoints[i].y + this.laterals[i]*track.intPoints[i].y;
            this.points.push(new Point(x, y));
        }
    }

    /**
     * @param {Track} track 
     */
    CalcDists(track){
        this.dists = [];
        for (let i = 0; i < this.n-1; i++) {
            this.dists.push(track.pxToMetersRatio*this.points[i].DistTo(this.points[i+1]));
        }
        this.dists.push(track.pxToMetersRatio*this.points[this.n-1].DistTo(this.points[0]));
    }

    /**
     * @param {Track} track 
     */
    CalcCurvature(track){
        let physicallyPossible = true;
        this.absCurv = [Math.abs(signedCurvatureBetween(this.points[this.n-1], this.points[0], this.points[1], track.pxToMetersRatio))];
        for(let i = 1; i < this.n-1; i++){
            this.absCurv.push(Math.abs(signedCurvatureBetween(this.points[i-1], this.points[i], this.points[i+1], track.pxToMetersRatio)))
            physicallyPossible = physicallyPossible && Math.abs(this.absCurv[i]) < 0.5;//not tighter than 2m radius turn
        }
        this.absCurv.push(Math.abs(signedCurvatureBetween(this.points[this.n-2], this.points[this.n-1], this.points[0], track.pxToMetersRatio)))
        return physicallyPossible;//TODO not checking first and last
    }

    /**
     * @param {Car} car 
     */
    CalcSpeeds3Pass(car){
        this.speed1 = [];
        for (let i = 0; i < this.n; i++) {
            if(this.absCurv[i] == 0){
                this.speed1.push(car.theoricalMaxSpeed);
                continue;
            }
            let maxSpeed = Math.sqrt(car.roadFrictionCoef * car.g / this.absCurv[i]);
            if(maxSpeed > car.theoricalMaxSpeed){
                this.speed1.push(car.theoricalMaxSpeed);
            }else{
                this.speed1.push(maxSpeed);
            }
        }

        this.speed2 = this.speed1.map(x => x);
        for (let i = this.n-1; i > 0; i--){
            if(this.speed2[i] <= 0){
                this.speed2[i - 1] = 0;
                continue;
            }

            var Rt;
            let a = Math.pow(car.roadFrictionCoef * car.mass * car.g, 2) - Math.pow(car.mass * this.absCurv[i] * this.speed2[i] * this.speed2[i], 2);
            if(a < 0){
                Rt = 0;
            }else{
                Rt = -Math.sqrt(a);
            }
            this.speed2[i - 1] = -this.dists[i]*(Rt - (car.airDragCoef * this.speed2[i] * this.speed2[i])) / (this.speed2[i] * car.mass) + this.speed2[i]
            if(this.speed1[i - 1] < this.speed2[i - 1]){
                this.speed2[i - 1] = this.speed1[i - 1]
            }
        }
    }

    /**
     * 
     * @param {String} mode 
     * @param {Track} track 
     * @param {Car} car
     */
    Evaluate(mode, track, car){
        if(this.evaluation > 0){
            return;
        }
        this.BuildPoints(track);
        this.CalcDists(track);
        if(mode == "distance"){
            this.evaluation = 0;
            for(let i = 0; i < this.n; i++){
                this.evaluation += this.dists[i];
            }
        }else if(mode == "curvature"){
            this.CalcCurvature(track);
            this.evaluation = 0;
            for(let i = 0; i < this.n; i++){
                this.evaluation += 10000 * Math.pow(this.absCurv[i], 2) * this.dists[i];
            }
        }else if(mode == "time"){
            this.CalcCurvature(track);
            this.CalcSpeeds3Pass(car);
            this.evaluation = 0;
            for(let i = 0; i < this.n; i++){
                this.evaluation += this.speed1[i] * this.dists[i];
            }
        }
    }

    ResetAsParent(parentTraj, mutateStart, mutateEnd){
        this.evaluation = -1;//invalidate previous evaluations
        for(let i = mutateStart; i < mutateEnd; i = i+1){
            this.laterals[i] = parentTraj.laterals[mod(i, this.n)];
        }
    }

    /*Mutate(force = 0.2, semiWidth = 20, mutationMode = "bump") {
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
        }
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
    }*/

    /**
     * @param {Number} force 0 is no mutation 1 is potentially strong mutation
     * @param {Number} hardWindSemiWidth zone in which points will be moved the same amount as mutationPoint
     * @param {Number} softWindSemiWidth total zone of effect (hardWind + blending)
     */
    /*MutateWind(force, hardWindSemiWidth, softWindSemiWidth){
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
    }*/
}
