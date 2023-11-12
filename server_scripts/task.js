class Task{
    constructor(fullCommand_){
        //TODO robust parse check of command
        this.fullCommand = fullCommand_;
        this.command = fullCommand_.split(" "); //start, stop, save, setparam, waitnoprogress
    }
}

module.exports = {Task};