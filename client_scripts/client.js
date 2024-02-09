import { ServerManager } from "./serverManager.js";
import { TrackViewer } from "./trackViewer.js";
import { UI } from "./ui.js";
import { ChartManager } from "./chartManager.js";

window.onload = () => {
    TrackViewer.Init();
    ChartManager.Init();
    UI.Init();
    ServerManager.RefreshState();
}
