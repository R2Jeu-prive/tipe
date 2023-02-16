trackTraj = new Traj(MakeDiscrete(funTrack), new Point(0, 0, pi / 2, 0));

window.onload = () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    GenReset();
    DrawAll(true);
};
