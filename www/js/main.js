track = new Track();
car  = new Car();
ui = new UI();
family = new Family()


window.onload = () => {
    /*track.BuildFromCurveFunction(funTrack, pi / 2, 0);
    canvas = document.getElementById('track-canvas');
    ctx = canvas.getContext('2d');
    family.Reset();*/

    track.BuildFromRightPoints(imola.points.map(function(val,i){return i%2 == 0 ? (val + 13.5655791360537)/0.75 : (val + 22.2414900823916)/0.75}))
    family.Reset();
};
