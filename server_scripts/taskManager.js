import { Engine } from "./engine.js";
import { SaveSystem } from "./saveSystem.js";
import { Traj } from "../common_classes/traj.js";

export class TaskManager{
    constructor(){
        //will be set by server when everything is created
        /** @type {Engine}*/
        this.engine = null;
        /** @type {SaveSystem}*/
        this.saveSystem = null;

        /** @type {String[]}*/
        this.tasks = []
        this.waiting = false;
        this.waitEndTime = -1;
    }

    /**
     * this is the main task loop
     */
    HandleTasks(){
        if(this.waiting){
            if(this.waitEndTime < Date.now()){
                this.waiting = false;
                this.waitEndTime = -1;
            }
        }else if(this.tasks.length > 0){
            let completed = this.RunTopTask();
            if(completed){
                this.tasks.shift();
            }
        }
        setImmediate(() => {this.HandleTasks()});
    }

    /**
     * clears all tasks and resets waiting status
     */
    ClearTasks(){
        this.tasks = [];
        this.waiting = false;
        this.waitEndTime = -1;
    }

    /**
     * Adds tasks given in str to tasks array if they are correctly formated
     * @param {String} str 
     * @returns {Boolean} true if all commands are valid and were added to tasks array, false if one failed and everything was aborted
     */
    ParseCheckAndAddTasks(str){
        const commandListRegex = /^([a-zA-Z0-9 _\.\-]*;\n)+$/g;
        const float01Regex = /^(1|(0(\.[0-9]+)?))$/g;
        const strictPosIntRegex = /^[1-9][0-9]*$/g;
        const posIntRegex = /^(0|([1-9][0-9]*))$/g;
        const mutationModeRegex = /^(bump|wind)$/g;
        const boolRegex = /^(true|false)$/g;
        const simpleStringRegex = /^[a-zA-Z0-9]+$/g;
        const trajNameRegex = /^[a-zA-Z0-9]+_[0-9]+$/g
        let validCommands = [];

        if(str.match(commandListRegex) == null){
            return false;//this string doesn't look like a command list
        }
        let commands = str.split(";\n");
        commands.pop();//remove last empty command
        for(let i = 0; i < commands.length; i++){
            let words = commands[i].split(" ");
            let nbWords = words.length;
            if(nbWords == 1){
                if(words[0] == "start"){validCommands.push(commands[i]);continue;}
                if(words[0] == "stop"){validCommands.push(commands[i]);continue;}
                if(words[0] == "clearTrajs"){validCommands.push(commands[i]);continue;}
            }else if(nbWords == 2){
                if(words[0] == "wait"
                && words[1].match(strictPosIntRegex) != null){validCommands.push(commands[i]);continue;}

                if(words[0] == "setMutationSemiLength"
                && words[1].match(posIntRegex) != null){validCommands.push(commands[i]);continue;}

                if(words[0] == "setMutationForce"
                && words[1].match(float01Regex) != null){validCommands.push(commands[i]);continue;}

                if(words[0] == "setMutationMode"
                && words[1].match(mutationModeRegex) != null){validCommands.push(commands[i]);continue;}

                if(words[0] == "addRandomTrajs"
                && words[1].match(strictPosIntRegex) != null){validCommands.push(commands[i]);continue;}

                if(words[0] == "addTraj"
                && words[1].match(trajNameRegex) != null){validCommands.push(commands[i]);continue;}

                if(words[0] == "runExp"
                && words[1].match(simpleStringRegex) != null){validCommands.push(commands[i]);continue;}
            }else if(nbWords == 3){
                if(words[0] == "save"
                && words[1].match(simpleStringRegex) != null
                && words[2].match(boolRegex) != null){validCommands.push(commands[i]);continue;}
            }
            return false;//this command is not correctly formated
        }
        this.tasks = this.tasks.concat(validCommands);
        return true;
    }

    /**
     * Tries to run top task in tasks array
     * @returns true if command can be cleared from tasks array
     */
    RunTopTask(){
        let command = this.tasks[0];
        if(command.match(/^wait/g) != null){
            this.waitEndTime = Date.now() + 1000*parseInt(command.split(" ")[1]);
            this.waiting = true;
            console.log("Waiting " + command.split(" ")[1] + "s");
            return true;
        }
        if(command.match(/^start/g) != null){
            if(this.engine.Start()){
                console.log("Started Engine");
            }else{
                console.error("Task Failed: " + command);
            }
            return true;
        }
        if(command.match(/^stop/g) != null){
            if(this.engine.Stop()){
                console.log("Stopped Engine");
            }else{
                console.error("Auto Task Failed: " + command);
            }
            return true;
        }
        if(command.match(/^clearTrajs/g)){
            if(this.engine.ClearTrajs()){
                console.log("Cleared Trajs")
            }else{
                console.error("Auto Task Failed: " + command);
            }
            return true;
        }
        if(command.match(/^addRandomTrajs/g)){
            let count = parseInt(command.split(" ")[1]);
            if(this.engine.AddRandomTrajs(count)){
                console.log("Added " + count + " random traj(s)");
            }else{
                console.error("Auto Task Failed: " + command);
            }
            return true;
        }
        if(command.match(/^addTraj/g)){
            let trajName = command.split(" ")[1];
            if(!this.engine.running){
                let loadedTraj = this.saveSystem.LoadTraj(trajName);
                if(loadedTraj.n != this.engine.track.n){
                    console.error("Auto Task Failed because traj and track are not the same size !");
                }else{
                    loadedTraj.Shift(this.engine.track.startOffset);
                    loadedTraj.BuildPoints(this.engine.track);
                    loadedTraj.Evaluate(this.engine.evaluationMode, this.engine.track, this.engine.car);
                    this.engine.trajs.push(loadedTraj);
                    console.log("Loaded Traj " + trajName);
                }
            }else{
                console.error("Auto Task Failed: " + command);
            }
            return true;
        }
        if(command.match(/^save/g)){
            let bestTraj = this.engine.trajs[0];//[CHECK]
            let prefix = command.split(" ")[1];
            let saveJson = {
                time : Date.now(),
                evaluation: bestTraj.evaluation,
                evaluationMode: this.engine.evaluationMode,
                evolutionTime : Date.now() - bestTraj.creationTimestamp,//[CHECK]
                mutationSemiLength: engine.mutationSemiLength,
                mutationMode: engine.mutationMode,
                mutationForce: engine.mutationForce,
                savedLaterals: command.split(" ")[2] == "true"
            }
            this.engine.saveSystem.SaveTraj(bestTraj, saveJson, prefix, command.split(" ")[2] == "true");
            return true;
        }
        if(command.match(/^runExp/g)){
            let expName = command.split(" ")[1];
            let expCommands = this.saveSystem.FetchExperiment(expName);
            if(this.ParseCheckAndAddTasks(expCommands)){
                console.log("Added experiment " + expName + " to queue");
            }else{
                console.error("TaskManager : Failed to run runexp task because parsing failed");
            }
            return true;
        }
        if(command.match(/^setMutationSemiLength/)){
            //TODO CHECK ENGINE RUNNING
            this.engine.mutationSemiLength = parseInt(command.split(" ")[1]);
            console.log("mutationSemiLength = " + engine.mutationSemiLength);
            return true;
        }
        if(command.match(/^setMutationForce/)){
            engine.mutationForce = parseFloat(command.split(" ")[1]);
            console.log("mutationForce = " + engine.mutationForce);
            return true;
        }
        if(command.match(/^setMutationMode/)){
            engine.mutationMode = command.split(" ")[1];
            console.log("mutationMode = " + engine.mutationMode);
            return true;
        }
        console.error("Command Not Implemented");
        return true;
    }
}
