class Family{
    static children = [];
    static evaluationMode;
    static mutationMode;
    static parentCount = 0;
    static childrenCountPerParent = 1;
    static loopTimeout = -1;
    static Init(){
        this.ChangeEvaluationMode();
        this.ChangeMutationMode();
        let centerTraj = new Traj();
        centerTraj.BuildPoints();
        centerTraj.CalcAbsCurve();
        centerTraj.Evaluate();
        this.children = [centerTraj];
        Canvas.drawnTrajs = this.children;
        Canvas.DrawFore();
        
        this.loopTimeout = -1;
    }

    static ChangeEvaluationMode(){
        this.evaluationMode = document.getElementById("evaluationMode").value;
        for(let i = 0; i < this.children.length; i++){
            this.children[i].Evaluate();
        }
        Canvas.drawnTrajs = this.children;
        Canvas.DrawFore()
        this.StopGen();
    }

    static ChangeMutationMode(){
        this.mutationMode = document.getElementById("mutationMode").value;
    }

    static StopGen(){
        clearTimeout(this.loopTimeout);
    }

    static EvaluateChild(childTraj){
        if(childTraj.evaluation == -1){
            childTraj.BuildPoints();
            if(childTraj.CalcAbsCurve()){
                childTraj.CalcDists();
                childTraj.CalcSpeed();
                childTraj.Evaluate();
            }
            else{
                return false;//was not kept because not feasible
            }
        }
        if(this.children.length < this.parentCount){
            this.children.push(childTraj);
            return true;//was kept because we're missing children
        }else if(this.children[this.parentCount-1].evaluation < childTraj.evaluation){
            return false;//was not kept, worse then all children we have
        }else{
            this.children.pop();
            this.children.push(childTraj);
            for(let i = this.parentCount-2; i >= 0; i--){
                if(this.children[i].evaluation < this.children[i+1].evaluation){
                    break;
                }
                let temp = this.children[i];
                this.children[i] = this.children[i+1];
                this.children[i+1] = temp;
            }
            return true;//was kept and ordered in children array
        }
    }

    static GenForward(){
        this.parentCount = parseInt(document.getElementById("parentCount").value);
        this.childrenCountPerParent = parseInt(document.getElementById("childrenCountPerParent").value);
        let mutationForce = parseFloat(document.getElementById("mutationForce").value);
        let mutationWidth = parseFloat(document.getElementById("mutationWidth").value);
        if(this.children.length > this.parentCount){
            this.children.splice(this.parentCount,this.children.length - this.parentCount);
        }
        let parents = this.children;
        for(let i = 0; i < parents.length; i++){
            let morphingChild = new Traj();
            morphingChild.CopyLateralsFrom(parents[i], 0, parents[i].laterals.length-1);
            for(let j = 0; j < this.childrenCountPerParent; j++){
                morphingChild.evaluation = -1;
                let [morphStart,morphEnd] = morphingChild.Mutate(mutationForce, mutationWidth);
                if(this.EvaluateChild(morphingChild)){
                    morphingChild = new Traj();
                    Result.StoreMutateSuccess(true);
                    morphingChild.CopyLateralsFrom(parents[i], 0, parents[i].laterals.length-1);
                }else{
                    morphingChild.CopyLateralsFrom(parents[i], morphStart, morphEnd);
                    Result.StoreMutateSuccess(false);
                }
            }
        }

        this.children.sort((a,b) => a.evaluation - b.evaluation);

        Result.ShowBestEval(Math.round(this.children[0].evaluation));

        Canvas.drawnTrajs = this.children;
        Canvas.DrawFore(false);
        this.loopTimeout = setTimeout(() => {
            this.GenForward()
        }, "10")
    }
}
