let {Track} = require("../common_classes/track");
let {Traj} = require("../common_classes/traj");
let {SaveSystem} = require("./saveSystem");
let {Task} = require("./task");

class Engine{
    constructor(){
        //EVOLUTION
        this.mutationForce = 0.1;
        this.mutationSemiLength = 5;
        this.maxMutationTries = 100;
        this.evaluationMode = "curvature";
        this.mutationMode = "bump";

        //BASE
        this.running = false;
        this.trajs = [new Traj()];
        this.SetInitTrajs(0);

        //MONITORING
        this.lastGetStateTickCount = 0;
        this.lastGetStateTimestamp = -1;
        this.savesystem = new SaveSystem();

        //TASKS
        this.tasks = [];
        this.taskWaiting = false;
        this.lastGetStateTimestamp = -1;
        this.HandleTasks();
    }

    HandleTasks(){
        if(this.tasks.length > 0){
            let completed = Task.Execute(this, this.tasks[0]);
            if(completed){
                this.tasks.shift();
            }
        }
        setImmediate(() => {this.HandleTasks()});
    }

    GetState(){
        let state = {};
        state.running = this.running;
        state.trajs = [];
        for(let i = 0; i < this.trajs.length; i++){
            state.trajs.push({});
            state.trajs[i].points = this.trajs[i].points;
            state.trajs[i].absCurves = this.trajs[i].absCurves;
        }
        if(this.lastGetStateTimestamp == -1){
            state.tps = 0;
        }else{
            state.tps = this.tickCount / (Date.now() - this.lastGetStateTimestamp);
        }

        this.lastGetStateTimestamp = Date.now();
        this.lastGetStateTickCount = 0;
        return state;
    }

    SetInitTrajs(count){
        if(this.running){return false;}
        this.trajs = [];
        for(let i = 0; i < count; i++){
            this.trajs.push(new Traj(true));
            let randomVal = Math.random();
            for(let j = 0; j < Track.extPoints.length; j++){
                this.trajs[i].laterals[j] = randomVal;
            }
            this.trajs[i].BuildPoints();
            this.trajs[i].CalcDists();
            this.trajs[i].CalcCurvature();
            this.trajs[i].isBuilt = true;
        }
        return true;
    }

    Start(){
        if(this.running){return false;}
        if(this.trajs.length == 0){
            console.warn("Tried to start engine without any trajs");
            return false;
        }
        this.running = true;
        this.lastGetStateTimestamp = -1;
        setImmediate(() => {this.Step()});
        return true;
    }

    Step(){
        let parentTrajIndex = Math.floor(Math.random()*this.trajs.length)
        let parentTraj = this.trajs[parentTrajIndex];
        parentTraj.Evaluate(this.evaluationMode);

        if(this.mutationMode == "bump"){
            let currentTraj = Traj.DeepCopy(parentTraj, false);
            for(let i = 0; i < this.maxMutationTries; i++){
                let mutationWindow = currentTraj.Mutate(this.mutationForce, this.mutationSemiLength, this.mutationMode);
                currentTraj.Evaluate(this.evaluationMode);
                if(currentTraj.evaluation < parentTraj.evaluation){
                    this.trajs[parentTrajIndex] = currentTraj;
                    break;
                }else{
                    currentTraj.ResetAsParent(parentTraj, mutationWindow[0], mutationWindow[1]);
                }
            }
        }

        this.tickCount += 1;
        if(this.running){
            setImmediate(() => {this.Step()});
        }
    }

    Stop(){
        if(!this.running){return false;}
        this.running = false;
        this.lastGetStateTimestamp = -1;
        return true;
    }

    ClearTasks(){
        this.taskWaiting = false;
        this.taskWaitingEndTime = -1;
        this.tasks = [];
        return true;
    }

    AddTasks(tasks){
        let validTasks = Task.ParseValidTasks(tasks);
        if(validTasks.length == 0){
            return false;
        }else{
            this.tasks = this.tasks.concat(validTasks);
            return true;
        }
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