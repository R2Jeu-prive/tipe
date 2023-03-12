class Family{
    constructor(){
        this.children = [];
        this.parentCount = 0;
        this.childrenCountPerParent = 1;
        this.loopTimeout = -1;
    }

    Reset(){
        let centerTraj = new Traj();
        centerTraj.BuildPoints();
        centerTraj.Draw();
        centerTraj.CalcAbsCurve();
        centerTraj.CalcDists();
        centerTraj.Time();
        this.children = [centerTraj];
        ui.DrawAll();
        this.loopTimeout = -1;
    }

    StopGen(){
        clearTimeout(this.loopTimeout);
    }

    GenForward(){
        this.parentCount = ui.GetIntParam("parentCount");
        this.childrenCountPerParent = ui.GetIntParam("childrenCountPerParent");
        let mutationForce = ui.GetFloatParam("mutationForce");
        let mutationWidth = ui.GetFloatParam("mutationWidth");
        let parents = this.children;
        if(parents.length > this.parentCount){
            parents.splice(this.parentCount,parents.length - this.parentCount);
        }
        this.children = [];
        for(let i = 0; i < parents.length; i++){
            this.children.push(parents[i]);//first child is parent unmodified
            for(let j = 1; j < this.childrenCountPerParent; j++){
                let newTraj = parents[i].CreateMutation(mutationForce, mutationWidth);
                if(newTraj.CalcAbsCurve()){
                    newTraj.CalcDists();
                    newTraj.Time();
                    this.children.push(newTraj);
                }
            }
        }

        this.children.sort((a,b) => a.time - b.time);

        ui.DrawAll();
        this.loopTimeout = setTimeout(() => {
            this.GenForward()
        }, "10")
    }
}

/*function GenForward(recall) {
    console.log("GenForward !");
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
    if(recall){
        setTimeout(() => {
            GenForward(true)
        }, "500")
    }
}*/