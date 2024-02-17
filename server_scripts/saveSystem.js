import * as fs from "fs";
import { Traj } from "../common_classes/traj.js";
import { mod } from "../common_classes/utils.js";
import { Engine } from "./engine.js";
import { TaskManager } from "./taskManager.js";
import { exit } from "node:process";

export class SaveSystem{
    constructor(){
        //will be set by engine once everything is created
        /** @type {Engine}*/
        this.engine = null;
        /** @type {TaskManager}*/
        this.taskManager = null;

        /** @type {Traj[]}*/
        this.savedTrajs = [];

        this.RefreshSaves();
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
     * Saves a traj with its laterals and additional data
     * @param {Traj} traj to save
     * @param {Object} data attributes to save to the log file
     * @param {String} prefix experiment that has generated this traj or any other prefix to group saved trajs
     */
    SaveTraj(traj, data, prefix = "testing"){
        //we write data in two files : list.txt and [prefix]_[timestamp].dat
        //in first file we add a line referencing this traj with additional data
        //in second file we write n 64bit floats representing the laterals of the traj
        try{
            let fileName = prefix + "_" + Date.now();
            data.fileName = fileName;
            let buf = new ArrayBuffer(8*traj.n);
            for(let i = 0; i < traj.n; i++){
                (new Float64Array(buf)[i]) = traj.laterals[mod(i - this.engine.track.startOffset, this.engine.track.n)];
            }
            console.log(buf);
            console.log(traj.laterals.length);
            fs.writeFileSync("./results/trajs/" + fileName + ".dat", new Uint8Array(buf));
            fs.writeFileSync("./results/trajs/list.txt", JSON.stringify(data) + "\n", {flag:'a'});
        }catch(e){
            console.error(e);
            console.error("SaveSystem : SaveTraj failed and could be critical so exiting");
            exit(1);
        }
    }
    /**
     * Logs experiment results or other in an experiment log file
     * @param {Object} data to be saved
     * @param {String} experiment to save in the correct file
     */
    SaveLog(data, experiment){
        try{
            fs.writeFileSync("./results/logs/" + experiment + ".txt", JSON.stringify(data) + "\n", {flag:'a'});
        }catch(e){
            console.error(e);
            console.error("SaveSystem : SaveLog failed and could be critical so exiting");
            exit(1);
        }
    }

    /**
     * 
     * @param {String} expName name of the experiment to load
     * @returns the string containing all commands of the experiment
     */
    FetchExperiment(expName){
        let commands = "wait 3;\n";
        try{
            commands = commands + fs.readFileSync("./results/experiments/" + expName + ".txt", { encoding: 'utf8', flag: 'r' });
        }catch(e){
            console.error(e);
            console.error("SaveSystem : failed to find experiment");
        }
        return commands.replace(/\r/g,"");
    }

    /**
     * @param {String} trajName the name of the traj to load as prefix_timestamp
     * @returns {Traj} a traj that is set with the saved laterals
     */
    LoadTraj(trajName){
        try{
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
            let loadedTraj = new Traj(n, true);
            loadedTraj.laterals = lats;
            return loadedTraj;
        }catch(e){
            console.error(e);
            console.error("SaveSystem : LoadTraj failed")
            return new Traj(1, false);//giving traj of length 1 to raise higher warning
        }
    }
}
