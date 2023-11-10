let {Track} = require("../common_classes/track");
let {Traj} = require("../common_classes/traj");
let {Task} = require("./task");

class Engine{
    constructor(){
        this.tasks = [new Task()];
        this.running = false;
        this.trajs = [new Traj()];

        this.SetInitTrajs(10);
        this.tasks = [];
        this.tickCount = 0;
    }

    GetState(){
        let state = {};
        state.running = this.running;
        state.trajs = this.trajs;
        state.track = Track;
        return state;
    }

    SetInitTrajs(count){
        this.trajs = [];
        for(let i = 0; i < count; i++){
            this.trajs.push(new Traj());
            let randomVal = Math.random();
            for(let j = 0; j < Track.extPoints.length; j++){
                this.trajs[i].laterals[j] = randomVal;
            }
            this.trajs[i].BuildPoints();
            this.trajs[i].CalcDists();
            this.trajs[i].CalcCurvature();
            this.trajs[i].isBuilt = true;
        }
    }

    Start(){
        if(this.running){return;}
        this.running = true;
        this.Step(0);
    }

    Step(){
        //TODO STEP CODE

        this.tickCount += 1;
        if(this.running){
            setImmediate(() => {this.Step()});
        }else{
            console.log("Engine Paused");
        }
    }

    ShowTps(){
        let startTick = this.tickCount;
        setTimeout(() => {console.log("currently at "(this.tickCount - startTick) + "tps")},1000)
    }

    Stop(){
        this.running = false;
    }
}

/*

    static evaluationMode = "curvature";
    static mutationMode = "both";
    static children = [new Traj()];//placeholder
    static running = false;

    static SendFrame(){
        postMessage({command:"frame", trajs:this.children});
    }

    static SendForceEvaluationMode(){
        postMessage({command:"forceEvaluationMode", evaluationMode:this.evaluationMode});
    }

    static Init(){
        Evolution.Stop();
        this.GenerateChildren(1);
        this.loopId = -1;

        SendCanvasDraw("Fore");
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

    /*static LoadEvaluationMode(){
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

    static Start(){
        this.running = true;
        let lastFrame = 0;
        let frameDelta = 1000/20;//ms per frame
        while(this.running){
            Evolution.Step();
            if(lastFrame - Date.now() > frameDelta){
                lastFrame = Date.now();
                this.SendCanvasDraw("Fore");
            }
        }
    }

    static Stop(){
        this.running = false;
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
                    //Result.StoreMutationResult("global", true);
                }else{
                    //Result.StoreMutationResult("global", false);
                }
            }
        }

        this.children.sort((a,b) => a.evaluation - b.evaluation);
    }
}

*/

module.exports = {Engine};