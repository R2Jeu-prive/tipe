import { Track } from "../common_classes/track.js";
import { Car } from "../common_classes/car.js";
import { Traj } from "../common_classes/traj.js";
import { SaveSystem } from "./saveSystem.js";
import { TaskManager } from "./taskManager.js";
import { mod } from "../common_classes/utils.js";
import { getRandomMutationZoneSemiLength } from "../common_classes/utils.js";

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
        
        //SELECTION PARAMS
        this.evaluationMode = "time"; // fitness function
        this.elitismProportion = 0.03; // proportion of best trajs to keep in next generation
        this.selectionMode = "tournement"; // selection mode
        this.selectionPressure = 0.06; // between 0 and 1 : low values tend to give a chance to every traj for crossover, high values gives more importance to better trajs in selection
        this.parentCount = 2; // number of parents that win tournement and get selected for crossover
        this.crossoverSmoothZone = 15; // number of points for smooth crossover junction
        
        //MUTATION PARAMS
        this.mutationShiftProbability = 0.8; // chance for every child (excludes elit) to get shift mutated
        this.mutationBumpProbability = 0.8; // chance for every child (excludes elit) to bump get mutated
        this.mutationShiftForce = 0.3; // shift range in semilength zone
        this.mutationBumpForce = 0.3; // bump range in semilength
        
        //MUTATION ZONE
        this.mutationMinSemiLength = 1;
        this.mutationMedSemiLength = 40;
        this.mutationMaxSemiLength = 200;

        //BASE
        this.running = false;
        /** @type {Traj[]}*/
        this.trajs = [];

        //MONITORING
        this.firstGenTimestamp = -1;
        this.genCount = 0; // number of current gen
        this.currentExp = "none"; // if none than no monitoring data will be logged else it will be saved in the corresponding file in results
        this.lastGetStateTickCount = 0;
        this.lastGetStateTimestamp = -1;

        this.AddRandomConstantTrajs(200);
    }

    GetState(){
        let state = {};
        state.trackName = this.track.name
        state.running = this.running;
        state.trajs = [];
        for(let i = 0; i < this.trajs.length; i++){
            state.trajs.push(this.trajs[i]);//[TODO] optimise to send only data needed for front-end to rebuild traj, for now sending traj "as is" for debug purposes
            break;
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

    AddRandomConstantTrajs(count){
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

    AddRandomTrajs(count){
        if(this.running){return false;}
        let numOfCheckPoints = 100;
        let jitter = 0.2;
        for(let i = 0; i < count; i++){
            let newTraj = new Traj(this.track.n, true);
            let checkPoints = [];
            let checkPointValues = [];
            for(let j = 0; j < numOfCheckPoints; j++){
                checkPointValues.push(Math.sin(Math.random()*Math.PI/2)*Math.sin(Math.random()*Math.PI/2));
            }
            let randomShift = Math.floor(Math.random() * this.track.n);
            for(let j = 0; j < numOfCheckPoints; j++){
                checkPoints.push(Math.floor(j * this.track.n / numOfCheckPoints));
                checkPoints[j] += randomShift + Math.floor(Math.random() * jitter * this.track.n / numOfCheckPoints);
            }

            let nextCheckPoint = 1;
            let previousCheckPoint = 0;
            for(let j = checkPoints[0]; j < checkPoints[0] + this.track.n; j++){
                if(j == checkPoints[nextCheckPoint]){
                    newTraj.laterals[mod(j, this.track.n)] = checkPointValues[nextCheckPoint];
                    nextCheckPoint += 1;
                    previousCheckPoint += 1;
                    if(nextCheckPoint == numOfCheckPoints){
                        nextCheckPoint = 0;
                    }
                }else{
                    let alpha = 0;
                    if(nextCheckPoint == 0){
                        alpha = (j - checkPoints[previousCheckPoint]) / ((checkPoints[0] + this.track.n) - checkPoints[previousCheckPoint]);
                    }else{
                        alpha = (j - checkPoints[previousCheckPoint]) / (checkPoints[nextCheckPoint] - checkPoints[previousCheckPoint]);
                    }
                    alpha = Math.sin(alpha*Math.PI/2) * Math.sin(alpha*Math.PI/2);
                    let lat = alpha*checkPointValues[nextCheckPoint] + (1 - alpha)*checkPointValues[previousCheckPoint];
                    newTraj.laterals[mod(j, this.track.n)] = lat
                }
            }
            newTraj.Evaluate(this.evaluationMode, this.track, this.car);

            this.trajs.push(newTraj);
        }
        return true;
    }

    /**
     * Starts the genetic algorithm engine
     * @returns {Boolean} if engine start succeeded
     */
    Start(monitor){
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
        //STATS of current gen
        let genSize = this.trajs.length;
        let bestEval = Infinity;
        let avgEval = 0;
        for(let i = 0; i < genSize; i++){
            this.trajs[i].Evaluate(this.evaluationMode, this.track, this.car);
            avgEval += this.trajs[i].evaluation;
            if(this.trajs[i].evaluation < bestEval){
                bestEval = this.trajs[i].evaluation;
            }
        }
        avgEval /= genSize;

        console.log([bestEval, avgEval]);

        //ELITISM
        let children = [];
        let eliteIndexes = [];
        let nbOfEliteChildren = Math.floor(genSize * this.elitismProportion);
        if(nbOfEliteChildren > 0){
            for(let i = 0; i < genSize; i++){
                let rank = eliteIndexes.length;
                eliteIndexes.push(i);
                while(rank > 0 && this.trajs[eliteIndexes[rank]].evaluation < this.trajs[eliteIndexes[rank - 1]].evaluation){
                    //[OPTI] could be optimised to insert in ordered eliteIndexes with dichotomy instead of rank ascend
                    let temp = eliteIndexes[rank - 1];
                    eliteIndexes[rank - 1] = eliteIndexes[rank];
                    eliteIndexes[rank] = temp;
                    rank -= 1;
                }
                if(eliteIndexes.length == nbOfEliteChildren + 1){
                    eliteIndexes.pop();
                }
            }
        }
        for(let i = 0; i < eliteIndexes.length; i++){
            children.push(this.trajs[eliteIndexes[i]]);
        }

        //CROSSOVER
        while(children.length < genSize){
            //TOURNEMENT
            let parents = [];
            let potentialParentIndexes = [];
            let nbPotentialParents = 1 + Math.floor(genSize * this.selectionPressure);
            for(let i = 0; i < nbPotentialParents; i++){
                potentialParentIndexes.push(Math.floor(genSize * Math.random()))
            }
            while(parents.length < this.parentCount){
                let winnerIndex = potentialParentIndexes[0];
                let indexToRemove = 0;
                for(let i = 1; i < potentialParentIndexes.length; i++){
                    if(this.trajs[winnerIndex].evaluation > this.trajs[potentialParentIndexes[i]].evaluation){
                        winnerIndex = potentialParentIndexes[i];
                        indexToRemove = i;
                    }
                }
                if(potentialParentIndexes.length > 1){
                    potentialParentIndexes.splice(indexToRemove, 1);
                }
                parents.push(this.trajs[winnerIndex]);
            }

            let newChild = Traj.Crossover(parents, this.crossoverSmoothZone);
            newChild.Evaluate(this.evaluationMode, this.track, this.car);
            children.push(newChild);
        }

        //MUTATION BUMP
        for(let i = nbOfEliteChildren; i < genSize; i++){
            if(Math.random() > this.mutationBumpProbability){continue;}
            let mutationPoint = Math.floor(Math.random() * this.track.n);
            let mutationZoneSemiLength = getRandomMutationZoneSemiLength(this.mutationMinSemiLength, this.mutationMedSemiLength, this.mutationMaxSemiLength);
            children[i].MutateBump(mutationPoint, mutationZoneSemiLength, this.mutationBumpForce);
        }

        //MUTATION SHIFT
        for(let i = nbOfEliteChildren; i < genSize; i++){
            if(Math.random() > this.mutationBumpProbability){continue;}
            let mutationPoint = Math.floor(Math.random() * this.track.n);
            let mutationZoneSemiLength = getRandomMutationZoneSemiLength(this.mutationMinSemiLength, this.mutationMedSemiLength, this.mutationMaxSemiLength);
            children[i].MutateShift(mutationPoint, mutationZoneSemiLength, this.mutationShiftForce);
        }

        this.trajs = children;

        this.genCount += 1;
        console.log(this.genCount);
        if(this.running){
            setTimeout(() => {
                this.Step();
            }, "30");
        }
    }

    Stop(){
        if(!this.running){return false;}
        this.running = false;
        this.lastGetStateTimestamp = -1;
        return true;
    }
}
