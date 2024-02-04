import { ServerManager } from "./serverManager.js";
import { TrackViewer } from "./trackViewer.js";

export class UI{
    static Init(){
        TrackViewer.canvasFore.addEventListener("mousedown", TrackViewer.MouseDown.bind(this));
        document.addEventListener("mousemove", TrackViewer.MouseMove.bind(this));
        document.addEventListener("mouseup", TrackViewer.MouseUp.bind(this));
        document.addEventListener("keydown", UI.KeyDown.bind(this));
        window.addEventListener("resize", function(){TrackViewer.needsRezise = true;});
        document.getElementById("clear-tasks").addEventListener("click", ServerManager.OrderClearTasks);
        document.getElementById("add-tasks").addEventListener("click", ServerManager.OrderAddTasks);
    }
    static KeyDown(e){
        if(e.key == "+" && !TrackViewer.panning){
            TrackViewer.zoom += 1;
            TrackViewer.panX *= 2;
            TrackViewer.panY *= 2;
            TrackViewer.needsDrawBack = true;
        }else if(e.key == "-" && !TrackViewer.panning){
            if(TrackViewer.zoom == -5){
                return;
            }
            TrackViewer.zoom -= 1;
            TrackViewer.panX /= 2;
            TrackViewer.panY /= 2;
            TrackViewer.needsDrawBack = true;
        }else if(e.key == " "){
            ServerManager.RefreshState();
        } 
    }
}
