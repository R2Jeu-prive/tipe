class Track{
    constructor(){
        this.points = [];//points in the middle of track all seperated by ds
        this.curve = [];//curve of center line;
        this.leftPoints = [];
        this.rightPoints = [];
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

    BuildFromRightPoints(points){
        this.leftPoints = [];
        this.rightPoints = [];
        let nbOfPoints = points.length/2;
        for(let i = 0; i < nbOfPoints-1; i++){
            let dir = Math.atan2(points[i*2 + 3] - points[i*2 + 1], points[i*2 + 2] - points[i*2]);
            this.rightPoints.push(new Point(points[i*2],points[i*2+1], dir));
            this.leftPoints.push(new Point(points[i*2] + 2*trackSemiWidth*Math.cos(dir+pi/2),points[i*2+1] + 2*trackSemiWidth*Math.sin(dir+pi/2)));
            this.points.push(new Point(points[i*2] + trackSemiWidth*Math.cos(dir+pi/2),points[i*2+1] + trackSemiWidth*Math.sin(dir+pi/2)));
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

    Draw(style = 3, color = "black", img = false) {
        ui.ctx.strokeStyle = color;
        ui.ctx.fillStyle = color;
        let canvasOffsetX = ui.GetIntParam('offsetX');
        let canvasOffsetY = ui.GetIntParam('offsetY');
        let canvasScale = 0.01*ui.GetIntParam('scale');

        if(img){
            ui.ctx.drawImage(img,canvasOffsetX,canvasOffsetY,17403*canvasScale,9057*canvasScale);
        }
    
        if (style == 0) {//FULL CONCRETE TRACK
            for (let i = 0; i < this.points.length; i++) {
                ui.ctx.beginPath();
                ui.ctx.arc(this.points[i].x * canvasScale + canvasOffsetX, this.points[i].y * canvasScale + canvasOffsetY, trackSemiWidth * canvasScale, 0, 2 * pi, false);
                ui.ctx.fill();
            }
            return;
        }
    
        if (style == 1) {//PERP TRACK LINES
            ui.ctx.beginPath();
            for (let i = 0; i < this.points.length; i++) {
                let x1 = this.leftPoints[i].x * canvasScale + canvasOffsetX;
                let y1 = this.leftPoints[i].y * canvasScale + canvasOffsetY;
                let x2 = this.rightPoints[i].x * canvasScale + canvasOffsetX;
                let y2 = this.rightPoints[i].y * canvasScale + canvasOffsetY;
                ui.ctx.moveTo(x1, y1);
                ui.ctx.lineTo(x2, y2);
            }
            ui.ctx.stroke();
            return;
        }
    
        if (style == 2) {//SIMPLE LINE
            ui.ctx.beginPath();
            for (let i = 1; i < this.points.length; i++) {
                let x1 = this.points[i - 1].x * canvasScale + canvasOffsetX;
                let y1 = this.points[i - 1].y * canvasScale + canvasOffsetY;
                let x2 = this.points[i].x * canvasScale + canvasOffsetX;
                let y2 = this.points[i].y * canvasScale + canvasOffsetY;
                ui.ctx.moveTo(x1, y1);
                ui.ctx.lineTo(x2, y2);
            }
            ui.ctx.stroke();
            return;
        }
    
        if (style == 3) {//TRACK LIMIT LINES
            ui.ctx.beginPath();
            for (let i = 1; i < this.points.length; i++) {
                let x1 = this.leftPoints[i - 1].x * canvasScale + canvasOffsetX;
                let y1 = this.leftPoints[i - 1].y * canvasScale + canvasOffsetY;
                let x2 = this.leftPoints[i].x * canvasScale + canvasOffsetX;
                let y2 = this.leftPoints[i].y * canvasScale + canvasOffsetY;
                let x3 = this.rightPoints[i - 1].x * canvasScale + canvasOffsetX;
                let y3 = this.rightPoints[i - 1].y * canvasScale + canvasOffsetY;
                let x4 = this.rightPoints[i].x * canvasScale + canvasOffsetX;
                let y4 = this.rightPoints[i].y * canvasScale + canvasOffsetY;
                ui.ctx.moveTo(x1, y1);
                ui.ctx.lineTo(x2, y2);
                ui.ctx.moveTo(x3, y3);
                ui.ctx.lineTo(x4, y4);
            }
            ui.ctx.stroke();
            return;
        }
    }
}