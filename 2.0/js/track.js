class Track{
    static topleftGoogleEarthTile;
    static numOfTiles;
    static pathToTiles;
    static intBezier;
    static extBezier;
    static extPoints;
    static intPoints;

    static Init(trackClass){
        for(let prop in trackClass){
            Track[prop] = trackClass[prop];
        }
        //console.log(this.intBezier);
        //this.intBezier.ExtrudePortion(240, 274);
        this.intBezier.ExtrudePortion(100, 133);
        //console.log(this.intBezier);
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

    static GenerateBorderPoints(distBetweenPoint){
        let precision = 0.001;
        let distBetweenPointSquared = [(1-precision)*distBetweenPoint*distBetweenPoint, (1+precision)*distBetweenPoint*distBetweenPoint];
        let numOfCubics = Math.floor(this.intBezier.controlPoints.length/3);
        let minT = 0;
        let maxT = numOfCubics;
        let t;
        let endPoint = this.intBezier.GetPointAtParam(numOfCubics);
        this.intPoints = [this.intBezier.GetPointAtParam(0)];

        //getPoints at Regular Distance on interior border
        while(true){
            let prevPoint = this.intPoints[this.intPoints.length - 1];
            if(minT > 0.5*numOfCubics){
                let distToEndSquared = Math.pow(endPoint.x - prevPoint.x, 2) + Math.pow(endPoint.y - prevPoint.y, 2);
                if(distToEndSquared <= distBetweenPointSquared[0]){break;}
            }
            while(true){
                t = 0.5*(minT + maxT);
                let point = this.intBezier.GetPointAtParam(t);
                let distSquared = Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2);
                if(distSquared < distBetweenPointSquared[0]){
                    minT = t;
                }else if(distSquared > distBetweenPointSquared[1]){
                    maxT = t;
                }else{
                    this.intPoints.push(point)
                    minT = t;
                    maxT = numOfCubics;
                    break;
                }
            }
        }
        console.log(JSON.parse(JSON.stringify(this.intPoints)));

        //build extPoints
        this.extPoints = [];
        for(let i = 0; i < this.intPoints.length-1; i++){
            let x = this.intPoints[i].x;
            let y = this.intPoints[i].y;
            let dir = Math.atan2(-(this.intPoints[i+1].y - y), this.intPoints[i+1].x - x);
            let u = Math.sin(dir + (pi/2));
            let v = Math.cos(dir + (pi/2));
            let w = u*x + v*y;
            this.extPoints.push(GetClosestPoint(this.intPoints[i],this.extBezier.GetIntersectWithLine(u,v,w)));
        }
        this.intPoints.pop();//kill last int point to have same amount int and ext
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
