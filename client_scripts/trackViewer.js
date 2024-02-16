import { ServerManager } from "./serverManager.js";
import { mod } from "../common_classes/utils.js";
import { hexMix, toHex, hslToRgb } from "../common_classes/utils.js";

export class TrackViewer{
    static pannel;

    static canvasBack;
    static ctxBack;
    static canvasMid;
    static ctxMid;
    static canvasFore;
    static ctxFore;

    static needsRezise = false;
    static needsDrawBack = false;
    static needsDrawMid = false;
    static needsDrawFront = false;

    //3115 105
    static panX = 0;// number of screen pixels to left edge of track map 
    static panY = 0;// number of screen pixels to top edge of track map
    static panStartX = 0;
    static panStartY = 0;
    static panning = false;
    static zoom = -5;// goes negetive to dezoom down to -5, can go positive to over zoom (no gain in actual resolution of images)

    static trajColorIndicator = "curvature";

    /**
     * initializes every canvas
     */
    static Init(){
        TrackViewer.pannel = document.getElementById('left-pannel');
        TrackViewer.canvasBack = document.getElementById('canvasBack');
        TrackViewer.canvasMid = document.getElementById('canvasMid');
        TrackViewer.canvasFore = document.getElementById('canvasFore');
        TrackViewer.ctxBack = TrackViewer.canvasBack.getContext('2d');
        TrackViewer.ctxMid = TrackViewer.canvasMid.getContext('2d');
        TrackViewer.ctxFore = TrackViewer.canvasFore.getContext('2d');
        TrackViewer.needsRezise = true;
        TrackViewer.Update();
    }

    static async Update(){
        if(TrackViewer.needsRezise){this.Resize();}
        if(TrackViewer.needsDrawBack){ await this.DrawBack();}
        if(TrackViewer.needsDrawMid){this.DrawMid();}
        if(TrackViewer.needsDrawFront){this.DrawFore();}

        setTimeout(() => {TrackViewer.Update();}, 0);
    }

    static MouseDown(e){
        if(e.button == 0){
            TrackViewer.PanStart(e);
        }else if(e.button == 1){
        }
    }
    
    static MouseMove(e){
        if(TrackViewer.panning){
            TrackViewer.Pan(e);
        }
    }

    static MouseUp(e){
        TrackViewer.panning = false;
        if(e.button == 2/* && e.shiftKey*/){//[TODO] check use ?
            e.preventDefault();
        }
    }
    
    static PanStart(e){
        TrackViewer.panStartX = e.pageX;
        TrackViewer.panStartY = e.pageY;
        TrackViewer.panning = true;
    }
    
    static Pan(e){
        if(e.shiftKey){
            TrackViewer.panX += 5*(TrackViewer.panStartX - e.pageX);
            TrackViewer.panY += 5*(TrackViewer.panStartY - e.pageY);
        }else{
            TrackViewer.panX += (TrackViewer.panStartX - e.pageX);
            TrackViewer.panY += (TrackViewer.panStartY - e.pageY);
        }
        TrackViewer.panStartX = e.pageX;
        TrackViewer.panStartY = e.pageY;
        TrackViewer.needsDrawBack = true;
    }

    static async DrawTile(tileDrawSize, u, v, canvasX, canvasY){
        if(u < 0 || v < 0 || u >= ServerManager.track.numOfTiles[0] || v >= ServerManager.track.numOfTiles[1]){
            TrackViewer.ctxBack.fillStyle = "black";
            TrackViewer.ctxBack.fillRect(canvasX, canvasY, tileDrawSize, tileDrawSize);
            return;
        }

        let img = new Image();
        let googleEarthU = u + ServerManager.track.topleftGoogleEarthTile[0];
        let googleEarthV = v + ServerManager.track.topleftGoogleEarthTile[1];
        let path = ServerManager.track.pathToTiles
        if(TrackViewer.zoom < 0){
            path += "_dezoom_" + (-TrackViewer.zoom);
        }
        img.addEventListener('load', function() {
            
        });
        img.src = path + '/' + googleEarthU + '_' + googleEarthV + '.png';
        await img.decode();
        TrackViewer.ctxBack.drawImage(img, canvasX, canvasY, tileDrawSize, tileDrawSize);
    }

    /**
     * must be called everytime pannel is resized to rezise every canvas accordingly
     */
    static Resize(){
        TrackViewer.needsDrawBack = true;
        TrackViewer.needsRezise = false;
        let h = TrackViewer.pannel.offsetHeight;
        let w = TrackViewer.pannel.offsetWidth;
        TrackViewer.canvasBack.height = h;
        TrackViewer.canvasBack.width = w;
        TrackViewer.canvasMid.height = h;
        TrackViewer.canvasMid.width = w;
        TrackViewer.canvasFore.height = h;
        TrackViewer.canvasFore.width = w;
    }

    static async DrawBack(){
        TrackViewer.needsDrawMid = true;
        TrackViewer.needsDrawBack = false;

        let canvasW = TrackViewer.canvasBack.width
        let canvasH = TrackViewer.canvasBack.height
        let uvTileSize = TrackViewer.zoom <= 0 ? (256 >> -TrackViewer.zoom) : (256 << TrackViewer.zoom);
        let tileDrawSize = TrackViewer.zoom <= 0 ? 256 : (256 << TrackViewer.zoom);
        let uvInterval = TrackViewer.zoom <= 0 ? (1 << -TrackViewer.zoom) : 1
        let topLeftU = Math.floor(TrackViewer.panX / uvTileSize);
        let topLeftV = Math.floor(TrackViewer.panY / uvTileSize);
        let bottomRightU = Math.floor((TrackViewer.panX + canvasW) / uvTileSize);
        let bottomRightV = Math.floor((TrackViewer.panY + canvasH) / uvTileSize);
        topLeftU = topLeftU - mod(topLeftU, uvInterval);
        topLeftV = topLeftV - mod(topLeftV, uvInterval);
        bottomRightU = bottomRightU + uvInterval - mod(bottomRightU, uvInterval);
        bottomRightV = bottomRightV + uvInterval - mod(bottomRightV, uvInterval);
        let topLeftCanvasX = topLeftU*uvTileSize - TrackViewer.panX;
        let topLeftCanvasY = topLeftV*uvTileSize - TrackViewer.panY;
        let promises = [];
        for(let u = topLeftU; u <= bottomRightU; u += uvInterval){
            for(let v = topLeftV; v <= bottomRightV; v += uvInterval){
                promises.push(TrackViewer.DrawTile(tileDrawSize, u, v, topLeftCanvasX + (u-topLeftU)*uvTileSize, topLeftCanvasY + (v-topLeftV)*uvTileSize));
            }
        }
        for(let i = 0; i < promises.length; i++){
            await promises[i];
        }
    }
    
    static DrawMid(){
        TrackViewer.needsDrawFront = true;
        TrackViewer.needsDrawMid = false;
        TrackViewer.ctxMid.clearRect(0, 0, TrackViewer.canvasMid.width, TrackViewer.canvasMid.height);
        TrackViewer.DrawBorder();
    }

    static GetTrackBorderColor(i){
        let zoneWeight = ServerManager.track.lateralZoneWeights[i];

        if(zoneWeight < 0){
            return hexMix(ServerManager.track.zones[ServerManager.track.zones.length-1].color, ServerManager.track.zones[0].color, 1+zoneWeight);
        }

        let floorWeight = Math.floor(zoneWeight);
        if(zoneWeight == floorWeight){
            return ServerManager.track.zones[zoneWeight].color;
        }
        else{
            return hexMix(ServerManager.track.zones[floorWeight].color, ServerManager.track.zones[floorWeight+1].color, zoneWeight-floorWeight);
        }
    }
    
    static DrawBorder(style = 1){
        //TrackViewer.ctxMid.strokeStyle = "#555555"; //default color
        let zoomFactor = Math.pow(2,TrackViewer.zoom);
    
        if (style == 1) {//PERP TRACK LINES
            for (let i = 0; i < ServerManager.track.n; i++) {
                TrackViewer.ctxMid.strokeStyle = "#" + TrackViewer.GetTrackBorderColor(i);
                if(i == 0){TrackViewer.ctxMid.strokeStyle = "#ff00ff";}
                let x1 = ServerManager.track.extPoints[i].x*zoomFactor - TrackViewer.panX;
                let y1 = ServerManager.track.extPoints[i].y*zoomFactor - TrackViewer.panY;
                let x2 = ServerManager.track.intPoints[i].x*zoomFactor - TrackViewer.panX;
                let y2 = ServerManager.track.intPoints[i].y*zoomFactor - TrackViewer.panY;
                TrackViewer.ctxMid.beginPath();
                TrackViewer.ctxMid.moveTo(x1, y1);
                TrackViewer.ctxMid.lineTo(x2, y2);
                TrackViewer.ctxMid.stroke();
                //TrackViewer.ctxMid.font = "12px serif";
                //TrackViewer.ctxMid.fillStyle = "#00ffff";
                //TrackViewer.ctxMid.fillText(i, x2+7, y2-7);
            }
            return;
        }
    
        if (style == 2) {//TRACK LIMIT LINES
            for (let i = 1; i < ServerManager.track.n; i++) {
                TrackViewer.ctxMid.strokeStyle = "#" + TrackViewer.GetTrackBorderColor(i);
                let x1 = ServerManager.track.intPoints[i-1].x*zoomFactor - TrackViewer.panX;
                let x2 = ServerManager.track.intPoints[i].x*zoomFactor - TrackViewer.panX;
                let y1 = ServerManager.track.intPoints[i-1].y*zoomFactor - TrackViewer.panY;
                let y2 = ServerManager.track.intPoints[i].y*zoomFactor - TrackViewer.panY;
                let x3 = ServerManager.track.extPoints[i-1].x*zoomFactor - TrackViewer.panX;
                let x4 = ServerManager.track.extPoints[i].x*zoomFactor - TrackViewer.panX;
                let y3 = ServerManager.track.extPoints[i-1].y*zoomFactor - TrackViewer.panY;
                let y4 = ServerManager.track.extPoints[i].y*zoomFactor - TrackViewer.panY;
                TrackViewer.ctxMid.beginPath();
                TrackViewer.ctxMid.moveTo(x1, y1);
                TrackViewer.ctxMid.lineTo(x2, y2);
                TrackViewer.ctxMid.moveTo(x3, y3);
                TrackViewer.ctxMid.lineTo(x4, y4);
                TrackViewer.ctxMid.stroke();
            }
            return;
        }
    }

    static DrawFore(){
        TrackViewer.needsDrawFront = false;
        TrackViewer.ctxFore.clearRect(0, 0, TrackViewer.canvasMid.width, TrackViewer.canvasMid.height);
        TrackViewer.DrawTrajs();
    }

    static DrawTrajs(){
        let mode = "curvature";
        let visualScaler;
        let zoomFactor = Math.pow(2,TrackViewer.zoom);
        for(let k = 0; k < ServerManager.trajs.length; k++){
            for (let i = 1; i < ServerManager.trajs[k].n; i++) {
                let x1 = ServerManager.trajs[k].points[i - 1].x * zoomFactor - TrackViewer.panX;
                let y1 = ServerManager.trajs[k].points[i - 1].y * zoomFactor - TrackViewer.panY;
                let x2 = ServerManager.trajs[k].points[i].x * zoomFactor - TrackViewer.panX;
                let y2 = ServerManager.trajs[k].points[i].y * zoomFactor - TrackViewer.panY;
                if(mode == "curvature"){
                    visualScaler = 3000;
                    let rgb = hslToRgb(120-visualScaler*ServerManager.trajs[k].absCurv[i],100,50)
                    let r = toHex(Math.floor(rgb[0]));
                    let g = toHex(Math.floor(rgb[1]));
                    let b = toHex(Math.floor(rgb[2]));
                    TrackViewer.ctxFore.strokeStyle = "#" + r + g + b;
                }
                TrackViewer.ctxFore.lineWidth = 1;
                TrackViewer.ctxFore.beginPath();
                TrackViewer.ctxFore.moveTo(x1, y1);
                TrackViewer.ctxFore.lineTo(x2, y2);
                TrackViewer.ctxFore.stroke();
            }
            break;
        }
    }

    static DrawPoint(mapX, mapY, id){
        let zoomFactor = Math.pow(2, TrackViewer.zoom);
        let x = mapX*zoomFactor - TrackViewer.panX;
        let y = mapY*zoomFactor - TrackViewer.panY;
        TrackViewer.ctxFore.strokeStyle = "#00ffff";
        TrackViewer.ctxFore.lineWidth = 1;
        TrackViewer.ctxFore.beginPath();
        TrackViewer.ctxFore.moveTo(x-5, y-5);
        TrackViewer.ctxFore.lineTo(x+5, y+5);
        TrackViewer.ctxFore.moveTo(x-5, y+5);
        TrackViewer.ctxFore.lineTo(x+5, y-5);
        TrackViewer.ctxFore.stroke();

        TrackViewer.ctxFore.font = "12px serif";
        TrackViewer.ctxFore.fillStyle = "#00ffff";
        TrackViewer.ctxFore.fillText(id+1, x+7, y-7);
    }
}
