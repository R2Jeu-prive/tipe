const fs = require("fs");
let {Traj} = require("../common_classes/traj");

class SaveSystem{
    constructor(){
        this.savedNames = [];
        this.RefreshSaves();
    }

    RefreshSaves(){
        this.savedNames = [];
        let trajsFileNames = fs.readdirSync("./results/trajs", {withFileTypes:true});
        for(let trajFile of trajsFileNames){
            if(trajFile.name.match(/\.dat$/)){
                this.savedNames.push(trajFile.name.split(".")[0]);
            }
        }
        console.log(this.savedNames);
    }

    /**
     * 
     * @param {Traj} traj 
     * @param {JSON} data
     * @param {String} prefix
     * @param {Boolean} timestampName
     */
    SaveTraj(traj, data, prefix = "testing_", timestampName = true){
        //we save two files : name.json and name.dat
        //first one contains few informations
        //second one contains n 64bit floats representing the laterals of the traj
        let fileName = timestampName ? prefix + Date.now() : prefix;
        let buf = new ArrayBuffer(8*traj.laterals.length);
        for(let i = 0; i < traj.laterals.length; i++){
            (new Float64Array(buf)[i]) = traj.laterals[i];
        }
        fs.writeFileSync(fileName + ".dat", new Uint8Array(buf));
        fs.writeFileSync(fileName + ".json", JSON.stringify(data), "utf-8");
        this.RefreshSavedFiles();
    }

    /*
    function load(){
        let buf = fs.readFileSync("test.dat");
        let lats = [];
        let n = buf.length/8;
        for(let i = 0; i < n; i++){
            let lat = new ArrayBuffer(8);
            for(let j = 0; j < 8; j++){
                (new Uint8Array(lat)[j]) = buf[8*i+j];
            }
            lats.push(new Float64Array(lat)[0]);
        }
        console.log(lats);
    }
    */
}

module.exports = {SaveSystem};