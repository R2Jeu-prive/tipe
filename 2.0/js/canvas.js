class Canvas{
    static canvasBack;
    static ctxBack;
    static canvasFore;
    static ctxFore;

    static Init(){
        Canvas.canvasBack = document.getElementById('canvasBack');
        Canvas.ctxBack = Canvas.canvasBack.getContext('2d');
        Canvas.canvasMid = document.getElementById('canvasMid');
        Canvas.ctxMid = Canvas.canvasMid.getContext('2d');
        Canvas.canvasFore = document.getElementById('canvasFore');
        Canvas.ctxFore = Canvas.canvasFore.getContext('2d');
    }

    static DrawBack(){
        let tileSize = 256*Math.pow(2,UI.zoom)
        let baseU = Math.floor(UI.panX/tileSize);
        let baseV = Math.floor(UI.panY/tileSize);
        for(let u = baseU; u < baseU+8; u++){
            for(let v = baseV; v < baseV+4; v++){
                Track.DrawTile(u,v, -(UI.panX % tileSize) + (u-baseU)*tileSize, -(UI.panY % tileSize) + (v-baseV)*tileSize);
            }
        }
        Canvas.DrawMid();
    }

    static DrawMid(){
        Canvas.ctxMid.clearRect(0, 0, Canvas.canvasMid.width, Canvas.canvasMid.height);
        Canvas.DrawBorder();
    }
    
    static DrawBorder(style = 1){
        Canvas.ctxMid.strokeStyle = "#ff0000";
        let zoomFactor = Math.pow(2,UI.zoom);
    
        if (style == 1) {//PERP TRACK LINES
            for (let i = 0; i < Track.intPoints.length; i++) {
                let x1 = Track.extPoints[i][0]*zoomFactor - UI.panX;
                let y1 = Track.extPoints[i][1]*zoomFactor - UI.panY;
                let x2 = Track.intPoints[i][0]*zoomFactor - UI.panX;
                let y2 = Track.intPoints[i][1]*zoomFactor - UI.panY;
                Canvas.ctxMid.beginPath();
                Canvas.ctxMid.moveTo(x1, y1);
                Canvas.ctxMid.lineTo(x2, y2);
                Canvas.ctxMid.stroke();
            }
            return;
        }
    
        if (style == 2) {//TRACK LIMIT LINES
            for (let i = 1; i < Track.intPoints.length; i++) {
                let x1 = Track.intPoints[i-1][0]*zoomFactor - UI.panX;
                let x2 = Track.intPoints[i][0]*zoomFactor - UI.panX;
                let y1 = Track.intPoints[i-1][1]*zoomFactor - UI.panY;
                let y2 = Track.intPoints[i][1]*zoomFactor - UI.panY;
                let x3 = Track.extPoints[i-1][0]*zoomFactor - UI.panX;
                let x4 = Track.extPoints[i][0]*zoomFactor - UI.panX;
                let y3 = Track.extPoints[i-1][1]*zoomFactor - UI.panY;
                let y4 = Track.extPoints[i][1]*zoomFactor - UI.panY;
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
}
