window.onload = () => {
    document.addEventListener("mousedown", MouseDown.bind(this));
    document.addEventListener("mousemove", MouseMove.bind(this));
    document.addEventListener("mouseup", MouseUp.bind(this));
    //document.addEventListener("contextmenu", e => e.preventDefault());
    let topleftGoogleEarthTile = [620232, 750141];
    let panX = 0;
    let panY = 0;
    let panStartX = 0;
    let panStartY = 0;
    let panning = false;
    let movingPointId = -1;
    points = [];
    
    //document.addEventListener("mouseup", this.Pan.bind(this));*/

    canvasBack = document.getElementById('canvasBack');
    ctxBack = canvasBack.getContext('2d');
    canvasFore = document.getElementById('canvasFore');
    ctxFore = canvasFore.getContext('2d');

    /*function Click(e){
        console.log(e)
    }*/

    ReDrawBack()
    ReDrawFore()

    function MouseDown(e){
        if(e.button == 0){
            PanStart(e);
        }else if(e.button == 1 && e.shiftKey){
            CreatePoint(e);
        }else if(e.button == 1){
            movingPointId = GetClosestPoint(e);
            console.log(movingPointId);
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
        if(panX > 256*(48-6)){panX = 256*(48-6);}
        if(panY > 256*(144-2)){panY = 256*(144-2);}
        panStartX = e.pageX;
        panStartY = e.pageY;
        ReDrawBack();
        ReDrawFore();
    }

    function CreatePoint(e){
        if(points.length != 0){
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
        return closestId;
    }

    function ReDrawBack(){
        
        let baseU = Math.floor(panX/256);
        let baseV = Math.floor(panY/256);
        for(let u = baseU; u < baseU+8; u++){
            //if(u < 0 || u > 44){continue;}
            for(let v = baseV; v < baseV+4; v++){
                //if(v < 0 || v > 144){continue;}
                DrawImage(u,v, -(panX % 256) + 256*(u-baseU), -(panY % 256) + 256*(v-baseV));
            }
        }
    }

    function ReDrawFore(){
        ctxFore.clearRect(0, 0, canvasBack.width, canvasBack.height);
        ctxFore.strokeStyle = "#ff00ff"
        ctxFore.beginPath();
        for(let i = 0; i < points.length; i++){
            if(i%3 == 0){
                ctxFore.fillStyle = "#ffffff"
            }else{
                ctxFore.fillStyle = "#00ff00"
            }
            ctxFore.fillRect(points[i].x - panX - 2, points[i].y - panY - 2, 4, 4);
            if(i == 0){
                ctxFore.moveTo(points[i].x - panX, points[i].y - panY);
            }else{
                ctxFore.lineTo(points[i].x - panX, points[i].y - panY);
            }
        }
        ctxFore.stroke();
    }

    function DrawImage(u,v,canvasX,canvasY){
        let img = new Image();
        let x = u + topleftGoogleEarthTile[0];
        let y = v + topleftGoogleEarthTile[1];
        img.addEventListener('load', function() {
            ctxBack.drawImage(img, canvasX, canvasY, 256, 256);
        });
        img.src = '../google_earth_fetcher/villeneuve/' + x + '_' + y + '.png';
    }
}