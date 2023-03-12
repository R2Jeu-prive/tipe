function MakeDiscrete(curveFunction) {
    let curveArray = [];
    let i = 0;
    while (true) {
        let curve = curveFunction(i * ds);
        if (isNaN(curve)) {
            break;
        }
        curveArray.push(curve);
        i++;
    }
    return curveArray;
}

function funTrack(dist) {
    if (dist < 2) {
        return 0;
    }
    if (dist < 2 + pi) {
        return 0.5;
    }
    if (dist < 2 + pi) {
        return 0.5;
    }
    if (dist < 2 + (1.5 * pi)) {
        return 1;
    }
    if (dist < 2 + (2 * pi)) {
        return -1;
    }
    if (dist < 10) {
        return 0;
    }
    if (dist < 10 + (0.5*pi)) {
        return -1;
    }
    if (dist < 10 + pi) {
        return 1;
    }
    if (dist < 10 + (2*pi)) {
        return 0.5;
    }
    if (dist < 20) {
        return 0;
    }
    return NaN;
}

function doubleTurn(dist) {
    if (dist < 2) {
        return 0;
    }
    if (dist < 2 + pi) {
        return 0.5;
    }
    if (dist < 4 + pi) {
        return 0;
    }
    if (dist < 4 + 2 * pi) {
        return -0.5;
    }
    return NaN;
}

function simpleUTurn(dist) {
    if (dist < pi) {
        return 0;
    }
    if (dist < 3 * pi) {
        return 0.5;
    }
    if (dist < 4 * pi) {
        return 0;
    }
    return NaN;
}

function fasterUTurn(dist) {
    if (dist < 60 * pi / 64) {
        return 0;
    }
    if (dist < 188 * pi / 64) {
        return 0.5;
    }
    if (dist < 248 * pi / 64) {
        return 0;
    }
    return NaN;
}

function fastestUTurn(dist) {
    if (dist < 48 * pi / 64) {
        return 0;
    }
    if (dist < 176 * pi / 64) {
        return 0.5;
    }
    if (dist < 240 * pi / 64) {
        return 0;
    }
    return NaN;
}

function progressiveCurve(s) {
    if (s < 10) {
        return 1 / (Math.sqrt(s) + 1)
    }
    return NaN;
}