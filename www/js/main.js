track = new Track();
car  = new Car();
ui = new UI();
family = new Family()


window.onload = () => {
    track.BuildFromCurveFunction(funTrack, pi / 2, 0);
    canvas = document.getElementById('track-canvas');
    ctx = canvas.getContext('2d');
    family.Reset();
};
