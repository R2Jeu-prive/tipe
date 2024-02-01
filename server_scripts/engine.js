import { Track } from "../common_classes/track.js";
import { Traj } from "../common_classes/traj.js";
import { Villeneuve } from "../common_classes/villeneuve.js";
import { SaveSystem } from "./saveSystem.js";
import { TaskManager } from "./taskManager.js";

export class Engine{
    constructor(){
        //will be set by server when everything is created
        /** @type {TaskManager}*/
        this.taskManager = null;
        /** @type {SaveSystem}*/
        this.saveSystem = null;

        /** @type {Track}*/
        this.track = new Track(Villeneuve);

        //EVOLUTION
        this.mutationForce = 0.1;
        this.mutationSemiLength = 5;
        this.maxMutationTries = 100;
        this.evaluationMode = "curvature";
        this.mutationMode = "bump";

        //BASE
        this.running = false;
        /** @type {Traj[]}*/
        this.trajs = [];

        //MONITORING
        this.lastGetStateTickCount = 0;
        this.lastGetStateTimestamp = -1;
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

    ClearTrajs(){
        if(this.running){return false;}
        this.trajs = [];
        return true;
    }

    AddRandomTrajs(count){
        if(this.running){return false;}
        for(let i = 0; i < count; i++){
            let randomConstant = Math.random();
            let newTraj = new Traj(true);
            for(let j = 0; j < Track.extPoints.length; j++){
                newTraj.laterals[j] = randomConstant;
            }
            newTraj.BuildPoints();
            newTraj.CalcDists();
            newTraj.CalcCurvature();
            newTraj.isBuilt = true;

            this.trajs.push(newTraj);
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

        let currentTraj = Traj.DeepCopy(parentTraj, false);
        for(let i = 0; i < this.maxMutationTries; i++){
            let mutationWindow = [null, null]
            try{
                mutationWindow = currentTraj.Mutate(this.mutationForce, this.mutationSemiLength, this.mutationMode);
            }catch (e){
                continue;
            }
            currentTraj.Evaluate(this.evaluationMode);
            if(currentTraj.evaluation < parentTraj.evaluation){
                this.trajs[parentTrajIndex] = currentTraj;
                break;
            }else{
                currentTraj.ResetAsParent(parentTraj, mutationWindow[0], mutationWindow[1]);
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

    //////////////////////////////////////

    ClearTasks(){
        this.taskWaiting = false;
        this.taskWaitingEndTime = -1;
        this.tasks = [];
        return true;
    }

    AddTasks(tasks){
        let validTasks = Task.ParseValidTasks(tasks, this.saveSystem);
        if(validTasks.length == 0){
            return false;
        }else{
            this.tasks = this.tasks.concat(validTasks);
            return true;
        }
    }
}

module.exports = {Engine};
