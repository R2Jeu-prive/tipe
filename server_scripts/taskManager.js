import { Engine } from "./engine.js";
import { SaveSystem } from "./saveSystem.js";

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
        const commandListRegex = /^([a-zA-Z0-9 _\.\-\[\]\,]*;\n)+$/g;
        const float01Regex = /^(1|(0(\.[0-9]+)?))$/g;
        const float01ListRegex = /^\[((1|(0(\.[0-9]+)?))\,)+\]$/g;
        const floatRegex = /^([1-9]?[0-9]*(\.[0-9]+)?)$/g;
        const floatListRegex = /^\[(([1-9]?[0-9]*(\.[0-9]+)?)\,)+\]$/g;
        const strictPosIntRegex = /^[1-9][0-9]*$/g;
        const strictPosIntListRegex = /^\[([1-9][0-9]*\,)+\]$/g;
        const evaluationModeRegex = /^(time)|(curvature)|(distance)$/g;
        const simpleStringRegex = /^[a-zA-Z0-9]+$/g;
        const trajNameRegex = /^[a-zA-Z0-9]+_[0-9]+$/g;
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
                if(words[0] == "start"){validCommands.push(commands[i] + " none");continue;}
                if(words[0] == "stop"){validCommands.push(commands[i] + " -1");continue;}
                if(words[0] == "waitStopped"){validCommands.push(commands[i]);continue;}
                if(words[0] == "clearTrajs"){validCommands.push(commands[i]);continue;}
            }else if(nbWords == 2){
                if(words[0] == "wait"
                && words[1].match(strictPosIntRegex) != null){validCommands.push(commands[i]);continue;}

                if(words[0] == "start"
                && words[1].match(simpleStringRegex) != null){validCommands.push(commands[i]);continue;}

                if(words[0] == "stop"
                && words[1].match(strictPosIntRegex) != null){validCommands.push(commands[i]);continue;}

                if(words[0] == "addRandomTrajs"
                && words[1].match(strictPosIntRegex) != null){validCommands.push(commands[i]);continue;}

                if(words[0] == "addRandomConstantTrajs"
                && words[1].match(strictPosIntRegex) != null){validCommands.push(commands[i]);continue;}

                if(words[0] == "addTraj"
                && words[1].match(trajNameRegex) != null){validCommands.push(commands[i]);continue;}

                if(words[0] == "runExp"
                && words[1].match(simpleStringRegex) != null){validCommands.push(commands[i]);continue;}

                if(words[0] == "saveBestTraj"
                && words[1].match(simpleStringRegex) != null){validCommands.push(commands[i]);continue;}
            }else if(nbWords == 3){

                if(words[0] == "setParam"){
                    if(words[1] == "evaluationMode" && words[2].match(evaluationModeRegex) != null){validCommands.push(commands[i]);continue;}

                    if(words[1] == "parentCount" && words[2].match(strictPosIntRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "selectionPressure" && words[2].match(floatRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "mutationShiftProbability" && words[2].match(floatRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "mutationBumpProbability" && words[2].match(floatRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "mutationShiftForce" && words[2].match(float01Regex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "mutationBumpForce" && words[2].match(float01Regex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "elitismProportion" && words[2].match(float01Regex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "mutationMinSemiLength" && words[2].match(strictPosIntRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "mutationMedSemiLength" && words[2].match(strictPosIntRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "mutationMaxSemiLength" && words[2].match(strictPosIntRegex) != null){validCommands.push(commands[i]);continue;}
                }
                if(words[0] == "setRandomParam"){
                    if(words[1] == "parentCount" && words[2].match(strictPosIntListRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "selectionPressure" && words[2].match(floatListRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "mutationShiftProbability" && words[2].match(floatListRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "mutationBumpProbability" && words[2].match(floatListRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "mutationShiftForce" && words[2].match(float01ListRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "mutationBumpForce" && words[2].match(float01ListRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "elitismProportion" && words[2].match(float01ListRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "mutationMinSemiLength" && words[2].match(strictPosIntListRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "mutationMedSemiLength" && words[2].match(strictPosIntListRegex) != null){validCommands.push(commands[i]);continue;}
                    if(words[1] == "mutationMaxSemiLength" && words[2].match(strictPosIntListRegex) != null){validCommands.push(commands[i]);continue;}
                }
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
        if(command.match(/^wait /g) != null){
            this.waitEndTime = Date.now() + 1000*parseInt(command.split(" ")[1]);
            this.waiting = true;
            console.log("Waiting " + command.split(" ")[1] + "s");
            return true;
        }
        if(command.match(/^waitStopped/g) != null){
            return !this.engine.running;
        }
        if(command.match(/^start/g) != null){
            let logName = command.split(" ")[1];
            if(this.engine.Start(logName)){
                console.log("Started Engine");
            }else{
                console.error("Task Failed: " + command);
            }
            return true;
        }
        if(command.match(/^stop/g) != null){
            let stopGen = parseInt(command.split(" ")[1]);
            if(stopGen == -1){ // requested immediate stop
                if(this.engine.Stop()){
                    console.log("Stopped Engine");
                }else{
                    console.error("Auto Task Failed: " + command);
                }
            }else{
                this.engine.stopGen = stopGen;
                console.log("Engine will stop at gen " + stopGen);
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
        if(command.match(/^addRandomConstantTrajs/g)){
            let count = parseInt(command.split(" ")[1]);
            if(this.engine.AddRandomConstantTrajs(count)){
                console.log("Added " + count + " random constant traj(s)");
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
        if(command.match(/^saveBestTraj/g)){
            let bestTraj = this.engine.trajs[0];
            let prefix = command.split(" ")[1];
            let saveJson = {
                time : Date.now(),
                engineParamsAndStats : this.engine.GetEngineParamsAndStats(),
                evaluation: bestTraj.evaluation,
            }
            this.engine.saveSystem.SaveTraj(bestTraj, saveJson, prefix);
            return true;
        }
        if(command.match(/^runExp/g)){
            let expName = command.split(" ")[1];
            let expCommands = this.saveSystem.FetchExperiment(expName);
            if(this.ParseCheckAndAddTasks(expCommands)){
                console.log("Added experiment " + expName + " to queue");
                return true;
            }else{
                console.error("TaskManager : Failed to run runexp task because parsing failed");
                return false;
            }
        }
        if(command.match(/^setParam/)){
            if(this.engine.running){
                console.error("TaskManager : Failed to modify param because engine is running");
                return false;
            }
            let param = command.split(" ")[1];
            let paramValue = command.split(" ")[2];
            if(param == "parentCount"){this.engine.parentCount = parseInt(paramValue);}
            if(param == "evaluationMode"){this.engine.evaluationMode = paramValue;}
            if(param == "selectionPressure"){this.engine.selectionPressure = parseFloat(paramValue);}
            if(param == "mutationShiftProbability"){this.engine.mutationShiftProbability = parseFloat(paramValue);}
            if(param == "mutationBumpProbability"){this.engine.mutationBumpProbability = parseFloat(paramValue);}
            if(param == "mutationShiftForce"){this.engine.mutationShiftForce = parseFloat(paramValue);}
            if(param == "mutationBumpForce"){this.engine.mutationBumpForce = parseFloat(paramValue);}
            if(param == "elitismProportion"){this.engine.selectionPressure = parseFloat(paramValue);}
            if(param == "mutationMinSemiLength"){this.engine.mutationMinSemiLength = parseInt(paramValue);}
            if(param == "mutationMedSemiLength"){this.engine.mutationMedSemiLength = parseInt(paramValue);}
            if(param == "mutationMaxSemiLength"){this.engine.mutationMaxSemiLength = parseInt(paramValue);}

            console.log("TaskManager : Modified " + param + " to " + paramValue);
            return true;
        }
        if(command.match(/^setRandomParam/)){
            if(this.engine.running){
                console.error("TaskManager : Failed to modify param because engine is running");
                return false;
            }
            let param = command.split(" ")[1];
            let paramValues = command.split(" ")[2].slice(1, -2).split(",");
            let randomIndex = Math.floor(Math.random()*paramValues.length)
            let paramValue = paramValues[randomIndex];
            if(param == "parentCount"){this.engine.parentCount = parseInt(paramValue);}
            if(param == "selectionMode"){this.engine.selectionMode = paramValue;}
            if(param == "selectionPressure"){this.engine.selectionPressure = parseFloat(paramValue);}
            if(param == "mutationShiftProbability"){this.engine.mutationShiftProbability = parseFloat(paramValue);}
            if(param == "mutationBumpProbability"){this.engine.mutationBumpProbability = parseFloat(paramValue);}
            if(param == "mutationShiftForce"){this.engine.mutationShiftForce = parseFloat(paramValue);}
            if(param == "mutationBumpForce"){this.engine.mutationBumpForce = parseFloat(paramValue);}
            if(param == "elitismProportion"){this.engine.selectionPressure = parseFloat(paramValue);}
            if(param == "mutationMinSemiLength"){this.engine.mutationMinSemiLength = parseInt(paramValue);}
            if(param == "mutationMedSemiLength"){this.engine.mutationMedSemiLength = parseInt(paramValue);}
            if(param == "mutationMaxSemiLength"){this.engine.mutationMaxSemiLength = parseInt(paramValue);}

            console.log("TaskManager : Modified " + param + " to " + paramValue);
            return true;
        }
        console.error("Command Not Implemented");
        return true;
    }
}
