let {Engine} = require("./engine");

class Task{
    static waiting = false;
    static waitStartTime = -1;

    static ParseValidTasks(str){
        const commandListRegex = /^([a-zAZ0-9 \.\-]*;\n)*$/g;
        const commandRegex = /^((start|stop|save)|(execute [a-zA-Z]+( [\-a-zA-Z0-9\.]+)?)|((waitNoProgress|wait) [1-9][0-9]?))$/g;
        const floatRegex = /^(\-)?[1-9]*[0-9](\.[0-9]+)?$/g;
        const float01Regex = /^(1|(0(\.[0-9]+)?))$/g;
        const strictPosIntRegex = /^[1-9][0-9]*$/g
        let validCommands = [];

        if(str.match(commandListRegex) == null){
            return [];
        }
        let commands = str.split(";\n");
        commands.pop();//remove last empty command
        for(let i = 0; i < commands.length; i++){
            if(commands[i].match(commandRegex) == null){
                return [];
            }
            let commandWords = commands[i].split(" ");
            let wordCount = commandWords.length
            if(commandWords[0] == "execute"){
                if(commandWords[1] == "clearTrajs" && wordCount == 2){
                    validCommands.push(commands[i]);
                    continue;
                }
                if(commandWords[1] == "setRandomTrajs" && wordCount == 3 && commandWords[2].match(strictPosIntRegex) != null){
                    validCommands.push(commands[i]);
                    continue;
                }
                if(commandWords[1] == "setMutateWidth" && wordCount == 3 && commandWords[2].match(strictPosIntRegex) != null){
                    validCommands.push(substrs[i]);
                    continue;
                }
                return [];
            }
            if(commandWords[0] == "start" || commandWords[0] == "stop" || commandWords[0] == "save" || commandWords[0] == "wait"){
                validCommands.push(commands[i]);
                continue;
            }
        }
        return validCommands;
    }

    /**
     * 
     * @param {Engine} engine 
     * @param {String} command 
     * @returns true if command can be cleared
     */
    static Execute(engine, command){
        if(command.match(/^wait/g) != null){
            if(Task.waiting && Task.waitEndTime <= Date.now()){
                Task.waiting = false;
                Task.waitEndTime = -1;
                return true;
            }
            if(Task.waiting){
                return false;
            }
            Task.waiting = true;
            Task.waitEndTime = Date.now() + 1000*parseInt(command.split(" ")[1]);
            console.log("Waiting " + command.split(" ")[1] + "s");
            return false;
        }
        if(command.match(/^start/g) != null){
            if(engine.Start()){
                console.log("Started Engine");
            }else{
                console.error("Auto Task Failed: " + command);
            }
            return true;
        }
        if(command.match(/^stop/g) != null){
            if(engine.Stop()){
                console.log("Stopped Engine");
            }else{
                console.error("Auto Task Failed: " + command);
            }
            return true;
        }
        if(command.match(/^execute clearTrajs/g)){
            if(engine.SetInitTrajs(0)){
                console.log("Cleared Trajs")
            }else{
                console.error("Auto Task Failed: " + command);
            }
            return true;
        }
        if(command.match(/^execute setRandomTrajs/g)){
            let nb = parseInt(command.split(" ")[2]);
            if(engine.SetInitTrajs(nb)){
                console.log("Init " + nb + " Trajs");
            }else{
                console.error("Auto Task Failed: " + command);
            }
            return true;
        }
        console.error("Command Not Implemented");
        return true;
    }
}

module.exports = {Task};