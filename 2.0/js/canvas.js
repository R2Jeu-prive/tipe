class Canvas{
    static canvasBack;
    static ctxBack;
    static canvasFore;
    static ctxFore;

    static Init(){
        Canvas.canvasBack = document.getElementById('canvasBack');
        Canvas.ctxBack = canvasBack.getContext('2d');
        Canvas.canvasFore = document.getElementById('canvasFore');
        Canvas.ctxFore = canvasFore.getContext('2d');
    }

    static DrawBack(){
        let tileSize = 256*Math.pow(2,UI.zoom)
        let baseU = Math.floor(UI.panX/tileSize);
        let baseV = Math.floor(UI.panY/tileSize);
        for(let u = baseU; u < baseU+8; u++){
            for(let v = baseV; v < baseV+4; v++){
                Villeneuve.DrawTile(u,v, -(UI.panX % tileSize) + (u-baseU)*tileSize, -(UI.panY % tileSize) + (v-baseV)*tileSize);
            }
        }
    }
}
