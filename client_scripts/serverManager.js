import { Track } from "../common_classes/track.js";
import { Traj } from "../common_classes/traj.js";
import { ChartManager } from "./chartManager.js";
import { TrackViewer } from "./trackViewer.js";

export class ServerManager{
    /** @type {Track} */
    static track = new Track("Villeneuve");
    /** @type {Traj[]} */
    static trajs = [];
    static engineRunning = false;
    static engineTps = -1;

    static async RefreshState(){
        let response = await fetch("/state", {
            method: "GET"
        });
        let state = await response.json();
        if(ServerManager.track.name != state.trackName){
            ServerManager.track = new Track(state.trackName);
        }
        ServerManager.trajs = state.trajs;
        console.log(ServerManager.trajs);
        ServerManager.engineRunning = state.running;
        ServerManager.engineTps = state.tps
        TrackViewer.needsDrawBack = true;
        ChartManager.Refresh();
    }

    static async OrderClearTasks(){
        document.getElementById("clear-tasks").blur();
        let userPassword = document.getElementById("password").value;
        let response = await fetch("/cleartasks", {
            method: "POST",
            body:JSON.stringify({password:userPassword})
        });
        let notifs = {401:"Incorrect Password", 200:"Tasks Clear"};
        if(response.status == 200){
            console.log(notifs[response.status]);
        }else{
            console.log(notifs[response.status]);
            alert(notifs[response.status]);
        }
    }

    static async OrderAddTasks(){
        document.getElementById("add-tasks").blur();
        let userPassword = document.getElementById("password").value;
        let taskList = document.getElementById("tasks").value;
        let response = await fetch("/addtasks", {
            method: "POST",
            body:JSON.stringify({password:userPassword, taskList:taskList})
        });
        let notifs = {401:"Incorrect Password", 400:"Syntax Error", 200:"Tasks Added"};
        if(response.status == 200){
            console.log(notifs[response.status]);
        }else{
            console.log(notifs[response.status]);
            alert(notifs[response.status]);
        }
    }
}
