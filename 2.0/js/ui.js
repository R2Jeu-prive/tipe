class UI{
    static panX = 0;
    static panY = 0;
    static panStartX = 0;
    static panStartY = 0;
    static panning = false;
    static zoom = 0;
    static pointings = []; //list of clicked points for pointing

    static KeyDown(e){
        if(e.key == "+" && !UI.panning){
            UI.zoom += 1;
            UI.panX *= 2;
            UI.panY *= 2;
            Canvas.DrawBack();
        }else if(e.key == "-" && !UI.panning){
            if(UI.zoom == -5){
                return;
            }
            UI.zoom -= 1;
            UI.panX /= 2;
            UI.panY /= 2;
            Canvas.DrawBack();
        }else if(e.key == " "){
            this.pointings = [];
            Canvas.DrawFore();
        }else if(e.key == "c"){
            UI.CopyPointings();
        }
    }

    static MouseDown(e){
        if(e.button == 1){
            UI.PanStart(e);
        }else if(e.button == 0){
            UI.AddPointing(e);
        }
    }
    
    static MouseMove(e){
        if(UI.panning){
            UI.Pan(e);
            return;
        }
    }

    static MouseUp(e){
        UI.panning = false;
        if(e.button == 2 && e.shiftKey){
            e.preventDefault();
        }
    }
    
    static PanStart(e){
        UI.panStartX = e.pageX;
        UI.panStartY = e.pageY;
        UI.panning = true;
    }
    
    static Pan(e){
        if(e.shiftKey){
            UI.panX += 5*(UI.panStartX - e.pageX);
            UI.panY += 5*(UI.panStartY - e.pageY);
        }else{
            UI.panX += (UI.panStartX - e.pageX);
            UI.panY += (UI.panStartY - e.pageY);
        }
        
        if(UI.panX < 0){UI.panX = 0;}
        if(UI.panY < 0){UI.panY = 0;}
        /*let tileSize = 256*Math.pow(2, UI.zoom);
        if(UI.panX > tileSize*Track.numOfTiles[0] - Canvas.canvasBack.width){UI.panX = tileSize*Track.numOfTiles[0] - Canvas.canvasBack.width;}
        if(UI.panY > tileSize*Track.numOfTiles[1] - Canvas.canvasBack.height){UI.panY = tileSize*Track.numOfTiles[1] - Canvas.canvasBack.height;}*/
        UI.panStartX = e.pageX;
        UI.panStartY = e.pageY;
        Canvas.DrawBack();
    }

    static AddPointing(e){
        let mapX = (UI.panX + e.pageX)*Math.pow(2, -UI.zoom);
        let mapY = (UI.panY + e.pageY)*Math.pow(2, -UI.zoom);
        this.pointings.push([mapX, mapY]);
        Canvas.DrawFore();
    }

    static CopyPointings(){
        if(this.pointings.length != 4){
            alert("4 pointings needed");
            return;
        }

        let text = "";
        for(let i = 0; i < 4; i++){
            for(let j = 0; j < 2; j++){
                text += this.pointings[i][j];
                text += "\n";
            }
        }
        navigator.clipboard.writeText(text);
    }
}