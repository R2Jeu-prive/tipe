class UI{
    constructor(){
        this.canvas = document.getElementById('track-canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    DrawAll(){
        //clear canvas and updateFrame if requested
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        //draw track
        track.Draw(1, 'black');

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

/*function DrawTraj(traj, style, color) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    if (style == 0) {//FULL CONCRETE TRACK
        for (let i = 0; i < traj.points.length; i++) {
            ctx.beginPath();
            ctx.arc(traj.points[i].x * canvasScale + canvasOffset.x, traj.points[i].y * canvasScale + canvasOffset.y, trackSemiWidth * canvasScale, 0, 2 * pi, false);
            ctx.fill();
        }
        return;
    }

    if (style == 1) {//PERP TRACK LINES
        ctx.beginPath();
        for (let i = 0; i < traj.points.length; i++) {
            let x1 = (traj.points[i].x + Math.cos(traj.points[i].dir + (pi / 2)) * trackSemiWidth) * canvasScale + canvasOffset.x;
            let y1 = (traj.points[i].y - Math.sin(traj.points[i].dir + (pi / 2)) * trackSemiWidth) * canvasScale + canvasOffset.y;
            let x2 = (traj.points[i].x + Math.cos(traj.points[i].dir - (pi / 2)) * trackSemiWidth) * canvasScale + canvasOffset.x;
            let y2 = (traj.points[i].y - Math.sin(traj.points[i].dir - (pi / 2)) * trackSemiWidth) * canvasScale + canvasOffset.y;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        return;
    }

    if (style == 2) {//SIMPLE LINE
        ctx.beginPath();
        for (let i = 1; i < traj.points.length; i++) {
            let x1 = traj.points[i - 1].x * canvasScale + canvasOffset.x;
            let y1 = traj.points[i - 1].y * canvasScale + canvasOffset.y;
            let x2 = traj.points[i].x * canvasScale + canvasOffset.x;
            let y2 = traj.points[i].y * canvasScale + canvasOffset.y;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        return;
    }

    if (style == 3) {//TRACK LIMIT LINES
        ctx.beginPath();
        for (let i = 1; i < traj.points.length; i++) {
            let x1 = (traj.points[i - 1].x + Math.cos(traj.points[i - 1].dir + (pi / 2)) * trackSemiWidth) * canvasScale + canvasOffset.x;
            let y1 = (traj.points[i - 1].y - Math.sin(traj.points[i - 1].dir + (pi / 2)) * trackSemiWidth) * canvasScale + canvasOffset.y;
            let x2 = (traj.points[i].x + Math.cos(traj.points[i].dir + (pi / 2)) * trackSemiWidth) * canvasScale + canvasOffset.x;
            let y2 = (traj.points[i].y - Math.sin(traj.points[i].dir + (pi / 2)) * trackSemiWidth) * canvasScale + canvasOffset.y;
            let x3 = (traj.points[i - 1].x + Math.cos(traj.points[i - 1].dir - (pi / 2)) * trackSemiWidth) * canvasScale + canvasOffset.x;
            let y3 = (traj.points[i - 1].y - Math.sin(traj.points[i - 1].dir - (pi / 2)) * trackSemiWidth) * canvasScale + canvasOffset.y;
            let x4 = (traj.points[i].x + Math.cos(traj.points[i].dir - (pi / 2)) * trackSemiWidth) * canvasScale + canvasOffset.x;
            let y4 = (traj.points[i].y - Math.sin(traj.points[i].dir - (pi / 2)) * trackSemiWidth) * canvasScale + canvasOffset.y;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.moveTo(x3, y3);
            ctx.lineTo(x4, y4);
        }
        ctx.stroke();
        return;
    }
}*/