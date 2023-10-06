class Track{
    static topleftGoogleEarthTile;
    static numOfTiles;
    static pathToTiles;
    static intBorder = new SmoothBorderLoop();
    static extBorder = new SmoothBorderLoop();
    static extPoints = [new Point()];
    static intPoints = [new Point()];
    static zones = [new TrackZone()];
    static lateralZoneWeights = [];
    //weights typically between 0 and n-1 (n zones) 2.3 -> 0.7*zone2 + 0.3*zone3
    //if between -1 and 0 this means it's a mix between lastzone (-1) and first zone (0)

    static Init(trackClass){
        for(let prop in trackClass){
            Track[prop] = trackClass[prop];
        }
        this.GenerateBorderPoints(48);//48 (empirical) to void last and first lateral being too close or too far appart
        this.GenerateZoneWeights();
    }

    static DrawTile(u,v,canvasX,canvasY){
        let img = new Image();
        let tileSize = Math.max(256*Math.pow(2,UI.zoom), 256);
        let x = u + this.topleftGoogleEarthTile.x;
        let y = v + this.topleftGoogleEarthTile.y;
        let path = this.pathToTiles
        if(UI.zoom < 0){
            path += "_dezoom_" + (-UI.zoom);
        }
        img.addEventListener('load', function() {
            Canvas.ctxBack.drawImage(img, canvasX, canvasY, tileSize, tileSize);
        });
        img.src = path + '/' + x + '_' + y + '.png';
    }

    static GenerateBorderPoints(maxDistBetweenPoints = 20){
        let quadDistConstraint = maxDistBetweenPoints*maxDistBetweenPoints;
        let precision = 1;
        //set first lateral at intBorder t=0;
        let tIntList = [0];
        this.intPoints = [this.intBorder.GetPointAtParam(0)];
        let tExtList = [this.intBorder.GetOtherBorderT(this.extBorder, 0)];
        this.extPoints = [this.extBorder.GetPointAtParam(tExtList[0])];

        while(true){//loop over number of points
            let lastIndex = tIntList.length - 1;
            let intTMin = tIntList[lastIndex];
            let intTMax = this.intBorder.GetParamAtDist(maxDistBetweenPoints, tIntList[lastIndex]);
            let intT;
            let extT;
            let intPoint;
            let extPoint;
            
            while(true){//dichotmy to create point with valid constraints
                intT = 0.5*(intTMin + intTMax);
                intPoint = this.intBorder.GetPointAtParam(intT);
                extT = this.intBorder.GetOtherBorderT(this.extBorder, intT);
                extPoint = this.extBorder.GetPointAtParam(extT);
                let quadDistInt = intPoint.quadDistTo(this.intPoints[lastIndex]);
                let quadDistExt = extPoint.quadDistTo(this.extPoints[lastIndex]);
                if(quadDistExt < quadDistConstraint && Math.abs(quadDistInt - quadDistConstraint) < precision){
                    break;//constrained reached on intBorder with outBorder not too big
                }else if(Math.abs(quadDistExt - quadDistConstraint) < precision){
                    break;//constrained reached on extBorder so valid on intBorder too
                }else if(quadDistExt > quadDistConstraint + precision){
                    intTMax = intT;
                }else if(quadDistExt < quadDistConstraint - precision){
                    intTMin = intT;
                }else{
                    console.error("could not handle case");
                    console.error([quadDistInt,quadDistExt]);
                    debugger;
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

    static GenerateZoneLateralIntervals(tList){
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

    static GenerateZoneWeights(){
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
        for(let i = this.zones[this.zones.length-1].endLateral + 1; i < this.intPoints.length; i++){
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

    static GetLateralColor(i){
        let zoneWeight = this.lateralZoneWeights[i];

        if(zoneWeight < 0){
            return hexMix(this.zones[this.zones.length-1].color, this.zones[0].color, 1+zoneWeight);
        }

        let floorWeight = Math.floor(zoneWeight);
        if(zoneWeight == floorWeight){
            return this.zones[floorWeight].color;
        }
        else{
            return hexMix(this.zones[floorWeight].color, this.zones[floorWeight+1].color, zoneWeight-floorWeight);
        }
    }

    static GenerateShortestTraj(){
        let midTraj = new Traj();
        let shortestPath = new Traj();
        midTraj.BuildPoints();
        //calculate if track is turning left or right
        for(let i = 1; i < midTraj.points.length-1; i++){
            let vectA = new Point(midTraj.points[i-1].x - midTraj.points[i].x, midTraj.points[i-1].y - midTraj.points[i].y);
            let vectB = new Point(midTraj.points[i].y - midTraj.points[i+1].y, midTraj.points[i+1].x - midTraj.points[i].x);
            if(vectA.x*vectB.x + vectA.y*vectB.y > 0){
                //turning right
                shortestPath.laterals[i] = 1;
            }else{
                //turning left
                shortestPath.laterals[i] = 0;
            }
        }
        //copy first and last point
        shortestPath.laterals[0] = shortestPath.laterals[1];
        shortestPath.laterals[midTraj.points.length-1] = shortestPath.laterals[midTraj.points.length-2];
    }
}
