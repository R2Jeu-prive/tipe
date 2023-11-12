window.onload = () => {
    Server.RequestTrack().then(function(track){
        UI.track = track;
        Canvas.track = track;
        Canvas.Init();
        UI.Init();
        Canvas.DrawBack();

        setInterval(function(){
            Server.RequestState().then(function(state){
                Canvas.trajs = state.trajs;
                Canvas.DrawFore();
            })
        }, 1000);//state refresh interval
    });
}