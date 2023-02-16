childs = [];
childTimes = [];
parentIds = [];

function GenReset() {
    let midTraj = new Traj(trackTraj.curve, new Point(trackTraj.points[0].x, trackTraj.points[0].y, trackTraj.points[0].dir, 0));
    childs = [midTraj];
    parentIds = [0];
    DrawAll(false);
}

function GenForward() {
    let mutateForce = parseFloat(document.getElementById('mutateForce').value);
    let mutateWL = parseInt(document.getElementById('mutateWL').value);
    let childCountPetParent = parseInt(document.getElementById('childCountPerParent').value);
    let parentCount = parseInt(document.getElementById('parentCount').value);
    let parents = [];
    let bestTimes = [];
    let bestTimesIds = [];

    //fetch parents
    for (let i = 0; i < parentIds.length; i++) {
        parents.push(childs[parentIds[i]]);
    }
    childs = [];
    childTimes = [];
    parentIds = [];

    //prepare parent selection in childs
    for (let i = 0; i < parentCount; i++) {
        bestTimes.push(Infinity);
        bestTimesIds.push(-1);
    }

    //make childs and mark bests as parent
    for (let i = 0; i < parents.length; i++) {
        for (let j = 0; j < childCountPetParent; j++) {
            let traj = parents[i].Mutate(j == 0 ? 0 : mutateForce, mutateWL);
            let time = traj.GetTime(trackTraj.points[trackTraj.points.length - 1]);
            if (isNaN(time) || !traj.IsOnTrack(trackTraj)) {
                j--;
                continue;
            }
            childs.push(traj);
            childTimes.push(time);
            bestTimes.push(time);
            bestTimesIds.push(i * childCountPetParent + j);
            for (let k = parentCount - 1; k >= 0; k--) {
                if (bestTimes[k] > bestTimes[k + 1]) {
                    let temp = bestTimes[k];
                    bestTimes[k] = bestTimes[k + 1];
                    bestTimes[k + 1] = temp;
                    temp = bestTimesIds[k];
                    bestTimesIds[k] = bestTimesIds[k + 1];
                    bestTimesIds[k + 1] = temp;
                } else { break; }
            }
            bestTimes.pop();
            bestTimesIds.pop();
        }
    }

    parentIds = bestTimesIds;
    UpdateTimeBoard(bestTimes);
    DrawAll(false);
}