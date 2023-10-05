class Track{
    static topleftGoogleEarthTile;
    static numOfTiles;
    static pathToTiles;
    static intBorder = new SmoothBorderLoop();
    static extBorder = new SmoothBorderLoop();
    static extPoints = [new Point()];
    static intPoints = [new Point()];

    static Init(trackClass){
        for(let prop in trackClass){
            Track[prop] = trackClass[prop];
        }
        this.GenerateBorderPoints(50);
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
