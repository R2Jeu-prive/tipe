window.onload = () => {
    Server.RequestTrack().then(function(track){
        UI.track = track;
        Canvas.track = track;
        Canvas.Init();
        UI.Init();
        Canvas.DrawBack();
    });
}