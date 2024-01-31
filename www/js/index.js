window.onload = () => {
    Server.RequestTrack().then(function(track){
        UI.track = track;
        TrackViewer.track = track;
        TrackViewer.Init();
        UI.Init();
    });
}