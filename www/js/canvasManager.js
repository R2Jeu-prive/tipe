canvasOffset = new Point(500, 250);
canvasScale = 0;

function DrawAll(updateFrame) {
    //clear canvas and updateFrame if requested
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (updateFrame) {
        canvasOffset.x = 500 + parseInt(document.getElementById('offsetX').value);
        canvasOffset.y = 250 + parseInt(document.getElementById('offsetY').value);
        canvasScale = parseInt(document.getElementById('scale').value);
    }

    //draw track
    DrawTraj(trackTraj, 3, 'black');

    //draw trajs
    for (let i = 0; i < childs.length; i++) {
        if (!parentIds.includes(i)) {
            DrawTraj(childs[i], 2, "pink");
        }
    }
    for (let i = 0; i < parentIds.length; i++) {
        DrawTraj(childs[parentIds[i]], 2, "green");
    }
}

function DrawTraj(traj, style, color) {
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
}