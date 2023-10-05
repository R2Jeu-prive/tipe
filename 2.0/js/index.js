window.onload = () => {
    document.addEventListener("mousedown", UI.MouseDown.bind(this));
    document.addEventListener("mousemove", UI.MouseMove.bind(this));
    document.addEventListener("mouseup", UI.MouseUp.bind(this));
    document.addEventListener("keydown", UI.KeyDown.bind(this));
    document.addEventListener("contextmenu", e => e.shiftKey ? e.preventDefault() : false);

    Track.Init(Villeneuve);
    Canvas.Init();
    Canvas.DrawBack();
    Canvas.DrawBorder();
    //Family.Init();
    /*ReDrawFore();

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
    }*/
}