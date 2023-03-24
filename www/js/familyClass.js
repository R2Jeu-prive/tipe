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
        ui.DrawAll(true);
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

        ui.DrawAll(false);
        this.loopTimeout = setTimeout(() => {
            this.GenForward()
        }, "10")
    }
}
