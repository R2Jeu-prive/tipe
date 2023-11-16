let {Engine} = require("./engine");

class Task{
    static waiting = false;
    static waitStartTime = -1;

    static ParseValidTasks(str){
        const commandListRegex = /^([a-zAZ0-9 \.\-]*;)*$/g;
        const commandRegex = /^((start|stop|save)|(execute [a-zA-Z]+( [\-a-zA-Z0-9\.]+)?)|((waitNoProgress|wait) [1-9][0-9]?))$/g;
        const floatRegex = /^(\-)?[1-9]*[0-9](\.[0-9]+)?$/g;
        const float01Regex = /^(1|(0(\.[0-9]+)?))$/g;
        const strictPosIntRegex = /^[1-9][0-9]*$/g
        let validCommands = [];

        if(str.match(commandListRegex) == null){
            return [];
        }
        let commands = str.split(";");
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
                if(commandWords[1] == "initTrajs" && wordCount == 3 && commandWords[2].match(strictPosIntRegex) != null){
                    validCommands.push(commands[i]);
                    continue;
                }
                if(commandWords[1] == "setMutateWidth" && wordCount == 3 && commandWords[2].match(strictPosIntRegex) != null){
                    validCommands.push(substrs[i]);
                    continue;
                }
                return [];
            }
        }
        return validCommands;
    }

    /**
     * 
     * @param {Engine} engine 
     * @param {String} command 
     * @returns {Boolean} if command needs to be cleared
     */
    static Execute(engine,command){
        if(command.match(/^wait$/g) != null){
            if(Task.waiting && Task.waitEndTime > Date.now()){
                Task.waiting = 
            }

        }
        if(command.match(/^start/g) != null){
            console.log("Started Engine")
            engine.Start();
            return true;
        }
    }
}

module.exports = {Task};