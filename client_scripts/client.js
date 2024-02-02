import { ServerManager } from "./serverManager.js";
import { TrackViewer } from "./trackViewer.js";
import { UI } from "./ui.js";

window.onload = () => {
    TrackViewer.Init();
    UI.Init();
    ServerManager.RefreshState();
}
