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
        centerTraj.CalcSpeed();
        centerTraj.Time();
        this.children = [centerTraj];
        ui.DrawAll(true);
        this.loopTimeout = -1;
    }

    StopGen(){
        clearTimeout(this.loopTimeout);
    }

    EvaluateChild(childTraj){
        if(childTraj.time == -1){
            childTraj.BuildPoints();
            if(childTraj.CalcAbsCurve()){
                childTraj.CalcDists();
                childTraj.CalcSpeed();
                childTraj.Time();
            }
            else{
                return false;//was not kept because not feasible
            }
        }
        if(this.children.length < this.parentCount){
            this.children.push(childTraj);
            return true;//was kept because we're missing children
        }else if(this.children[this.parentCount-1].time < childTraj.time){
            return false;//was not kept, worse then all children we have
        }else{
            this.children.pop();
            this.children.push(childTraj);
            for(let i = this.parentCount-2; i >= 0; i--){
                if(this.children[i].time < this.children[i+1].time){
                    break;
                }
                let temp = this.children[i];
                this.children[i] = this.children[i+1];
                this.children[i+1] = temp;
            }
            return true;//was kept and ordered in children array
        }
    }

    GenForward(){
        this.parentCount = ui.GetIntParam("parentCount");
        this.childrenCountPerParent = ui.GetIntParam("childrenCountPerParent");
        let mutationForce = ui.GetFloatParam("mutationForce");
        let mutationWidth = ui.GetFloatParam("mutationWidth");
        if(this.children.length > this.parentCount){
            this.children.splice(this.parentCount,this.children.length - this.parentCount);
        }
        let parents = this.children;
        for(let i = 0; i < parents.length; i++){
            let morphingChild = new Traj();
            morphingChild.CopyLateralsFrom(parents[i], 0, parents[i].laterals.length-1);
            for(let j = 0; j < this.childrenCountPerParent; j++){
                morphingChild.time = -1;
                let [morphStart,morphEnd] = morphingChild.Mutate(mutationForce, mutationWidth);
                if(this.EvaluateChild(morphingChild)){
                    morphingChild = new Traj();
                    morphingChild.CopyLateralsFrom(parents[i], 0, parents[i].laterals.length-1);
                }else{
                    morphingChild.CopyLateralsFrom(parents[i], morphStart, morphEnd);
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
