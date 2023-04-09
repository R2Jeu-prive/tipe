class UI{
    constructor(){
        this.canvas = document.getElementById('traj-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.fixedCanvas = document.getElementById('track-canvas');
        this.fixedCtx = this.fixedCanvas.getContext('2d');

        this.canvas.addEventListener("mousedown", this.PanStart.bind(this));
        document.addEventListener("mousemove", this.Pan.bind(this));
        document.addEventListener("mouseup", this.PanStop.bind(this));
        this.canvas.addEventListener("mousewheel", this.Zoom.bind(this));

        this.panning = false;
        this.panCoords = [NaN,NaN];
    }

    DrawAll(refreshFixed = false){
        //clear canvas and updateFrame if requested
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        //draw track
        if(refreshFixed){
            this.fixedCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            track.Draw(3, 'black');
        }        

        //draw trajs and show times
        let timeboard = document.getElementById("timeboard");
        timeboard.innerHTML = "";

        for (let i = family.children.length-1; i > -1; i--) {
            family.children[i].Draw();
            let li = document.createElement("li");
            li.appendChild(document.createTextNode(family.children[i].time));
            timeboard.appendChild(li);
        }
    }

    GetFloatParam(string){
        return parseFloat(document.getElementById(string).value);
    }

    GetIntParam(string){
        return parseInt(document.getElementById(string).value);
    }

    SetParam(string, val){
        return document.getElementById(string).value = val;
    }

    PanStart(e){
        this.panning = true;
        this.panCoords = [e.pageX, e.pageY];
    }
    Pan(e){
        if(!this.panning){return;}
        if(e.pageX != this.panCoords[0] || e.pageY != this.panCoords[1]){
            this.SetParam("offsetX", this.GetFloatParam("offsetX") - this.panCoords[0] + e.pageX);
            this.SetParam("offsetY", this.GetFloatParam("offsetY") - this.panCoords[1] + e.pageY);
            this.panCoords = [e.pageX, e.pageY];
            this.DrawAll(true);
        }
    }
    PanStop(){
        this.panning = false;
        this.panCoords = [NaN, NaN];
    }

    Zoom(e){
        let oldScale = this.GetFloatParam("scale");
        this.SetParam("scale", this.GetFloatParam("scale") * Math.pow(1.1,-e.deltaY/100));
        this.SetParam("offsetX", e.offsetX - (e.offsetX - this.GetFloatParam("offsetX"))*this.GetFloatParam("scale")/oldScale);
        this.SetParam("offsetY", e.offsetY - (e.offsetY - this.GetFloatParam("offsetY"))*this.GetFloatParam("scale")/oldScale);
        this.DrawAll(true);
    }
}
