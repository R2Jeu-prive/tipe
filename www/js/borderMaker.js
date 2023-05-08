window.onload = () => {
    document.addEventListener("mousedown", PanStart.bind(this));
    document.addEventListener("mousemove", Pan.bind(this));
    document.addEventListener("mouseup", PanStop.bind(this));
    let panX = 0;
    let panY = 0;
    let panStartX = 0;
    let panStartY = 0;
    let panning = false;
    
    //document.addEventListener("mouseup", this.Pan.bind(this));*/

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    /*function Click(e){
        console.log(e)
    }*/

    ReDrawCanvas()

    function PanStart(e){
        panStartX = e.pageX;
        panStartY = e.pageY;
        panning = true;
    }

    function Pan(e){
        if(!panning){return;}
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
        ReDrawCanvas();
    }

    function PanStop(){
        panning = false;
    }

    function ReDrawCanvas(){
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        let baseU = Math.floor(panX/256);
        let baseV = Math.floor(panY/256);
        for(let u = baseU; u < baseU+8; u++){
            //if(u < 0 || u > 44){continue;}
            for(let v = baseV; v < baseV+4; v++){
                //if(v < 0 || v > 144){continue;}
                DrawImage(u,v, -(panX % 256) + 256*(u-baseU), -(panY % 256) + 256*(v-baseV))
            }
        }
    }

    function DrawImage(u,v,canvasX,canvasY){
        let img = new Image();
        let x = u + 620232;//get correct google earth values
        let y = v + 750141;
        img.addEventListener('load', function() {
            ctx.drawImage(img, canvasX, canvasY, 256, 256);
        });
        img.src = '../google_earth_fetcher/villeneuve/' + x + '_' + y + '.png';
    }
}