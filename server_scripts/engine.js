import { Track } from "../common_classes/track.js";
import { Car } from "../common_classes/car.js";
import { Traj } from "../common_classes/traj.js";
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
        this.track = new Track("Villeneuve");

        /** @type {Car}*/
        this.car = new Car("Clio");

        //EVOLUTION
        this.mutationForce = 0.1;
        this.mutationSemiLength = 5;
        this.maxMutationTries = 1000;
        this.evaluationMode = "time";
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
        state.trackName = this.track.name
        state.running = this.running;
        state.trajs = [];
        for(let i = 0; i < this.trajs.length; i++){
            state.trajs.push(this.trajs[i]);//[TODO] optimise to send only data needed for front-end to rebuild traj, for now sending traj "as is" for debug purposes
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
            let newTraj = new Traj(this.track.n, true);
            for(let j = 0; j < this.track.n; j++){
                newTraj.laterals[j] = randomConstant;
            }
            newTraj.Evaluate(this.evaluationMode, this.track, this.car);

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
        parentTraj.Evaluate(this.evaluationMode, this.track, this.car);

        let currentTraj = Traj.DeepCopy(parentTraj, false);
        let i;
        for(i = 0; i < this.maxMutationTries; i++){
            let mutationWindow = [null, null]
            try{
                mutationWindow = currentTraj.Mutate(this.mutationForce, this.mutationSemiLength, this.mutationMode);
            }catch (e){
                continue;
            }
            currentTraj.Evaluate(this.evaluationMode, this.track, this.car);
            if(currentTraj.evaluation < parentTraj.evaluation){
                this.trajs[parentTrajIndex] = currentTraj;
                break;
            }else{
                currentTraj.ResetAsParent(parentTraj, mutationWindow[0], mutationWindow[1]);
            }
        }
        if(i == this.maxMutationTries){
            console.log("reached max mutation Tries");
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
}
