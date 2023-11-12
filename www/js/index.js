window.onload = () => {
    Server.RequestTrack().then(function(track){
        UI.track = track;
        Canvas.track = track;
        UI.Init();
        Canvas.Init();
        Canvas.DrawBack();

        setInterval(function(){
            Server.RequestState().then(function(state){
                console.log(state.trajs);
            })
        }, 1000);//state refresh interval
    });

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