class Canvas{
    static canvasBack;
    static ctxBack;
    static canvasFore;
    static ctxFore;
    static drawnTrajs;

    static Init(){
        Canvas.canvasBack = document.getElementById('canvasBack');
        Canvas.ctxBack = Canvas.canvasBack.getContext('2d');
        Canvas.canvasMid = document.getElementById('canvasMid');
        Canvas.ctxMid = Canvas.canvasMid.getContext('2d');
        Canvas.canvasFore = document.getElementById('canvasFore');
        Canvas.ctxFore = Canvas.canvasFore.getContext('2d');
        Canvas.drawnTrajs = [];
    }

    static DrawBack(){
        let tileSize = 256*Math.pow(2,UI.zoom)
        let baseU = Math.floor(UI.panX/tileSize);
        let baseV = Math.floor(UI.panY/tileSize);
        for(let u = baseU; u < baseU+(8*Math.pow(2,-UI.zoom))+1; u++){
            for(let v = baseV; v < baseV+(4*Math.pow(2,-UI.zoom))+1; v++){
                Track.DrawTile(u,v, -(UI.panX % tileSize) + (u-baseU)*tileSize, -(UI.panY % tileSize) + (v-baseV)*tileSize);
            }
        }
        Canvas.DrawMid();
    }

    static DrawMid(){
        Canvas.ctxMid.clearRect(0, 0, Canvas.canvasMid.width, Canvas.canvasMid.height);
        Canvas.DrawBorder();
        Canvas.DrawFore();
    }

    static DrawFore(){
        Canvas.ctxFore.clearRect(0, 0, Canvas.canvasMid.width, Canvas.canvasMid.height);
        Canvas.DrawTrajs();
    }
    
    static DrawBorder(style = 1){
        Canvas.ctxMid.strokeStyle = "#555555";
        let zoomFactor = Math.pow(2,UI.zoom);
    
        if (style == 1) {//PERP TRACK LINES
            for (let i = 0; i < Track.intPoints.length; i++) {
                let x1 = Track.extPoints[i].x*zoomFactor - UI.panX;
                let y1 = Track.extPoints[i].y*zoomFactor - UI.panY;
                let x2 = Track.intPoints[i].x*zoomFactor - UI.panX;
                let y2 = Track.intPoints[i].y*zoomFactor - UI.panY;
                Canvas.ctxMid.beginPath();
                Canvas.ctxMid.moveTo(x1, y1);
                Canvas.ctxMid.lineTo(x2, y2);
                Canvas.ctxMid.stroke();
            }
            return;
        }
    
        if (style == 2) {//TRACK LIMIT LINES
            for (let i = 1; i < Track.intPoints.length; i++) {
                let x1 = Track.intPoints[i-1].x*zoomFactor - UI.panX;
                let x2 = Track.intPoints[i].x*zoomFactor - UI.panX;
                let y1 = Track.intPoints[i-1].y*zoomFactor - UI.panY;
                let y2 = Track.intPoints[i].y*zoomFactor - UI.panY;
                let x3 = Track.extPoints[i-1].x*zoomFactor - UI.panX;
                let x4 = Track.extPoints[i].x*zoomFactor - UI.panX;
                let y3 = Track.extPoints[i-1].y*zoomFactor - UI.panY;
                let y4 = Track.extPoints[i].y*zoomFactor - UI.panY;
                Canvas.ctxMid.beginPath();
                Canvas.ctxMid.moveTo(x1, y1);
                Canvas.ctxMid.lineTo(x2, y2);
                Canvas.ctxMid.moveTo(x3, y3);
                Canvas.ctxMid.lineTo(x4, y4);
                Canvas.ctxMid.stroke();
            }
            return;
        }
    }

    static DrawTrajs(){
        let mode = "curvature"//ui.GetSelectParam("trajColorIndicator")
        let visualScaler = 30000//ui.GetFloatParam("visualScaler")
        let zoomFactor = Math.pow(2,UI.zoom);
        for(let k = 0; k < Canvas.drawnTrajs.length; k++){
            for (let i = 1; i < Canvas.drawnTrajs[k].points.length; i++) {
                let x1 = Canvas.drawnTrajs[k].points[i - 1].x * zoomFactor - UI.panX;
                let y1 = Canvas.drawnTrajs[k].points[i - 1].y * zoomFactor - UI.panY;
                let x2 = Canvas.drawnTrajs[k].points[i].x * zoomFactor - UI.panX;
                let y2 = Canvas.drawnTrajs[k].points[i].y * zoomFactor - UI.panY;
                if(i == 1){console.log(x1,y1)};
                if(i == 1){console.log(Track.intPoints[0],Track.extPoints[0])};
                if(mode == "curvature"){
                    let rgb = hslToRgb(120-visualScaler*Canvas.drawnTrajs[k].absCurves[i],100,50)
                    let r = toHex(Math.floor(rgb[0]));
                    let g = toHex(Math.floor(rgb[1]));
                    let b = toHex(Math.floor(rgb[2]));
                    Canvas.ctxFore.strokeStyle = "#" + r + g + b;
                }else if(mode == "speed"){
                    let rgb = hslToRgb(visualScaler*Canvas.drawnTrajs[k].speeds[i],100,50)
                    let r = toHex(Math.floor(rgb[0]));
                    let g = toHex(Math.floor(rgb[1]));
                    let b = toHex(Math.floor(rgb[2]));
                    Canvas.ctxFore.strokeStyle = "#" + r + g + b;
                }else if(mode == "acceleration"){
                    let acceleration = visualScaler*(Canvas.drawnTrajs[k].speeds[i] - Canvas.drawnTrajs[k].speeds[i-1])*(Canvas.drawnTrajs[k].speeds[i] + Canvas.drawnTrajs[k].speeds[i-1])/Canvas.drawnTrajs[k].dists[i-1]
                    let r = toHex(Math.ceil(Math.min(0,acceleration)));
                    let g = toHex(Math.ceil(Math.max(0,acceleration)));
                    let b = toHex(0);
                    Canvas.ctxFore.strokeStyle = "#" + r + g + b;
                }
                Canvas.ctxFore.lineWidth = 1;
                Canvas.ctxFore.beginPath();
                Canvas.ctxFore.moveTo(x1, y1);
                Canvas.ctxFore.lineTo(x2, y2);
                Canvas.ctxFore.stroke();
            }
        }
    }
}
