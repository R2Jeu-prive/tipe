const fs = require("fs");
let {Traj} = require("../common_classes/traj");

class SaveSystem{
    constructor(){
        this.savedTrajs = [];
    }

    RefreshSaves(){
        this.savedTrajs = [];
        let trajsFileNames = fs.readdirSync("./results/trajs", {withFileTypes:true});
        for(let trajFile of trajsFileNames){
            if(trajFile.name.match(/\.dat$/)){
                this.savedTrajs.push(trajFile.name.split(".")[0]);
            }
        }
    }

    /**
     * 
     * @param {Traj} traj 
     * @param {JSON} data
     * @param {String} prefix
     * @param {Boolean} timestampName
     */
    SaveTraj(traj, data, prefix = "testing", saveLaterals = false){
        //we save one or two files : name.json and name.dat
        //first one contains few informations
        //second one contains n 64bit floats representing the laterals of the traj
        //let fileName = timestampName ? prefix + "_" + Date.now() : prefix;
        let fileName = prefix + "_" + Date.now();
        let buf = new ArrayBuffer(8*traj.laterals.length);
        for(let i = 0; i < traj.laterals.length; i++){
            (new Float64Array(buf)[i]) = traj.laterals[i];
        }
        if(saveLaterals){
            fs.writeFileSync("./results/trajs/" + fileName + ".dat", new Uint8Array(buf));
            data.fileName = fileName;
        }
        fs.writeFileSync("./results/logs/"+ prefix + ".txt", JSON.stringify(data) + "\n", {flag:'a'});
    }

    FetchExperiment(expName){
        let commands = "wait 6;\n";
        try{
            commands = commands + fs.readFileSync("./results/experiments/" + expName + ".txt", { encoding: 'utf8', flag: 'r' });
        }catch(e){
            console.warn("failed to find experiment");
        }
        return commands.replace(/\r/g,"");
    }

    LoadTraj(trajName = "bravo_1702361679064", evaluationMode = "dont"){
        let buf = fs.readFileSync("./results/trajs/" + trajName + ".dat");
        let lats = [];
        let n = buf.length/8;
        for(let i = 0; i < n; i++){
            let lat = new ArrayBuffer(8);
            for(let j = 0; j < 8; j++){
                (new Uint8Array(lat)[j]) = buf[8*i+j];
            }
            lats.push(new Float64Array(lat)[0]);
        }
        let loadedTraj = new Traj(true);
        loadedTraj.laterals = lats;
        loadedTraj.BuildPoints();
        if(evaluationMode != "dont"){
            loadedTraj.Evaluate(evaluationMode);
        }
        return loadedTraj;
    }
}

module.exports = {SaveSystem};