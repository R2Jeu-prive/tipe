import { SmoothBorderLoop } from "./smoothBorderLoop.js";
import { Point } from "./point.js";
import { TrackZone } from "./trackZone.js";
import { Villeneuve } from "./villeneuve.js";

export class Track{
    /**
     * @param {String} name 
     */
    constructor(name){
        this.name = name;

        var staticTrackClass;
        if(name == "Villeneuve"){staticTrackClass = Villeneuve;}
        else{
            console.error("Invalid track name : " + name);
        }

        /** @type {Point} */
        this.topleftGoogleEarthTile;
        /** @type {Number} int */
        this.numOfTiles;
        /** @type {String} */
        this.pathToTiles;
        /** @type {Number} */
        this.pxToMetersRatio;
        /** @type {SmoothBorderLoop} */
        this.intBorder = new SmoothBorderLoop();
        /** @type {SmoothBorderLoop} */
        this.extBorder = new SmoothBorderLoop();
        /** @type {Point[]} */
        this.intPoints = [];
        /** @type {Point[]} */
        this.extPoint = [];
        /** @type {TrackZone[]} */
        this.zones = [];
        /** @type {Number[]} */
        this.lateralZoneWeights = [];
        /** @type {Number} int*/
        this.startOffset;
        /** @type {Number} int*/
        this.distBetweenLaterals;
        
        //copy real values from staticTrackClass
        for(let prop in staticTrackClass){
            this[prop] = staticTrackClass[prop];
        }
        
        this.GenerateBorderPoints(this.distBetweenLaterals);
        this.n = this.intPoints.length;
        this.GenerateZoneWeights();
        this.SetStartAt();
    }

    /**
     * Shifts laterals by the start index so that laterals[0] is start finish line
     */
    SetStartAt(){
        for(let i = 0; i < this.startOffset; i++){
            this.intPoints.push(this.intPoints.shift());
            this.extPoints.push(this.extPoints.shift());
            this.lateralZoneWeights.push(this.lateralZoneWeights.shift());
        }
    }

    GenerateBorderPoints(){
        let quadDistConstraint = this.distBetweenLaterals*this.distBetweenLaterals;
        let precision = 1;
        //set first lateral at intBorder t=0;
        let tIntList = [0];
        this.intPoints = [this.intBorder.GetPointAtParam(0)];
        let tExtList = [this.intBorder.GetOtherBorderT(this.extBorder, 0)];
        this.extPoints = [this.extBorder.GetPointAtParam(tExtList[0])];

        while(true){//loop over number of points
            let lastIndex = tIntList.length - 1;
            let intTMin = tIntList[lastIndex];
            let intTMax = this.intBorder.GetParamAtDist(this.distBetweenLaterals, tIntList[lastIndex]);
            let intT;
            let extT;
            let intPoint;
            let extPoint;
            
            while(true){//dichotmy to create point with valid constraints
                intT = 0.5*(intTMin + intTMax);
                intPoint = this.intBorder.GetPointAtParam(intT);
                extT = this.intBorder.GetOtherBorderT(this.extBorder, intT);
                extPoint = this.extBorder.GetPointAtParam(extT);
                let quadDistInt = intPoint.QuadDistTo(this.intPoints[lastIndex]);
                let quadDistExt = extPoint.QuadDistTo(this.extPoints[lastIndex]);
                if(quadDistExt < quadDistConstraint && Math.abs(quadDistInt - quadDistConstraint) < precision){
                    break;//constrained reached on intBorder with outBorder not too big
                }else if(Math.abs(quadDistExt - quadDistConstraint) < precision){
                    break;//constrained reached on extBorder so valid on intBorder too
                }else if(quadDistExt > quadDistConstraint + precision){
                    intTMax = intT;
                }else if(quadDistExt < quadDistConstraint - precision){
                    intTMin = intT;
                }else{
                    throw new Error("Fatal Error When Building Track Border Points");
                }
            }

            if(intT > this.intBorder.cubics.length){
                break;
            }

            tIntList.push(intT);
            tExtList.push(extT);
            this.intPoints.push(intPoint);
            this.extPoints.push(extPoint);
        }

        this.GenerateZoneLateralIntervals(tIntList);//do this while we have tIntList available
    }

    GenerateZoneLateralIntervals(tList){
        //transforms zone starts and ends from tvalues to lateral indexes

        //set zone 0 to start at lateral 0
        this.zones[0].SetStartLateral(0);
        
        for(let i = 1; i < tList.length; i++){//loop on laterals
            let lastT = tList[i-1];
            let currentT = tList[i];
            for(let j = 0; j < this.zones.length; j++){//loop on zones
                let zone = this.zones[j];
                if(lastT < zone.startT && currentT >= zone.startT){
                    zone.SetStartLateral(i);
                }
                if(lastT < zone.endT && currentT >= zone.endT){
                    zone.SetEndLateral(i);
                }
            }
        }
    }

    GenerateZoneWeights(){
        //weights typically between 0 and n-1 (n zones) 2.3 -> 0.7*zone2 + 0.3*zone3
        //if between -1 and 0 this means it's a mix between lastzone (-1) and first zone (0)
        const CalcZoneWeight = function(indexA, indexB, currentIndex, zoneA){
            let a = 1/(indexB-indexA);
            let b = -indexA*a;
            return zoneA + a*currentIndex+b;
        }

        let currentZoneId = 0;
        this.lateralZoneWeights = []

        //complete array for the first few laterals that blend between last and first zone
        for(let i = 0; i <= this.zones[this.zones.length-1].endLateral; i++){
            this.lateralZoneWeights.push(CalcZoneWeight(0, this.zones[this.zones.length-1].endLateral, i, -1))//so value between -1 and 0
        }

        //loop on laterals except first few which are in zone n-1 and 0
        for(let i = this.zones[this.zones.length-1].endLateral + 1; i < this.n; i++){
            if(currentZoneId != this.zones.length-1 && this.zones[currentZoneId].endLateral < i){currentZoneId += 1;}//change current zone if left

            if(currentZoneId < (this.zones.length-1) && this.zones[currentZoneId+1].startLateral <= i){
                //we are in mixed zones currentZoneId ~ currentZoneId+1
                this.lateralZoneWeights.push(CalcZoneWeight(this.zones[currentZoneId+1].startLateral, this.zones[currentZoneId].endLateral, i, currentZoneId));
            }else{
                //we are in currenZoneId only
                this.lateralZoneWeights.push(currentZoneId);
            }
        }
    }
}
