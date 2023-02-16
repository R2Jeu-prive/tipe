class Traj {
    constructor(curveArray, startPoint) {
        this.curve = []; //array of curve values
        this.points = [startPoint]; //array of Points
        let i = 0;
        for (let i = 0; i < curveArray.length; i++) {
            this.curve[i] = curveArray[i];
            this.points.push(new Point(this.points[i].x, this.points[i].y, this.points[i].dir, i + 1));//dupe point
            if (this.curve[i] == 0) {
                this.points[i + 1].x += ds * Math.cos(this.points[i].dir);
                this.points[i + 1].y -= ds * Math.sin(this.points[i].dir);//y is bigger going down the screen so -=
            }
            else if (this.curve[i] > 0) {
                let dAngle = -ds * this.curve[i];
                //go to circle center, turn, and go back on perimeter (NOTOPTI)
                this.points[i + 1].dir = (this.points[i].dir - (pi / 2)) % (2 * pi);
                this.points[i + 1].x += Math.cos(this.points[i + 1].dir) / this.curve[i];
                this.points[i + 1].y -= Math.sin(this.points[i + 1].dir) / this.curve[i];
                this.points[i + 1].dir = (this.points[i + 1].dir + pi + dAngle) % (2 * pi);
                this.points[i + 1].x += Math.cos(this.points[i + 1].dir) / this.curve[i];
                this.points[i + 1].y -= Math.sin(this.points[i + 1].dir) / this.curve[i];
                this.points[i + 1].dir = (this.points[i + 1].dir - (pi / 2)) % (2 * pi);
            }
            else if (this.curve[i] < 0) {
                let dAngle = -ds * this.curve[i];
                //go to circle center, turn, and go back on perimeter (NOTOPTI)
                this.points[i + 1].dir = (this.points[i].dir + (pi / 2)) % (2 * pi);
                this.points[i + 1].x += Math.cos(this.points[i + 1].dir) / (-this.curve[i]);
                this.points[i + 1].y -= Math.sin(this.points[i + 1].dir) / (-this.curve[i]);
                this.points[i + 1].dir = (this.points[i + 1].dir + pi + dAngle) % (2 * pi);
                this.points[i + 1].x += Math.cos(this.points[i + 1].dir) / (-this.curve[i]);
                this.points[i + 1].y -= Math.sin(this.points[i + 1].dir) / (-this.curve[i]);
                this.points[i + 1].dir = (this.points[i + 1].dir + (pi / 2)) % (2 * pi);
            }
        }
    }

    IsOnTrack(track) {
        //calc biggest power of 2 that is smaller than trackLength
        let firstDivision = 1;
        while (firstDivision * 2 < track.points.length) {
            firstDivision *= 2;
        }

        //check this traj is on track
        for (let i = 0; i < this.points.length; i++) {
            let foundValidTrackPoint = false;
            //broad to fine search (NOTOPTI so that it doesnt do 0 4|0 2 4 6|0 1 2 3 4 5 6 7)
            for (let division = firstDivision; division >= 1 && !foundValidTrackPoint; division /= 2) {
                for (let j = 0; j < track.points.length && !foundValidTrackPoint; j += division) {
                    foundValidTrackPoint = this.points[i].IsNearPoint(track.points[j]);
                }
            }
            if (!foundValidTrackPoint) { return false; }
        }
        return true;
    }

    GetTime(endPoint) {
        let time = 0;
        let endVector = new Point(Math.cos(endPoint.dir), -Math.sin(endPoint.dir));
        for (let i = 0; i < this.points.length; i++) {
            time += ds / maxSpeedFunction(this.curve[i]);
            if (this.points[i].HasCrossedCheckPoint(endPoint, endVector)) {
                this.points = this.points.slice(0, i + 1);
                return time;
            }
        }
        return NaN;//did not finish
    }

    Mutate(amp, wl) {
        //amp : amplitude of 1D-perlin noise (how much it can turn)
        //wl : make new random turn decision every x points
        let halfAmp = amp / 2;
        let a = rand();
        let b = rand();
        let mutatedCurveArray = [];
        let copiedStartPoint = new Point(this.points[0].x, this.points[0].y, this.points[0].dir);

        let zoneStartIndex = Math.floor(rand() * this.points.length); //random index in traj

        for (let i = zoneStartIndex; i < this.points.length; i++) {
            if (i % wl === 0) {
                a = b;
                b = rand();
                mutatedCurveArray.push(this.curve[i] + a * amp - halfAmp);
            } else {
                mutatedCurveArray.push(this.curve[i] + interpolate(a, b, (i % wl) / wl) * amp - halfAmp);
            }
        }

        //extends new traj by 50% to compensate for potential distance increase (will be cropped when timed)
        for (let i = 0; i < this.points.length / 2; i++) {
            mutatedCurveArray.push(0);
        }

        return new Traj(mutatedCurveArray, copiedStartPoint);
    }
}

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