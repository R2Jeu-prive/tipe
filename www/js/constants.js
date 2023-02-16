pi = Math.PI;
trackSemiWidth = 0.5;
trackSemiWidthSquared = trackSemiWidth * trackSemiWidth;
ds = pi / 64;

function rand() {
    return Math.random();
}

function interpolate(a, b, x) {
    let ft = x * Math.PI;
    let f = (1 - Math.cos(ft)) * 0.5;
    return a * (1 - f) + b * f;
}