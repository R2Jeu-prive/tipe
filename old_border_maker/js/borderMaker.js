window.onload = () => {
    document.addEventListener("mousedown", MouseDown.bind(this));
    document.addEventListener("mousemove", MouseMove.bind(this));
    document.addEventListener("mouseup", MouseUp.bind(this));
    document.addEventListener("keydown", KeyDown.bind(this));
    document.addEventListener("contextmenu", e => e.shiftKey ? e.preventDefault() : false);
    let topleftGoogleEarthTile = [620232, 750141];
    let panX = 0;
    let panY = 0;
    let panStartX = 0;
    let panStartY = 0;
    let panning = false;
    let movingPointId = -1;
    let zoom = 0;
    points = [];
    
    //document.addEventListener("mouseup", this.Pan.bind(this));*/

    canvasBack = document.getElementById('canvasBack');
    ctxBack = canvasBack.getContext('2d');
    canvasFore = document.getElementById('canvasFore');
    ctxFore = canvasFore.getContext('2d');

    LoadSavedPoints();
    ReDrawBack();
    ReDrawFore();

    function KeyDown(e){
        if(e.key == "+"){
            zoom += 1;
            ZoomPoints(2);
        }else if(e.key == "-"){
            if(zoom == 0){
                return;
            }
            zoom -= 1;
            ZoomPoints(.5);
        }
    }

    function ZoomPoints(factor){
        panX *= factor;
        panY *= factor;
        for(let i = 0; i < points.length; i++){
            points[i].x *= factor;
            points[i].y *= factor;
        }
        ReDrawBack();
        ReDrawFore();
    }

    function MouseDown(e){
        if(e.button == 1){
            PanStart(e);
        }else if(e.button == 0 && e.shiftKey){
            CreatePoint(e, false);
        }else if(e.button == 0 && e.ctrlKey){
            CreatePoint(e, true);
        }else if(e.button == 0){
            movingPointId = GetClosestPoint(e);
        }else if(e.button == 2 && e.shiftKey){
            e.preventDefault();
            canvasFore.hidden = !canvasFore.hidden;
        }
    }

    function MouseMove(e){
        if(panning){
            Pan(e);
            return;
        }

        if(movingPointId != -1){
            MovePoint(e);
        }
    }

    function MouseUp(e){
        panning = false;
        movingPointId = -1;
        if(e.button == 2 && e.shiftKey){
            e.preventDefault();
        }
        SavePoints();
    }

    function PanStart(e){
        panStartX = e.pageX;
        panStartY = e.pageY;
        panning = true;
    }

    function Pan(e){
        if(e.shiftKey){
            panX += 5*(panStartX - e.pageX);
            panY += 5*(panStartY - e.pageY);
        }else{
            panX += (panStartX - e.pageX);
            panY += (panStartY - e.pageY);
        }
        
        if(panX < 0){panX = 0;}
        if(panY < 0){panY = 0;}
        /*if(panX > 256*(48-6)){panX = 256*(48-6);}
        if(panY > 256*(144-2)){panY = 256*(144-2);}*/
        panStartX = e.pageX;
        panStartY = e.pageY;
        ReDrawBack();
        ReDrawFore();
    }

    function CreatePoint(e, single){
        if(points.length != 0 && !single){
            points.push(new Point((e.pageX + panX + 2*points[points.length-1].x)/3, (e.pageY + panY + 2*points[points.length-1].y)/3));
            points.push(new Point((2*(e.pageX + panX) + points[points.length-2].x)/3, (2*(e.pageY + panY) + points[points.length-2].y)/3));
        }
        points.push(new Point(e.pageX + panX, e.pageY + panY));
        ReDrawFore();
    }

    function MovePoint(e){
        if(movingPointId > 1 && movingPointId < points.length-2){
            if(movingPointId % 3 == 1){
                points[movingPointId].x = e.pageX + panX;
                points[movingPointId].y = e.pageY + panY;
                points[movingPointId-2].x = 2*points[movingPointId-1].x - points[movingPointId].x;
                points[movingPointId-2].y = 2*points[movingPointId-1].y - points[movingPointId].y;
            }else if(movingPointId % 3 == 2){
                points[movingPointId].x = e.pageX + panX;
                points[movingPointId].y = e.pageY + panY;
                points[movingPointId+2].x = 2*points[movingPointId+1].x - points[movingPointId].x;
                points[movingPointId+2].y = 2*points[movingPointId+1].y - points[movingPointId].y;
            }else if(movingPointId % 3 == 0){
                points[movingPointId-1].x += -points[movingPointId].x + e.pageX + panX;
                points[movingPointId-1].y += -points[movingPointId].y + e.pageY + panY;
                points[movingPointId+1].x += -points[movingPointId].x + e.pageX + panX;
                points[movingPointId+1].y += -points[movingPointId].y + e.pageY + panY;
                points[movingPointId].x = e.pageX + panX;
                points[movingPointId].y = e.pageY + panY;
            }
        }else if(points.length%3 == 0 && movingPointId == 1){
            points[1].x = e.pageX + panX;
            points[1].y = e.pageY + panY;
            points[points.length-1].x = 2*points[0].x - points[1].x;
            points[points.length-1].y = 2*points[0].y - points[1].y;
        }else{
            points[movingPointId].x = e.pageX + panX;
            points[movingPointId].y = e.pageY + panY;
        }

        ReDrawFore();
    }

    function GetClosestPoint(e){
        if(points.length == 0){return -1;}
        let closestId = 0;
        for(let i = 1; i < points.length; i++){
            if(Math.pow(points[i].x-(e.pageX+panX), 2) + Math.pow(points[i].y-(e.pageY+panY), 2) < Math.pow(points[closestId].x-(e.pageX+panX), 2) + Math.pow(points[closestId].y-(e.pageY+panY), 2)){
                closestId = i;
            }
        }
        if(100 < Math.pow(points[closestId].x-(e.pageX+panX), 2) + Math.pow(points[closestId].y-(e.pageY+panY), 2)){
            return -1;
        }
        return closestId;
    }

    function SavePoints(){
        let str = "";
        for(let i = 0; i < points.length; i++){
            str = str.concat(JSON.stringify(points[i].x/(Math.pow(2,zoom))))
            str = str.concat("|");
            str = str.concat(JSON.stringify(points[i].y/(Math.pow(2,zoom))))
            str = str.concat(";");
        }
        localStorage.setItem('points', str);
    }

    function LoadSavedPoints(){
        let str = localStorage.getItem('points');
        if(str === null){return;}
        let strPoints = str.split(";");
        for(let i = 0; i < strPoints.length-1; i++){
            let strCoords = strPoints[i].split("|");
            points.push(new Point(parseFloat(strCoords[0]), parseFloat(strCoords[1])));
        }
        for(let i = 0; i < strPoints.length-1; i+=3){//CHECKS NOT DIFFERENTIABLE 
            if(i == 0){
                dx1 = points[points.length-1].x - points[0].x
                dy1 = points[points.length-1].y - points[0].y
                dx2 = points[0].x - points[1].x
                dy2 = points[0].y - points[1].y
            }else{
                if(i == 0){
                    dx1 = points[i-1].x - points[i].x
                    dy1 = points[i-1].y - points[i].y
                    dx2 = points[i].x - points[i+1].x
                    dy2 = points[i].y - points[i+1].y
                }
            }
            if(dx1*dy2 != dx2*dy1){
                console.log(i);
            }
        }
    }

    function ReDrawBack(){
        
        let baseU = Math.floor(panX/(256*Math.pow(2,zoom)));
        let baseV = Math.floor(panY/(256*Math.pow(2,zoom)));
        for(let u = baseU; u < baseU+8; u++){
            //if(u < 0 || u > 44){continue;}
            for(let v = baseV; v < baseV+4; v++){
                //if(v < 0 || v > 144){continue;}
                DrawImage(u,v, -(panX % (256*Math.pow(2,zoom))) + 256*(u-baseU)*Math.pow(2,zoom), -(panY % (256*Math.pow(2,zoom))) + 256*(v-baseV)*Math.pow(2,zoom));
            }
        }
    }

    function ReDrawFore(){
        ctxFore.clearRect(0, 0, canvasBack.width, canvasBack.height);

        ctxFore.strokeStyle = "#ff00ff"
        ctxFore.beginPath();
        for(let i = 0; i < points.length; i++){
            if(i == 0){
                ctxFore.moveTo(points[i].x - panX, points[i].y - panY);
            }else if(i%3 == 2){
                ctxFore.moveTo(points[i].x - panX, points[i].y - panY);
            }else{
                ctxFore.lineTo(points[i].x - panX, points[i].y - panY);
            }
        }
        ctxFore.stroke();

        ctxFore.strokeStyle = "#000000"
        ctxFore.beginPath();
        for(let i = 0; i < points.length; i++){
            if(i == -1){//SPOTTER
                ctxFore.fillStyle = "#00ffff"
                ctxFore.fillRect(points[i].x - panX - 2, points[i].y - panY - 2, 20, 20);
            }
            else if(i%3 == 0){
                ctxFore.fillStyle = "#ffffff"
            }else{
                ctxFore.fillStyle = "#ff00ff"
            }
            ctxFore.fillRect(points[i].x - panX - 2, points[i].y - panY - 2, 4, 4);
            if(i == 0){
                ctxFore.moveTo(points[i].x - panX, points[i].y - panY);
            }else if(i%3 == 0){
                ctxFore.bezierCurveTo(points[i-2].x - panX, points[i-2].y - panY, points[i-1].x - panX, points[i-1].y - panY, points[i].x - panX, points[i].y - panY);
            }
        }
        if(points.length%3 == 0){//isLoop
            ctxFore.moveTo(points[points.length-3].x - panX, points[points.length-3].y - panY);
            ctxFore.bezierCurveTo(points[points.length-2].x - panX, points[points.length-2].y - panY, points[points.length-1].x - panX, points[points.length-1].y - panY, points[0].x - panX, points[0].y - panY);
        }
        ctxFore.stroke();
    }

    function DrawImage(u,v,canvasX,canvasY){
        let img = new Image();
        let x = u + topleftGoogleEarthTile[0];
        let y = v + topleftGoogleEarthTile[1];
        img.addEventListener('load', function() {
            ctxBack.drawImage(img, canvasX, canvasY, 256*Math.pow(2,zoom), 256*Math.pow(2,zoom));
        });
        img.src = '../google_earth_fetcher/villeneuve/' + x + '_' + y + '.png';
    }
}