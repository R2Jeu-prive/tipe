class Track{
    constructor(){
        this.points = [];//points in the middle of track all seperated by ds
        this.curve = [];//curve of center line;
        this.leftPoints = [];
        this.rightPoints = [];
        this.trackSemiWidth = null;
    }

    BuildFromCurveFunction(curveFunction, rotation = 0){
        this.curve = MakeDiscrete(curveFunction);
        this.points = [new Point(0, 0, rotation)]; //array of Points
        for (let i = 0; i < this.curve.length; i++) {
            this.points.push(new Point(this.points[i].x, this.points[i].y, this.points[i].dir));//dupe point
            if (this.curve[i] == 0) {
                this.points[i + 1].x += ds * Math.cos(this.points[i].dir);
                this.points[i + 1].y -= ds * Math.sin(this.points[i].dir);//y going down the screen so -=
            }
            else if (this.curve[i] > 0) {
                let dAngle = -ds * this.curve[i];
                //go to circle center, turn, and go back on perimeter (NOTOPTI)
                this.points[i + 1].dir = (this.points[i].dir - (pi / 2)) % (2 * pi);
                this.points[i + 1].x += Math.cos(this.points[i + 1].dir) / this.curve[i];
                this.points[i + 1].y -= Math.sin(this.points[i + 1].dir) / this.curve[i];
                this.points[i + 1].dir = (this.points[i + 1].dir + pi + dAngle) % (2 * pi);
                this.points[i + 1].x += Math.cos(this.points[i + 1].dir) / this.curve[i];
                this.points[i + 1].y -= Math.sin(this.points[i + 1].dir) / this.curve[i];
                this.points[i + 1].dir = (this.points[i + 1].dir - (pi / 2)) % (2 * pi);
            }
            else if (this.curve[i] < 0) {
                let dAngle = -ds * this.curve[i];
                //go to circle center, turn, and go back on perimeter (NOTOPTI)
                this.points[i + 1].dir = (this.points[i].dir + (pi / 2)) % (2 * pi);
                this.points[i + 1].x += Math.cos(this.points[i + 1].dir) / (-this.curve[i]);
                this.points[i + 1].y -= Math.sin(this.points[i + 1].dir) / (-this.curve[i]);
                this.points[i + 1].dir = (this.points[i + 1].dir + pi + dAngle) % (2 * pi);
                this.points[i + 1].x += Math.cos(this.points[i + 1].dir) / (-this.curve[i]);
                this.points[i + 1].y -= Math.sin(this.points[i + 1].dir) / (-this.curve[i]);
                this.points[i + 1].dir = (this.points[i + 1].dir + (pi / 2)) % (2 * pi);
            }
        }

        this.MoveToCenter();
        this.BuildSidePoints();
    }

    BuildFromRealData(data, restrictStart, restrictEnd){
        this.trackRawData = data;
        this.points = [];
        this.leftPoints = [];
        this.rightPoints = [];

        //APPLY MODIFICATIONS TO POINTS TO FIT IMAGE & FIT CLOCKWISE & HAVE CORRECT TRACKWIDTH
        let dataExtXY = data.points.map(function(val,i){return i%2 == 0 ? (val + data.deltaX)/data.scaleX : (val + data.deltaY)/data.scaleY})
        dataExtXY = dataExtXY.map(function(val,i){return val*data.semiWidthReal/data.semiWidthData})
        if(data.clockWiseReal != data.clockWiseData){
            for(let i = 0; i < Math.floor(dataExtXY.length/4); i++){
                let tempX = dataExtXY[i*2];
                let tempY = dataExtXY[i*2+1];
                dataExtXY[i*2] = dataExtXY[dataExtXY.length - 2 - i*2]
                dataExtXY[i*2 + 1] = dataExtXY[dataExtXY.length - 1 - i*2]
                dataExtXY[dataExtXY.length - 2 - i*2] = tempX;
                dataExtXY[dataExtXY.length - 1 - i*2] = tempY;
            }
        }
        this.trackSemiWidth = data.semiWidthReal
        dataExtXY = dataExtXY.slice(restrictStart*2, restrictEnd*2);
        let nbOfPoints = dataExtXY.length/2;

        //COMPUTE POINTS (some minus signs to go with inverted Y-axis)
        if(data.clockWiseReal){
            for(let i = 0; i < nbOfPoints-1; i++){
                let dir = Math.atan2(-(dataExtXY[i*2 + 3] - dataExtXY[i*2 + 1]), dataExtXY[i*2 + 2] - dataExtXY[i*2]);
                this.leftPoints.push(new Point(dataExtXY[i*2], dataExtXY[i*2+1], dir));
                this.rightPoints.push(new Point(dataExtXY[i*2] + 2*this.trackSemiWidth*Math.cos(dir-pi/2), dataExtXY[i*2+1] - 2*this.trackSemiWidth*Math.sin(dir-pi/2)));
                this.points.push(new Point(dataExtXY[i*2] + this.trackSemiWidth*Math.cos(dir-pi/2), dataExtXY[i*2+1] - this.trackSemiWidth*Math.sin(dir-pi/2)));
            }
        }else{
            for(let i = 0; i < nbOfPoints-1; i++){
                let dir = Math.atan2(-(dataExtXY[i*2 + 3] - dataExtXY[i*2 + 1]), dataExtXY[i*2 + 2] - dataExtXY[i*2]);
                this.rightPoints.push(new Point(dataExtXY[i*2], dataExtXY[i*2+1], dir));
                this.leftPoints.push(new Point(dataExtXY[i*2] + 2*this.trackSemiWidth*Math.cos(dir+pi/2), dataExtXY[i*2+1] - 2*this.trackSemiWidth*Math.sin(dir+pi/2)));
                this.points.push(new Point(dataExtXY[i*2] + this.trackSemiWidth*Math.cos(dir+pi/2), dataExtXY[i*2+1] - this.trackSemiWidth*Math.sin(dir+pi/2)));
            }
        }
    }

    MoveToCenter(){
        let averageX = 0;
        let averageY = 0;
        for (let i = 0; i < this.points.length; i++) {
            averageX += this.points[i].x;
            averageY += this.points[i].y;
        }
        averageX /= this.points.length;
        averageY /= this.points.length;
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].x -= averageX;
            this.points[i].y -= averageY;
        }
    }

    BuildSidePoints(){
        this.leftPoints = [];
        this.rightPoints = [];
        for (let i = 0; i < this.points.length; i++) {
            this.leftPoints.push(new Point(this.points[i].x + Math.cos(this.points[i].dir + (pi / 2)) * trackSemiWidth, this.points[i].y - Math.sin(this.points[i].dir + (pi / 2)) * trackSemiWidth));
            this.rightPoints.push(new Point(this.points[i].x + Math.cos(this.points[i].dir - (pi / 2)) * trackSemiWidth, this.points[i].y - Math.sin(this.points[i].dir - (pi / 2)) * trackSemiWidth));
        }
    }

    //[TODO]BuildFromCenteredPoints(curveFunction){}

    Draw(style = 3, color = "black") {
        ui.fixedCtx.strokeStyle = color;
        ui.fixedCtx.fillStyle = color;
        let canvasOffsetX = ui.GetFloatParam('offsetX');
        let canvasOffsetY = ui.GetFloatParam('offsetY');
        let canvasScale = 0.01*ui.GetFloatParam('scale');

        if(this.trackRawData.hasImage){
            let scaler = canvasScale*this.trackRawData.semiWidthReal/this.trackRawData.semiWidthData;
            ui.fixedCtx.drawImage(document.getElementById(this.trackRawData.imgName), canvasOffsetX, canvasOffsetY, this.trackRawData.imgWidth*scaler, this.trackRawData.imgHeight*scaler);
        }
    
        if (style == 0) {//FULL CONCRETE TRACK
            for (let i = 0; i < this.points.length; i++) {
                ui.fixedCtx.beginPath();
                ui.fixedCtx.arc(this.points[i].x * canvasScale + canvasOffsetX, this.points[i].y * canvasScale + canvasOffsetY, trackSemiWidth * canvasScale, 0, 2 * pi, false);
                ui.fixedCtx.fill();
            }
            return;
        }
    
        if (style == 1) {//PERP TRACK LINES
            ui.fixedCtx.beginPath();
            for (let i = 0; i < this.points.length; i++) {
                let x1 = this.leftPoints[i].x * canvasScale + canvasOffsetX;
                let y1 = this.leftPoints[i].y * canvasScale + canvasOffsetY;
                let x2 = this.rightPoints[i].x * canvasScale + canvasOffsetX;
                let y2 = this.rightPoints[i].y * canvasScale + canvasOffsetY;
                ui.fixedCtx.moveTo(x1, y1);
                ui.fixedCtx.lineTo(x2, y2);
            }
            ui.fixedCtx.stroke();
            return;
        }
    
        if (style == 2) {//SIMPLE LINE
            ui.fixedCtx.beginPath();
            for (let i = 1; i < this.points.length; i++) {
                let x1 = this.points[i - 1].x * canvasScale + canvasOffsetX;
                let y1 = this.points[i - 1].y * canvasScale + canvasOffsetY;
                let x2 = this.points[i].x * canvasScale + canvasOffsetX;
                let y2 = this.points[i].y * canvasScale + canvasOffsetY;
                ui.fixedCtx.moveTo(x1, y1);
                ui.fixedCtx.lineTo(x2, y2);
            }
            ui.fixedCtx.stroke();
            return;
        }
    
        if (style == 3) {//TRACK LIMIT LINES
            ui.fixedCtx.beginPath();
            for (let i = 1; i < this.points.length; i++) {
                let x1 = this.leftPoints[i - 1].x * canvasScale + canvasOffsetX;
                let y1 = this.leftPoints[i - 1].y * canvasScale + canvasOffsetY;
                let x2 = this.leftPoints[i].x * canvasScale + canvasOffsetX;
                let y2 = this.leftPoints[i].y * canvasScale + canvasOffsetY;
                let x3 = this.rightPoints[i - 1].x * canvasScale + canvasOffsetX;
                let y3 = this.rightPoints[i - 1].y * canvasScale + canvasOffsetY;
                let x4 = this.rightPoints[i].x * canvasScale + canvasOffsetX;
                let y4 = this.rightPoints[i].y * canvasScale + canvasOffsetY;
                ui.fixedCtx.moveTo(x1, y1);
                ui.fixedCtx.lineTo(x2, y2);
                ui.fixedCtx.moveTo(x3, y3);
                ui.fixedCtx.lineTo(x4, y4);
            }
            ui.fixedCtx.stroke();
            return;
        }
    }

    GenerateShortestTraj(){
        let traj = new Traj();
        traj.BuildPoints();
        console.log(traj);
        let turningRights = [-1];
        for(let i = 1; i<traj.points.length-1; i++){
            console.log("loop");
            let a = new Vector(traj.points[i], traj.points[i-1]);
            let b = new Vector(traj.points[i+1], traj.points[i]);
            a.Rotate();
            turningRights.push(Vector.Dot(a,b) < 0);
        }
        turningRights[0] = turningRights[1];
        turningRights[traj.laterals.length-1] = turningRights[traj.laterals.length-2];
        for(let i = 0; i < traj.laterals.length-1; i++){
            if(turningRights[i]){
                traj.laterals[i] = 1;
            }else{
                traj.laterals[i] = 0;
            }
        }
        traj.BuildPoints();
        traj.Draw();
    }
}