window.onload = () => {
    document.addEventListener("mousedown", UI.MouseDown.bind(this));
    document.addEventListener("mousemove", UI.MouseMove.bind(this));
    document.addEventListener("mouseup", UI.MouseUp.bind(this));
    document.addEventListener("keydown", UI.KeyDown.bind(this));
    document.addEventListener("contextmenu", e => e.shiftKey ? e.preventDefault() : false);

    /*Track.Init(Villeneuve);
    Canvas.Init();
    Canvas.DrawBack();
    Canvas.DrawBorder();
    let worker = new Worker("/2.0/js/worker.js");
    worker.postMessage({command:"init"});

    worker.onmessage = function(e){
        let command = e.data.command;
        if(command == "canvasDrawFore"){
            //Canvas.drawnTrajs = e.data.drawnTrajs;
            console.log(e.data.drawnTrajs);
            //Canvas.DrawFore();
        }
    }*/
}