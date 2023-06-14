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
        this.GenerateBorderPoints(20);
    }

    static DrawTile(u,v,canvasX,canvasY){
        let img = new Image();
        let tileSize = 256*Math.pow(2,UI.zoom);
        let x = u + this.topleftGoogleEarthTile[0];
        let y = v + this.topleftGoogleEarthTile[1];
        img.addEventListener('load', function() {
            Canvas.ctxBack.drawImage(img, canvasX, canvasY, tileSize, tileSize);
        });
        img.src = this.pathToTiles + x + '_' + y + '.png';
    }

    static GenerateBorderPoints(distBetweenPoint){
        let precision = 0.001;
        let distBetweenPointSquared = [(1-precision)*distBetweenPoint*distBetweenPoint, (1+precision)*distBetweenPoint*distBetweenPoint];
        let numOfCubics = this.intBezier.controlPoints.length/3;
        let minT = 0;
        let maxT = numOfCubics;
        let t;
        let endPoint = this.intBezier.GetPointAtParam(numOfCubics);
        this.intPoints = [this.intBezier.GetPointAtParam(0)];

        //getPoints at Regular Distance on interior border
        while(true){
            let prevPoint = this.intPoints[this.intPoints.length - 1];
            if(minT > 0.5*numOfCubics){
                let distToEndSquared = Math.pow(endPoint[0] - prevPoint[0], 2) + Math.pow(endPoint[1] - prevPoint[1], 2);
                if(distToEndSquared <= distBetweenPointSquared[0]){break;}
            }
            while(true){
                t = 0.5*(minT + maxT);
                let point = this.intBezier.GetPointAtParam(t);
                let distSquared = Math.pow(point[0] - prevPoint[0], 2) + Math.pow(point[1] - prevPoint[1], 2);
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

        //build extPoints
        this.extPoints = [];
        for(let i = 0; i < this.intPoints.length-1; i++){
            let x = this.intPoints[i][0];
            let y = this.intPoints[i][1];
            let dir = Math.atan2(-(this.intPoints[i+1][1] - y), this.intPoints[i+1][0] - x);
            let u = Math.sin(dir + (pi/2));
            let v = Math.cos(dir + (pi/2));
            let w = u*x + v*y;
            this.extPoints.push(GetClosestPoint(x,y,this.extBezier.GetIntersectWithLine(u,v,w)));
        }
        this.intPoints.pop();//kill last int point to have same amount int and ext
    }
}