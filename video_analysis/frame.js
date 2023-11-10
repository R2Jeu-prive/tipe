let pointings = [];
let frame;
let ctx;
let frames = [1200, 5799];
let img = new Image();

window.onload = () => {
    document.addEventListener("keydown", KeyDown.bind(this));
    document.addEventListener("mousedown", AddPointing.bind(this));
    ctx = document.getElementById("canvas").getContext("2d");
    img.addEventListener('load', function() {
        Refresh();
    });
    LoadFrame(5339);
    img.src = "../video_data/ver_lap_68/" + frame + ".jpg";
}

function Refresh(){
    ctx.clearRect(0, 0, 1536, 864);
    ctx.drawImage(img, 0, 0, 1536, 864);
    for(let i = 0; i < pointings.length; i++){
        let x = (pointings[i][0] + 0.5)*1536
        let y = (-pointings[i][1] + 0.5*864/1536)*1536
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x-5, y-5);
        ctx.lineTo(x+5, y+5);
        ctx.moveTo(x-5, y+5);
        ctx.lineTo(x+5, y-5);
        ctx.stroke();

        ctx.font = "12px serif";
        ctx.fillStyle = "#00ffff";
        ctx.fillText(i+1, x+7, y-7);
    }
}

function LoadFrame(id){
    frame = id;
    if(frame > frames[1]){frame = frame - frames[1] + frames[0];}
    if(frame < frames[0]){frame = frames[1] - frames[0] + frame;}
    pointings = [];
    img.src = "../video_data/ver_lap_68/" + frame + ".jpg";
    //refreshes on image load
}

function AddPointing(e){
    if(e.button != 0){return;}
    let u = e.pageX/1536 - 0.5;
    let v = -e.pageY/1536 + 0.5*864/1536;
    pointings.push([u,v]);
    Refresh();
}

function CopyPointings(){
    if(pointings.length != 4){
        alert("4 pointings needed");
        return;
    }

    let text = "###" + frame + "\n";
    for(let i = 0; i < 4; i++){
        for(let j = 0; j < 2; j++){
            text += pointings[i][j];
            text += "\n";
        }
    }
    navigator.clipboard.writeText(text);
}

function KeyDown(e){
    if(e.key == " "){
        pointings = [];
        Refresh();
    }else if(e.key == "c"){
        CopyPointings();
    }else if(e.key == "ArrowLeft"){
        LoadFrame(frame-1);
    }else if(e.key == "ArrowRight"){
        LoadFrame(frame+1);
    }else if(e.key == "ArrowUp"){
        LoadFrame(frame+50);
    }else if(e.key == "ArrowDown"){
        LoadFrame(frame-50);
    }
}