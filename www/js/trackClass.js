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

    Draw(style = 1, color = "black") {
        ui.ctx.strokeStyle = color;
        ui.ctx.fillStyle = color;
        let canvasOffsetX = 500 + ui.GetIntParam('offsetX');
        let canvasOffsetY = 250 + ui.GetIntParam('offsetY');
        let canvasScale = ui.GetIntParam('scale');
    
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