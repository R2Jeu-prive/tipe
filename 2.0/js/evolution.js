class Evolution{
    static evaluationMode = "";
    static mutationMode = "";
    static children = [new Traj()];//placeholder
    static loopId = -1;

    static Init(){
        Evolution.Stop();
        this.LoadEvaluationMode();
        this.LoadMutationMode();
        this.GenerateChildren(1);
        this.loopId = -1;

        Canvas.drawnTrajs = this.children;
        Canvas.DrawFore();
    }

    static GenerateChildren(count){
        this.children = [];
        for(let i = 0; i < count; i++){
            this.children.push(new Traj());
            let randomVal = rand();
            for(let j = 0; j < Track.extPoints.length; j++){
                this.children[i].laterals[j] = randomVal;
            }
            this.children[i].BuildPoints();
            this.children[i].CalcDists();
            this.children[i].CalcCurvature();
            this.children[i].isBuilt = true;
        }
    }

    static LoadEvaluationMode(){
        this.evaluationMode = document.getElementById("evaluationMode").value;
        for(let i = 0; i < this.children.length; i++){
            this.children[i].Evaluate();
        }
        Canvas.drawnTrajs = this.children;
        Canvas.DrawFore()
        Evolution.Stop();
    }

    static LoadMutationMode(){
        this.mutationMode = document.getElementById("mutationMode").value;
    }

    static Stop(){
        clearTimeout(this.loopId);
    }

    static Step(){
        let mutationForce = parseFloat(document.getElementById("mutationForce").value);
        let mutationWidth = parseFloat(document.getElementById("mutationWidth").value);
        for(let i = 0; i < this.children.length; i++){
            for(let j = 0; j < 500; j++){
                let newTraj = Traj.DeepCopy(this.children[i]);
                for(let k = 0; k < 5; k++){
                    newTraj.Mutate(mutationForce, mutationWidth);
                }
                this.children[i].Evaluate(this.evaluationMode);
                newTraj.Evaluate(this.evaluationMode);
                if(this.children[i].evaluation > newTraj.evaluation){
                    this.children[i] = newTraj;
                    Result.StoreMutationResult("global", true);
                }else{
                    Result.StoreMutationResult("global", false);
                }
            }
        }

        this.children.sort((a,b) => a.evaluation - b.evaluation);

        Result.ShowBestEval(Math.round(this.children[0].evaluation));
        Result.ShowSuccessRates();

        Canvas.drawnTrajs = this.children;
        Canvas.DrawFore();
        this.loopId = setTimeout(() => {
            Evolution.Step()
        }, 10);
    }
}