class TrackViewer{
    static pannel;
    static canvasBack;
    static ctxBack;
    static canvasMid;
    static ctxMid;
    static canvasFore;
    static ctxFore;
    static trajColorIndicator = "curvature";
    static track = {};
    static trajs = [];
    static initialised = false;

    static Resize(){
        let h = TrackViewer.pannel.height;
        let w = TrackViewer.pannel.width;
        TrackViewer.canvasBack.height = h;
        TrackViewer.canvasBack.width = w;
        TrackViewer.canvasMid.height = h;
        TrackViewer.canvasMid.width = w;
        TrackViewer.canvasFore.height = h;
        TrackViewer.canvasFore.width = w;
    }

    static Init(){
        TrackViewer.pannel = document.getElementById('top-pannel');
        TrackViewer.canvasBack = document.getElementById('canvasBack');
        TrackViewer.canvasMid = document.getElementById('canvasMid');
        TrackViewer.canvasFore = document.getElementById('canvasFore');
        TrackViewer.initialised = true;
        TrackViewer.Resize();
        TrackViewer.ctxBack = TrackViewer.canvasBack.getContext('2d');
        TrackViewer.ctxMid = TrackViewer.canvasMid.getContext('2d');
        TrackViewer.ctxFore = TrackViewer.canvasFore.getContext('2d');
        TrackViewer.DrawBack();
    }

    static RefreshFromServer(){
        Server.RequestState().then(function(state){
            console.log(state);
            TrackViewer.trajs = state.trajs;
            TrackViewer.DrawFore();
        })
    }

    static DrawTile(u,v,canvasX,canvasY){
        let img = new Image();
        let tileSize = Math.max(256*Math.pow(2,UI.zoom), 256);
        let x = u + TrackViewer.track.topleftGoogleEarthTile.x;
        let y = v + TrackViewer.track.topleftGoogleEarthTile.y;
        let path = TrackViewer.track.pathToTiles
        if(UI.zoom < 0){
            path += "_dezoom_" + (-UI.zoom);
        }
        img.addEventListener('load', function() {
            TrackViewer.ctxBack.drawImage(img, canvasX, canvasY, tileSize, tileSize);
        });
        img.src = path + '/' + x + '_' + y + '.png';
    }

    static DrawBack(){
        let canvasW = TrackViewer.canvasBack.width
        let canvasH = TrackViewer.canvasBack.height
        if(UI.zoom >= 0){
            let tileSize = 256*Math.pow(2,UI.zoom)
            let baseU = Math.floor(UI.panX/tileSize);
            let baseV = Math.floor(UI.panY/tileSize);
            for(let u = baseU; u < baseU+(8*Math.pow(2,-UI.zoom))+1; u++){
                for(let v = baseV; v < baseV+(4*Math.pow(2,-UI.zoom))+1; v++){
                    TrackViewer.DrawTile(u,v, -(UI.panX % tileSize) + (u-baseU)*tileSize, -(UI.panY % tileSize) + (v-baseV)*tileSize);
                }
            }
        }
        else{
            let tileSize = 256
            let incr = Math.pow(2, -UI.zoom);
            let baseU = Math.floor(UI.panX/256) * incr;
            let baseV = Math.floor(UI.panY/256) * incr;
            for(let deltaU = 0; 0 < canvasW-(((deltaU/incr)-1)*tileSize); deltaU+=incr){
                for(let deltaV = 0; 0 < canvasH-(((deltaV/incr)-1)*tileSize); deltaV+=incr){
                    TrackViewer.DrawTile(baseU + deltaU, baseV + deltaV, -(UI.panX % 256) + deltaU*256/incr, -(UI.panY % 256) + deltaV*256/incr);
                }
            }
        }
        TrackViewer.DrawMid();
    }

    static DrawMid(){
        TrackViewer.ctxMid.clearRect(0, 0, TrackViewer.canvasMid.width, TrackViewer.canvasMid.height);
        TrackViewer.DrawBorder();
        TrackViewer.DrawFore();
    }

    static DrawFore(){
        TrackViewer.ctxFore.clearRect(0, 0, TrackViewer.canvasMid.width, TrackViewer.canvasMid.height);
        TrackViewer.DrawTrajs();
    }

    static GetTrackBorderColor(i){
        let zoneWeight = TrackViewer.track.lateralZoneWeights[i];

        if(zoneWeight < 0){
            return hexMix(TrackViewer.track.zones[TrackViewer.track.zones.length-1].color, TrackViewer.track.zones[0].color, 1+zoneWeight);
        }

        let floorWeight = Math.floor(zoneWeight);
        if(zoneWeight == floorWeight){
            return TrackViewer.track.zones[floorWeight].color;
        }
        else{
            return hexMix(TrackViewer.track.zones[floorWeight].color, TrackViewer.track.zones[floorWeight+1].color, zoneWeight-floorWeight);
        }
    }
    
    static DrawBorder(style = 1){
        //TrackViewer.ctxMid.strokeStyle = "#555555"; //default color
        let zoomFactor = Math.pow(2,UI.zoom);
    
        if (style == 1) {//PERP TRACK LINES
            for (let i = 0; i < TrackViewer.track.intPoints.length; i++) {
                TrackViewer.ctxMid.strokeStyle = "#" + TrackViewer.GetTrackBorderColor(i);
                if(i == 0){TrackViewer.ctxMid.strokeStyle = "#ff00ff";}
                let x1 = TrackViewer.track.extPoints[i].x*zoomFactor - UI.panX;
                let y1 = TrackViewer.track.extPoints[i].y*zoomFactor - UI.panY;
                let x2 = TrackViewer.track.intPoints[i].x*zoomFactor - UI.panX;
                let y2 = TrackViewer.track.intPoints[i].y*zoomFactor - UI.panY;
                TrackViewer.ctxMid.beginPath();
                TrackViewer.ctxMid.moveTo(x1, y1);
                TrackViewer.ctxMid.lineTo(x2, y2);
                TrackViewer.ctxMid.stroke();
                /*TrackViewer.ctxMid.font = "12px serif";
                TrackViewer.ctxMid.fillStyle = "#00ffff";
                TrackViewer.ctxMid.fillText(i, x2+7, y2-7);*/
            }
            return;
        }
    
        if (style == 2) {//TRACK LIMIT LINES
            for (let i = 1; i < TrackViewer.track.intPoints.length; i++) {
                TrackViewer.ctxMid.strokeStyle = "#" + TrackViewer.GetTrackBorderColor(i);
                let x1 = TrackViewer.track.intPoints[i-1].x*zoomFactor - UI.panX;
                let x2 = TrackViewer.track.intPoints[i].x*zoomFactor - UI.panX;
                let y1 = TrackViewer.track.intPoints[i-1].y*zoomFactor - UI.panY;
                let y2 = TrackViewer.track.intPoints[i].y*zoomFactor - UI.panY;
                let x3 = TrackViewer.track.extPoints[i-1].x*zoomFactor - UI.panX;
                let x4 = TrackViewer.track.extPoints[i].x*zoomFactor - UI.panX;
                let y3 = TrackViewer.track.extPoints[i-1].y*zoomFactor - UI.panY;
                let y4 = TrackViewer.track.extPoints[i].y*zoomFactor - UI.panY;
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

    static DrawTrajs(){
        let mode = "curvature";
        let visualScaler;
        let zoomFactor = Math.pow(2,UI.zoom);
        for(let k = 0; k < TrackViewer.trajs.length; k++){
            for (let i = 1; i < TrackViewer.trajs[k].points.length; i++) {
                let x1 = TrackViewer.trajs[k].points[i - 1].x * zoomFactor - UI.panX;
                let y1 = TrackViewer.trajs[k].points[i - 1].y * zoomFactor - UI.panY;
                let x2 = TrackViewer.trajs[k].points[i].x * zoomFactor - UI.panX;
                let y2 = TrackViewer.trajs[k].points[i].y * zoomFactor - UI.panY;
                if(mode == "curvature"){
                    visualScaler = 3000;
                    let rgb = hslToRgb(120-visualScaler*TrackViewer.trajs[k].absCurves[i],100,50)
                    let r = toHex(Math.floor(rgb[0]));
                    let g = toHex(Math.floor(rgb[1]));
                    let b = toHex(Math.floor(rgb[2]));
                    TrackViewer.ctxFore.strokeStyle = "#" + r + g + b;
                }/*else if(mode == "speed"){
                    visualScaler = 6;
                    let rgb = hslToRgb(visualScaler*TrackViewer.trajs[k].speeds[i],100,50)
                    let r = toHex(Math.floor(rgb[0]));
                    let g = toHex(Math.floor(rgb[1]));
                    let b = toHex(Math.floor(rgb[2]));
                    TrackViewer.ctxFore.strokeStyle = "#" + r + g + b;
                }else if(mode == "acceleration"){
                    visualScaler = 6;
                    let acceleration = visualScaler*(TrackViewer.trajs[k].speeds[i] - TrackViewer.trajs[k].speeds[i-1])*(TrackViewer.trajs[k].speeds[i] + TrackViewer.trajs[k].speeds[i-1])/TrackViewer.trajs[k].dists[i-1]
                    let r = toHex(Math.ceil(Math.min(0,acceleration)));
                    let g = toHex(Math.ceil(Math.max(0,acceleration)));
                    let b = toHex(0);
                    TrackViewer.ctxFore.strokeStyle = "#" + r + g + b;
                }*/
                TrackViewer.ctxFore.lineWidth = 1;
                TrackViewer.ctxFore.beginPath();
                TrackViewer.ctxFore.moveTo(x1, y1);
                TrackViewer.ctxFore.lineTo(x2, y2);
                TrackViewer.ctxFore.stroke();
            }
        }
    }

    static DrawPoint(mapX, mapY, id){
        let zoomFactor = Math.pow(2, UI.zoom);
        let x = mapX*zoomFactor - UI.panX;
        let y = mapY*zoomFactor - UI.panY;
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
