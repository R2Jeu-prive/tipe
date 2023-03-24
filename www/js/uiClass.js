class UI{
    constructor(){
        this.canvas = document.getElementById('traj-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.fixedCanvas = document.getElementById('track-canvas');
        this.fixedCtx = this.fixedCanvas.getContext('2d');
        this.trackImage = document.getElementById("trackImage")
    }

    DrawAll(refreshFixed = false){
        //clear canvas and updateFrame if requested
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        //draw track
        if(refreshFixed){
            this.fixedCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            track.Draw(3, 'black', this.trackImage);
        }        

        //draw trajs and show times
        let timeboard = document.getElementById("timeboard");
        timeboard.innerHTML = "";

        for (let i = family.children.length-1; i > -1; i--) {
            if(i < family.parentCount){
                family.children[i].Draw("blue");
                let li = document.createElement("li");
                li.appendChild(document.createTextNode(family.children[i].time));
                timeboard.appendChild(li);
            }else{
                family.children[i].Draw("pink");
            }
        }
    }

    GetFloatParam(string){
        return parseFloat(document.getElementById(string).value);
    }

    GetIntParam(string){
        return parseInt(document.getElementById(string).value);
    }
}
