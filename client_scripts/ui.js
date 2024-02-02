import { ServerManager } from "./serverManager.js";
import { TrackViewer } from "./trackViewer.js";

export class UI{
    static Init(){
        TrackViewer.canvasFore.addEventListener("mousedown", TrackViewer.MouseDown.bind(this));
        document.addEventListener("mousemove", TrackViewer.MouseMove.bind(this));
        document.addEventListener("mouseup", TrackViewer.MouseUp.bind(this));
        document.addEventListener("keydown", TrackViewer.KeyDown.bind(this));
        window.addEventListener("resize", function(){TrackViewer.needsRezise = true;});
        document.getElementById("clear-tasks").addEventListener("click", ServerManager.OrderClearTasks);
        document.getElementById("add-tasks").addEventListener("click", ServerManager.OrderAddTasks);
    }
}